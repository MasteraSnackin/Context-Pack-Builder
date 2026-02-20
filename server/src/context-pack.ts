import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env.js";
import type { Resource, ContextPack } from "./types.js";
import path from "path";
import { fileURLToPath } from "url";

// Re-export shared types for consumers of this module
export type { Resource, ContextPack };

// Resolve the demo-repo directory relative to this file (Bug #4 fix)
// Falls back to SEARCH_ROOT env var so the caller can override in production
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEARCH_ROOT = process.env.SEARCH_ROOT ??
  path.resolve(__dirname, "../../demo-repo");

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: env.ANTHROPIC_API_KEY,
});

/**
 * Main orchestration function: builds a complete context pack
 */
export async function buildContextPack(
  _userId: string, // prefixed with _ — kept for API compatibility, not currently used in logic
  goal: string
): Promise<ContextPack> {
  try {
    // Step 1: Gather raw resources from MCP servers
    const filesystemResources = await callFilesystemMcp(goal);
    const gitResources = await callGitMcp(goal);

    const allRawResources = [...filesystemResources, ...gitResources];

    // Step 2: Aggregate with LLM
    const aggregatedPack = await aggregateWithLLM(goal, allRawResources);

    // Step 3: Return the context pack (saving to DB will be done in server.ts)
    return {
      id: crypto.randomUUID(),
      title: goal,
      ...aggregatedPack,
    };
  } catch (error) {
    console.error("Error building context pack:", error);

    // Fallback: return basic pack without LLM
    return {
      id: crypto.randomUUID(),
      title: goal,
      summary: `Context pack for: ${goal}`,
      resources: [],
      openQuestions: ["Unable to gather resources at this time"],
      nextActions: ["Please try again"],
    };
  }
}

/**
 * Search files via Filesystem MCP server
 */
async function callFilesystemMcp(goal: string): Promise<Resource[]> {
  try {
    // Extract keywords from goal (simple implementation)
    const keywords = goal
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3) // Filter out short words
      .slice(0, 5); // Limit to 5 keywords

    if (keywords.length === 0) {
      return [];
    }

    // Initialize MCP client for filesystem server
    // Bug #4 fix: search SEARCH_ROOT (demo-repo), not the server process cwd
    const transport = new StdioClientTransport({
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-filesystem",
        SEARCH_ROOT, // ✅ Searches the correct target directory
      ],
    });

    const client = new Client(
      {
        name: "context-pack-builder",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);

    // Search for files matching keywords
    const searchQuery = keywords.join(" ");
    const result = await client.callTool({
      name: "search_files",
      arguments: {
        path: SEARCH_ROOT, // ✅ Same corrected path
        pattern: searchQuery,
      },
    });

    // Close connection
    await client.close();

    // Parse results and convert to Resource format
    const resources: Resource[] = [];

    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === "text" && item.text) {
          // Parse file paths from result
          const lines = item.text.split("\n").filter((line: string) => line.trim());

          for (const line of lines.slice(0, 10)) { // Limit to 10 files
            const filePath = line.trim();
            if (filePath) {
              const type = detectFileType(filePath);
              resources.push({
                type,
                title: filePath.split(/[/\\]/).pop() || filePath,
                url: filePath,
                snippet: `File: ${filePath}`,
              });
            }
          }
        }
      }
    }

    return resources;
  } catch (error) {
    console.error("Filesystem MCP error:", error);
    return [];
  }
}

/**
 * Detect file type based on extension
 */
function detectFileType(filePath: string): "code" | "docs" | "other" {
  const codeExtensions = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".py",
    ".java",
    ".go",
    ".rs",
    ".c",
    ".cpp",
    ".h",
    ".cs",
  ];
  const docExtensions = [".md", ".txt", ".pdf", ".doc", ".docx"];

  const ext = filePath.substring(filePath.lastIndexOf(".")).toLowerCase();

  if (codeExtensions.includes(ext)) return "code";
  if (docExtensions.includes(ext)) return "docs";
  return "other";
}

/**
 * Aggregate raw resources with LLM (Claude)
 */
