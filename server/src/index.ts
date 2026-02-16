import type { Request, Response, NextFunction } from "express";
import { Router } from "express";
import { McpServer } from "skybridge/server";
import { clerkMiddleware, getAuth } from "@clerk/express";
import {
  protectedResourceHandlerClerk,
  authServerMetadataHandlerClerk,
} from "@clerk/mcp-tools/express";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { env } from "./env.js";

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

const SERVER_URL = "http://localhost:3000";

async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    res
      .status(401)
      .set(
        "WWW-Authenticate",
        `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
      )
      .json({ error: "Unauthorized" });
    return;
  }

  try {
    // Use getAuth just like mcpAuthClerk does internally
    const auth = await getAuth(req, { acceptsToken: "oauth_token" });
    if (!auth.isAuthenticated || !auth.userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    // Set req.auth just like mcpAuthClerk does — exposes via extra.authInfo in handler
    const token = authHeader.slice(7).trim();
    (req as any).auth = {
      token,
      clientId: auth.clientId,
      scopes: auth.scopes,
      extra: { userId: auth.userId },
    };
    next();
  } catch (err) {
    console.log("Auth verification failed:", err);
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Clerk OAuth metadata endpoints
const clerkAuthRouter = Router();
clerkAuthRouter.get(
  "/.well-known/oauth-protected-resource/mcp",
  protectedResourceHandlerClerk({ scopes_supported: ["email", "profile"] }),
);
clerkAuthRouter.get(
  "/.well-known/oauth-authorization-server",
  authServerMetadataHandlerClerk,
);

const ActionSchema = z.object({
  type: z.enum(["add", "delete", "toggle"]),
  title: z.string().optional().describe("Task title (required for add)"),
  priority: z
    .enum(["low", "medium", "high"])
    .optional()
    .describe("Task priority"),
  dueDate: z.string().optional().describe("Due date (ISO string)"),
  taskId: z.string().optional().describe("Task ID (required for delete/toggle)"),
});

const server = new McpServer(
  { name: "todo-app", version: "0.0.1" },
  { capabilities: {} },
)
  .use(clerkMiddleware())
  .use(clerkAuthRouter)
  .use("/mcp", requireAuth)
  .registerWidget(
    "manage-tasks",
    {
      description: "View and manage your to-do list",
      _meta: {
        ui: {
          csp: {
            connectDomains: [env.SUPABASE_URL],
          },
        },
      },
    },
    {
      description:
        "Manage tasks: view all, add new, toggle completion, or delete. Supports batch actions in a single call.",
      inputSchema: {
        actions: z
          .array(ActionSchema)
          .optional()
          .describe("Actions to perform before returning the task list"),
      },
      annotations: {
        readOnlyHint: false,
        openWorldHint: false,
        destructiveHint: false,
      },
    },
    async ({ actions }, extra) => {
      const userId = (extra.authInfo?.extra as any)?.userId as string | undefined;

      if (!userId) {
        return {
          content: [
            { type: "text", text: "Please sign in to manage your tasks." },
          ],
          isError: true,
          _meta: {
            "mcp/www_authenticate": [
              `Bearer resource_metadata="${SERVER_URL}/.well-known/oauth-protected-resource/mcp"`,
            ],
          },
        };
      }

      // Execute batch actions
      if (actions && actions.length > 0) {
        for (const action of actions) {
          switch (action.type) {
            case "add": {
              if (!action.title) break;
              const { error: insertErr } = await supabase.from("tasks").insert({
                user_id: userId,
                title: action.title,
                priority: action.priority || "medium",
                due_date: action.dueDate || null,
                completed: false,
              });
              if (insertErr) console.log("Insert error:", insertErr);
              break;
            }
            case "toggle": {
              if (!action.taskId) break;
              const { data: task } = await supabase
                .from("tasks")
                .select("completed")
                .eq("id", action.taskId)
                .eq("user_id", userId)
                .single();
              if (task) {
                await supabase
                  .from("tasks")
                  .update({ completed: !task.completed })
                  .eq("id", action.taskId)
                  .eq("user_id", userId);
              }
              break;
            }
            case "delete": {
              if (!action.taskId) break;
              await supabase
                .from("tasks")
                .delete()
                .eq("id", action.taskId)
                .eq("user_id", userId);
              break;
            }
          }
        }
      }

      // Fetch updated task list
      const { data: tasks, error } = await supabase
        .from("tasks")
        .select("id, title, completed, priority, due_date, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        return {
          content: [
            { type: "text", text: `Error fetching tasks: ${error.message}` },
          ],
          isError: true,
        };
      }

      const formattedTasks = (tasks || []).map((t) => ({
        id: t.id,
        title: t.title,
        completed: t.completed,
        priority: t.priority,
        dueDate: t.due_date,
        createdAt: t.created_at,
      }));

      const pending = formattedTasks.filter((t) => !t.completed).length;
      const completed = formattedTasks.filter((t) => t.completed).length;

      return {
        structuredContent: { tasks: formattedTasks },
        content: [
          {
            type: "text",
            text: `${pending} pending, ${completed} completed. ${formattedTasks.length} total tasks.`,
          },
        ],
      };
    },
  );

server.run();

export type AppType = typeof server;
