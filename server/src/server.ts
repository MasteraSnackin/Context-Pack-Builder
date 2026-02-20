import { McpServer } from "skybridge/server";
import { z } from "zod";
import { env } from "./env.js";
import { buildContextPack } from "./context-pack.js";
import { saveContextPack, fetchContextPacks } from "./supabase.js";

const SERVER_URL = "http://localhost:3000";

const server = new McpServer(
  { name: "context-pack-builder", version: "0.0.1" },
  { capabilities: {} },
).registerWidget(
  "build-context-pack",
  {
    description:
      "Build a context pack for any task by aggregating code, docs, and meetings",
    _meta: {
      ui: {
        csp: {
          resourceDomains: ["https://fonts.googleapis.com"],
          connectDomains: [env.SUPABASE_URL],
        },
      },
    },
  },
  {
    description:
      "Provide a task or goal description to get a comprehensive context pack with summary, key resources grouped by type, open questions, and suggested next actions.",
    inputSchema: {
      goal: z
        .string()
        .min(1)
        .describe("What are you trying to do? (e.g., 'Ship feature X', 'Debug incident 123')"),
    },
    annotations: {
      readOnlyHint: false,
      openWorldHint: false,
      destructiveHint: false,
    },
  },
  async ({ goal }, extra) => {
    const userId = (extra.authInfo?.extra as any)?.userId as
      | string
      | undefined;

    if (!userId) {
      return {
        content: [
          {
            type: "text",
            text: "Please sign in to build your context pack.",
          },
        ],
        isError: true,
        _meta: {
          "mcp/www_authenticate": [
            `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
          ],
        },
      };
    }

    try {
      // Build the context pack using MCP servers + LLM
      const contextPack = await buildContextPack(userId, goal);

      // Save to database
      await saveContextPack(userId, contextPack);

      // Fetch all user's context packs for display
      const { packs } = await fetchContextPacks(userId);

      // Return structured content for the widget
      return {
        structuredContent: {
          contextPack,
          allPacks: packs,
        },
        content: [
          {
            type: "text",
            text: `Context pack for '${goal}': ${contextPack.summary}. Found ${contextPack.resources.length} resources. Next actions: ${contextPack.nextActions.slice(0, 2).join(", ")}.`,
          },
        ],
      };
    } catch (error) {
      console.error("Error building context pack:", error);
      return {
        content: [
          {
            type: "text",
            text: `Error building context pack: ${error instanceof Error ? error.message : "Unknown error"}`,
          },
        ],
        isError: true,
      };
    }
  },
);

export default server;
export type AppType = typeof server;
