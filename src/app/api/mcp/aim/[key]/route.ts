export const runtime = "nodejs";

import { NextRequest, NextResponse } from "next/server";
import { execute } from "@/lib/db";

// ---------------------------------------------------------------------------
// Auth helper
// ---------------------------------------------------------------------------

function isAuthorized(key: string): boolean {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return true; // dev mode — allow all
  return key === secret;
}

// ---------------------------------------------------------------------------
// Tool definitions
// ---------------------------------------------------------------------------

const TOOLS = [
  {
    name: "get_dashboard_status",
    description:
      "Get current dashboard status including active demo and recent activity",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "get_tasks",
    description: "List tasks from the dashboard",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filter by status: todo, in_progress, done, up-next",
          enum: ["todo", "in_progress", "done", "up-next"],
        },
        limit: {
          type: "number",
          description: "Maximum number of tasks to return (default 20)",
        },
      },
      required: [],
    },
  },
  {
    name: "create_task",
    description: "Create a new task on the dashboard",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Unique task ID" },
        title: {
          type: "string",
          description: "Task name/title (maps to task_name)",
        },
        description: { type: "string", description: "Optional description" },
        wave: { type: "number", description: "Wave number" },
        status: {
          type: "string",
          description: "Task status (default: todo)",
          enum: ["todo", "in_progress", "done", "up-next"],
        },
        output_type: { type: "string", description: "Output type" },
        destination: { type: "string", description: "Destination" },
        demo_id: {
          type: "string",
          description: "Demo ID to associate with this task",
        },
      },
      required: ["id", "title"],
    },
  },
  {
    name: "update_task",
    description: "Update a task's status or details",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Task ID to update" },
        status: { type: "string", description: "New status" },
        output_url: { type: "string", description: "Output URL" },
        error_message: { type: "string", description: "Error message if any" },
        duration_seconds: {
          type: "number",
          description: "Duration in seconds",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "get_agents",
    description: "List AI agents registered in the dashboard",
    inputSchema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "Filter by status: active or paused",
          enum: ["active", "paused"],
        },
      },
      required: [],
    },
  },
  {
    name: "update_agent",
    description: "Update an AI agent's status or last activity",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string", description: "Agent ID to update" },
        status: {
          type: "string",
          description: "New status",
          enum: ["active", "paused"],
        },
        last_activity: {
          type: "string",
          description: "Description of last activity",
        },
        custom_instructions: {
          type: "string",
          description: "Custom instructions for the agent",
        },
      },
      required: ["id"],
    },
  },
  {
    name: "post_event",
    description: "Post a custom event to the dashboard event stream",
    inputSchema: {
      type: "object",
      properties: {
        event_type: { type: "string", description: "Event type identifier" },
        signal: { type: "string", description: "Optional signal/message" },
        payload: { type: "object", description: "Optional payload object" },
        demo_id: {
          type: "string",
          description: "Optional demo ID to associate with this event",
        },
      },
      required: ["event_type"],
    },
  },
  {
    name: "update_dashboard",
    description:
      "Push a status update or notification visible on the dashboard",
    inputSchema: {
      type: "object",
      properties: {
        message: { type: "string", description: "The message to display" },
        level: {
          type: "string",
          description: "Severity level (default: info)",
          enum: ["info", "warning", "success", "error"],
        },
      },
      required: ["message"],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool handlers
// ---------------------------------------------------------------------------

async function getDashboardStatus() {
  const [activeDemo, taskCounts, agentCount] = await Promise.all([
    execute(
      "SELECT * FROM demos WHERE status = 'active' ORDER BY created_at DESC LIMIT 1",
      {}
    ),
    execute(
      "SELECT status, COUNT(*) as count FROM tasks GROUP BY status",
      {}
    ),
    execute("SELECT COUNT(*) as count FROM ai_agents", {}),
  ]);

  const tasksByStatus: Record<string, number> = {};
  for (const row of taskCounts.rows) {
    tasksByStatus[row.status as string] = Number(row.count);
  }

  return {
    active_demo: activeDemo.rows[0] ?? null,
    tasks_by_status: tasksByStatus,
    agent_count: Number((agentCount.rows[0] as unknown as { count: number })?.count ?? 0),
  };
}

async function getTasks(args: { status?: string; limit?: number }) {
  const limit = args.limit ?? 20;
  let sql = "SELECT * FROM tasks";
  const params: Record<string, unknown> = { limit };

  if (args.status) {
    sql += " WHERE status = :status";
    params.status = args.status;
  }
  sql += " ORDER BY created_at DESC LIMIT :limit";

  const result = await execute(sql, params as Record<string, unknown>);
  return result.rows;
}

async function createTask(args: {
  id: string;
  title: string;
  description?: string;
  wave?: number;
  status?: string;
  output_type?: string;
  destination?: string;
  demo_id?: string;
}) {
  const status = args.status ?? "todo";
  await execute(
    `INSERT INTO tasks (id, demo_id, task_name, wave, status, output_type, destination)
     VALUES (:id, :demo_id, :task_name, :wave, :status, :output_type, :destination)`,
    {
      id: args.id,
      demo_id: args.demo_id ?? null,
      task_name: args.title,
      wave: args.wave ?? null,
      status,
      output_type: args.output_type ?? null,
      destination: args.destination ?? null,
    }
  );
  const result = await execute("SELECT * FROM tasks WHERE id = :id", {
    id: args.id,
  });
  return result.rows[0];
}

async function updateTask(args: {
  id: string;
  status?: string;
  output_url?: string;
  error_message?: string;
  duration_seconds?: number;
}) {
  const sets: string[] = ["updated_at = datetime('now')"];
  const params: Record<string, unknown> = { id: args.id };

  if (args.status !== undefined) {
    sets.push("status = :status");
    params.status = args.status;
  }
  if (args.output_url !== undefined) {
    sets.push("output_url = :output_url");
    params.output_url = args.output_url;
  }
  if (args.error_message !== undefined) {
    sets.push("error_message = :error_message");
    params.error_message = args.error_message;
  }
  if (args.duration_seconds !== undefined) {
    sets.push("duration_seconds = :duration_seconds");
    params.duration_seconds = args.duration_seconds;
  }

  if (sets.length === 1) {
    // only updated_at — still run it
  }

  await execute(
    `UPDATE tasks SET ${sets.join(", ")} WHERE id = :id`,
    params
  );
  const result = await execute("SELECT * FROM tasks WHERE id = :id", {
    id: args.id,
  });
  return result.rows[0] ?? null;
}

async function getAgents(args: { status?: string }) {
  let sql = "SELECT * FROM ai_agents";
  const params: Record<string, unknown> = {};

  if (args.status) {
    sql += " WHERE status = :status";
    params.status = args.status;
  }
  sql += " ORDER BY created_at DESC";

  const result = await execute(sql, params);
  return result.rows;
}

async function updateAgent(args: {
  id: string;
  status?: string;
  last_activity?: string;
  custom_instructions?: string;
}) {
  const sets: string[] = ["updated_at = datetime('now')"];
  const params: Record<string, unknown> = { id: args.id };

  if (args.status !== undefined) {
    sets.push("status = :status");
    params.status = args.status;
  }
  if (args.last_activity !== undefined) {
    sets.push("last_activity = :last_activity");
    params.last_activity = args.last_activity;
  }
  if (args.custom_instructions !== undefined) {
    sets.push("custom_instructions = :custom_instructions");
    params.custom_instructions = args.custom_instructions;
  }

  await execute(
    `UPDATE ai_agents SET ${sets.join(", ")} WHERE id = :id`,
    params
  );
  const result = await execute("SELECT * FROM ai_agents WHERE id = :id", {
    id: args.id,
  });
  return result.rows[0] ?? null;
}

async function postEvent(args: {
  event_type: string;
  signal?: string;
  payload?: Record<string, unknown>;
  demo_id?: string;
}) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO events (id, demo_id, event_type, signal, payload)
     VALUES (:id, :demo_id, :event_type, :signal, :payload)`,
    {
      id,
      demo_id: args.demo_id ?? null,
      event_type: args.event_type,
      signal: args.signal ?? null,
      payload: args.payload ? JSON.stringify(args.payload) : null,
    }
  );
  return { ok: true, id };
}

async function updateDashboard(args: { message: string; level?: string }) {
  const id = crypto.randomUUID();
  await execute(
    `INSERT INTO events (id, demo_id, event_type, signal, payload)
     VALUES (:id, NULL, 'dashboard_update', :signal, :payload)`,
    {
      id,
      signal: args.message,
      payload: JSON.stringify({ level: args.level ?? "info" }),
    }
  );
  return { ok: true };
}

// ---------------------------------------------------------------------------
// JSON-RPC dispatcher
// ---------------------------------------------------------------------------

async function handleToolCall(
  name: string,
  args: Record<string, unknown>
): Promise<unknown> {
  switch (name) {
    case "get_dashboard_status":
      return getDashboardStatus();
    case "get_tasks":
      return getTasks(args as Parameters<typeof getTasks>[0]);
    case "create_task":
      return createTask(args as Parameters<typeof createTask>[0]);
    case "update_task":
      return updateTask(args as Parameters<typeof updateTask>[0]);
    case "get_agents":
      return getAgents(args as Parameters<typeof getAgents>[0]);
    case "update_agent":
      return updateAgent(args as Parameters<typeof updateAgent>[0]);
    case "post_event":
      return postEvent(args as Parameters<typeof postEvent>[0]);
    case "update_dashboard":
      return updateDashboard(args as Parameters<typeof updateDashboard>[0]);
    default:
      throw { code: -32601, message: `Method not found: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const { key } = await params;

  if (!isAuthorized(key)) {
    return NextResponse.json(
      {
        jsonrpc: "2.0",
        id: null,
        error: { code: -32000, message: "Unauthorized" },
      },
      { status: 401 }
    );
  }

  let body: {
    jsonrpc?: string;
    id?: string | number | null;
    method?: string;
    params?: Record<string, unknown>;
  };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" },
    });
  }

  const { id = null, method, params: rpcParams = {} } = body;

  try {
    switch (method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: {
              name: "mission-control-mcp",
              version: "1.0.0",
            },
          },
        });

      case "notifications/initialized":
        return NextResponse.json({ jsonrpc: "2.0", id, result: {} });

      case "ping":
        return NextResponse.json({ jsonrpc: "2.0", id, result: {} });

      case "tools/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { tools: TOOLS },
        });

      case "tools/call": {
        const toolName = rpcParams.name as string;
        const toolArgs = (rpcParams.arguments ?? {}) as Record<
          string,
          unknown
        >;
        const toolResult = await handleToolCall(toolName, toolArgs);
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            content: [{ type: "text", text: JSON.stringify(toolResult) }],
          },
        });
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        });
    }
  } catch (err: unknown) {
    const mcpErr = err as { code?: number; message?: string };
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: {
        code: mcpErr?.code ?? -32603,
        message: mcpErr?.message ?? "Internal error",
      },
    });
  }
}
