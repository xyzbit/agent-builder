import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { CLICommand } from "~/types";

export const createLoader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Dynamic imports for storage
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    const { executionLogsStorage } = await import("~/lib/.server/execution-logs.storage");
    const { userSessionsStorage } = await import("~/lib/.server/user-sessions.storage");
    const { refsStorage } = await import("~/lib/.server/refs.storage");

    // Load data for the SPA
    const [agents, tools, allTools, recentLogs, recentSessions, references] = await Promise.all([
      agentsStorage.getAgents(10),
      toolsStorage.getActiveTools(),
      toolsStorage.getTools(100), // All tools for management page
      executionLogsStorage.getRecentLogs(5),
      userSessionsStorage.getRecentSessions(5),
      refsStorage.getReferences(20)
    ]);

    // Mock data for CLI commands
    const cliCommands: CLICommand[] = [
      {
        command: "agent create",
        description: "Create a new agent configuration",
        example: "agent create --name 'Data Analyzer' --type agent",
        category: "Management"
      },
      {
        command: "workflow create",
        description: "Create a new workflow configuration",
        example: "workflow create --name 'Code Review' --type workflow",
        category: "Management"
      },
      {
        command: "agent list",
        description: "List all available agents",
        example: "agent list --status active",
        category: "Management"
      },
      {
        command: "agent run",
        description: "Execute an agent configuration",
        example: "agent run --id 1 --input 'data.csv'",
        category: "Execution"
      },
      {
        command: "tools list",
        description: "List available tools",
        example: "tools list --category 'Data Analysis'",
        category: "Tools"
      },
      {
        command: "config validate",
        description: "Validate agent configuration",
        example: "config validate --agent-id 1",
        category: "Configuration"
      },
      {
        command: "refs list",
        description: "List all reference documents",
        example: "refs list --category 'API Documentation'",
        category: "References"
      }
    ];

    return json({
      agents,
      tools,
      allTools,
      recentLogs,
      recentSessions,
      references,
      cliCommands,
      stats: {
        totalAgents: agents.length,
        totalTools: allTools.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        activeSessions: recentSessions.filter(s => s.status === 'active').length,
        totalReferences: references.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      agents: [],
      tools: [],
      allTools: [],
      recentLogs: [],
      recentSessions: [],
      references: [],
      cliCommands: [],
      stats: {
        totalAgents: 0,
        totalTools: 0,
        activeAgents: 0,
        activeSessions: 0,
        totalReferences: 0,
        lastUpdated: new Date().toISOString()
      },
      error: "Failed to load data"
    });
  }
};