import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { agentId } = params;

  if (!agentId || isNaN(Number(agentId))) {
    return new Response("Invalid agent ID", { status: 400 });
  }

  try {
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    
    const agent = await agentsStorage.getAgentById(Number(agentId));
    if (!agent) {
      return new Response("Agent not found", { status: 404 });
    }

    const content = agent.generatedPrompt || `# ${agent.name}

## 描述
${agent.description}

## 任务要求
${agent.taskRequirements}

## 状态
${agent.status}

---
*生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `inline; filename="agent_${agentId}_prompt.mdc"`
      }
    });
  } catch (error) {
    console.error("Error serving agent prompt:", error);
    return new Response("Error serving file", { status: 500 });
  }
};

