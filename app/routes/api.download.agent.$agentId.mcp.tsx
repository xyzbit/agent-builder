import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { agentId } = params;

  if (!agentId || isNaN(Number(agentId))) {
    return new Response("Invalid agent ID", { status: 400 });
  }

  try {
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    
    const agent = await agentsStorage.getAgentById(Number(agentId));
    if (!agent) {
      return new Response("Agent not found", { status: 404 });
    }

    // Extract tool IDs from agent's generated prompt
    const toolIds = extractToolIds(agent.generatedPrompt || '');
    
    // Get tools data
    const tools = await Promise.all(toolIds.map(id => toolsStorage.getToolById(id)));
    const validTools = tools.filter(tool => tool !== null);
    const mcpTools = validTools.filter(tool => tool.toolType === 'mcp');

    if (mcpTools.length === 0) {
      return new Response("No MCP tools found for this agent", { status: 404 });
    }

    const mcpConfig = generateMcpConfig(mcpTools);

    return new Response(JSON.stringify(mcpConfig, null, 2), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Disposition': `inline; filename="mcp_agent_${agentId}.json"`
      }
    });
  } catch (error) {
    console.error("Error serving MCP config:", error);
    return new Response("Error serving MCP config", { status: 500 });
  }
};

function extractToolIds(content: string): number[] {
  const regex = /\[([^\]]+)\]\(toolid_(\d+)\)/g;
  const ids: number[] = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[2]);
    if (id > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}


function generateMcpConfig(mcpTools: any[]): any {
  const mcpServers: Record<string, any> = {};
  
  for (const tool of mcpTools) {
    const serverName = sanitizeFilename(tool.name).toLowerCase();
    
    mcpServers[serverName] = {
      command: "npx",
      args: ["-y", tool.name.toLowerCase()],
      env: {
        [`${tool.name.toUpperCase()}_API_KEY`]: "your-api-key-here",
        "CLIENT_NAME": "cursor"
      }
    };
  }
  
  return {
    mcpServers
  };
}