async function aggregateWithLLM(
  goal: string,
  rawResources: Resource[]
): Promise<Omit<ContextPack, "id" | "title">> {
  try {
    const prompt = `You are helping a developer prepare to work on: "${goal}"

I've gathered these resources:
${JSON.stringify(rawResources, null, 2)}

Please analyze these and create a context pack with:
1. A 2-sentence summary of what this task is about based on the files found
2. Group the resources by type (code, docs, other) - keep all resources provided
3. List 3-5 open questions that should be clarified before starting
4. Suggest the next 3 concrete actions to take

Return your response as valid JSON matching this exact schema (no markdown, just JSON):
{
  "summary": "string",
  "resources": [{"type": "code"|"docs"|"other", "title": "string", "url": "string", "snippet": "string"}],
  "openQuestions": ["string"],
  "nextActions": ["string"]
}`;

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    // Extract JSON from response
    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Try to extract JSON (may be wrapped in markdown code blocks)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in LLM response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      summary: parsed.summary || `Working on: ${goal}`,
      resources: parsed.resources || rawResources,
      openQuestions: parsed.openQuestions || [],
      nextActions: parsed.nextActions || [],
    };
  } catch (error) {
    console.error("LLM aggregation error:", error);

    // Fallback: basic grouping without LLM
    return {
      summary: `Context pack for: ${goal}. Found ${rawResources.length} resources.`,
      resources: rawResources,
      openQuestions: [
        "What are the specific requirements for this task?",
        "Are there any dependencies or blockers?",
        "What is the expected timeline?",
      ],
      nextActions: [
        "Review the resources listed above",
        "Clarify open questions with stakeholders",
        "Create a detailed implementation plan",
      ],
    };
  }
}

/**
 * Git MCP integration - Search commits related to the goal
 */
async function callGitMcp(goal: string): Promise<Resource[]> {
  try {
    // Extract keywords from goal
    const keywords = goal
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 3)
      .slice(0, 5);

    if (keywords.length === 0) {
      return [];
    }

    // Initialize MCP client for git server
    // Bug #3 fix: use correct --repository flag (not positional arg)
    // and target SEARCH_ROOT so we search the demo-repo git history
    const transport = new StdioClientTransport({
      command: "npx",
      args: [
        "-y",
        "@modelcontextprotocol/server-git",
        "--repository",
        SEARCH_ROOT, // ✅ Points at demo-repo which has the prepared git history
      ],
    });

    const client = new Client(
      {
        name: "context-pack-builder",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);

    // Get recent git log (last 20 commits)
    const result = await client.callTool({
      name: "git_log",
      arguments: {
        max_count: 20,
      },
    });

    await client.close();

    // Parse results and filter by keywords
    const resources: Resource[] = [];

    if (result.content && Array.isArray(result.content)) {
      for (const item of result.content) {
        if (item.type === "text" && item.text) {
          // Parse commit log entries
          const commits = item.text.split("\n\n").filter((line: string) => line.trim());

          for (const commit of commits.slice(0, 10)) {
            // Check if commit message contains any of our keywords
            const commitLower = commit.toLowerCase();
            const matchesKeyword = keywords.some((keyword) =>
              commitLower.includes(keyword)
            );

            if (matchesKeyword) {
              // Extract commit hash and message
              const lines = commit.split("\n");
              const firstLine = lines[0] || commit;
              const commitHash = firstLine.split(" ")[0] || "unknown";
              const commitMessage = lines.slice(1).join(" ").trim() || firstLine;

              resources.push({
                type: "code",
                title: `Commit: ${commitHash.substring(0, 7)}`,
                url: `git-commit://${commitHash}`,
                snippet: commitMessage.substring(0, 200),
              });

              // Limit to 5 git commits
              if (resources.length >= 5) {
                break;
              }
            }
          }
        }
      }
    }

    return resources;
  } catch (error) {
    // Git MCP might fail if not in a git repo or git is not installed
    // Silently fail and return empty array
    console.log("Git MCP not available (this is OK):", error instanceof Error ? error.message : "");
    return [];
  }
}
