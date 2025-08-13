import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const { agentId } = params;
  const url = new URL(request.url);
  const platform = url.searchParams.get('platform') || 'cursor';

  if (!agentId || isNaN(Number(agentId))) {
    return new Response("Invalid agent ID", { status: 400 });
  }

  try {
    // Dynamic imports for storage
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { refsStorage } = await import("~/lib/.server/refs.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");

    // Get agent with tools
    const agent = await agentsStorage.getAgentById(Number(agentId));
    if (!agent) {
      return new Response("Agent not found", { status: 404 });
    }

    // Generate installation script
    const installScript = await generateInstallScript({
      agent,
      platform: platform as 'cursor' | 'trae',
      baseUrl: url.origin,
      refsStorage,
      toolsStorage
    });

    // Use ASCII-safe filename to avoid encoding issues
    const filename = `agent_${agentId}_install.sh`;
    
    return new Response(installScript, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Content-Disposition': `inline; filename="${filename}"`
      }
    });
  } catch (error) {
    console.error("Install script generation error:", error);
    return new Response(`Error generating install script: ${error instanceof Error ? error.message : String(error)}`, { status: 500 });
  }
};

async function generateInstallScript({ agent, platform, baseUrl, refsStorage, toolsStorage }: {
  agent: any;
  platform: 'cursor' | 'trae';
  baseUrl: string;
  refsStorage: any;
  toolsStorage: any;
}) {
  const paths = getInstallPaths(platform);
  const agentId = agent.id;
  
  // Extract reference IDs and tool IDs from agent's generated prompt
  const referenceIds = extractReferenceIds(agent.generatedPrompt || '');
  const toolIds = extractToolIds(agent.generatedPrompt || '');
  
  // Get references and tools data
  const [references, tools] = await Promise.all([
    Promise.all(referenceIds.map(id => refsStorage.getReferenceById(id))),
    Promise.all(toolIds.map(id => toolsStorage.getToolById(id)))
  ]);
  
  // Filter out null values
  const validReferences = references.filter(ref => ref !== null);
  const validTools = tools.filter(tool => tool !== null);
  const mcpTools = validTools.filter(tool => tool.toolType === 'mcp');

  return `#!/bin/bash
set -e

echo "🚀 开始安装 Agent: ${agent.name}"
echo "平台: ${platform.toUpperCase()}"
echo ""

# 1. 创建必要的目录结构
echo "📁 创建目录结构..."
mkdir -p "${paths.docs}" "${paths.tools}" "${paths.agent}"
${mcpTools.length > 0 ? `mkdir -p "${paths.mcp}"` : ''}

# 2. 下载主要提示文件
echo "📄 下载Agent提示文件..."
if ! curl -sSL -o "${paths.agent}/${sanitizeFilename(agent.name)}_${agent.type}.mdc" "${baseUrl}/api/download/agent/${agentId}/prompt"; then
  echo "⚠️  警告: 无法下载提示文件"
fi

# 3. 下载参考文档
${validReferences.length > 0 ? `echo "📚 下载参考文档..."
${validReferences.map(ref => 
  `if ! curl -sSL -o "${paths.docs}/${sanitizeFilename(ref.name)}.mdc" "${baseUrl}/api/download/reference/${ref.id}"; then
  echo "⚠️  警告: 无法下载参考文档 ${ref.name}"
fi`).join('\n')}` : ''}

# 4. 下载工具文档
${validTools.length > 0 ? `echo "🔧 下载工具文档..."
${validTools.map(tool => 
  `if ! curl -sSL -o "${paths.tools}/${sanitizeFilename(tool.name)}.mdc" "${baseUrl}/api/download/tool/${tool.id}"; then
  echo "⚠️  警告: 无法下载工具文档 ${tool.name}"
fi`).join('\n')}` : ''}

# 5. 下载MCP配置文件
${mcpTools.length > 0 ? `echo "🔌 下载MCP配置..."
if ! curl -sSL -o "${paths.mcp}/mcp_${sanitizeFilename(agent.name)}.json" "${baseUrl}/api/download/agent/${agentId}/mcp"; then
  echo "⚠️  警告: 无法下载MCP配置文件"
fi` : ''}

echo ""
echo "✅ 安装完成！"
echo "Agent '${agent.name}' 已安装到:"
echo "  📁 References: ${paths.docs}"
echo "  🔧 Tools: ${paths.tools}"
${mcpTools.length > 0 ? `echo "  🔌 MCP Config: ${paths.mcp}"` : ''}
echo ""
echo "💡 提示: 重启 ${platform.toUpperCase()} 以生效"
`;
}

function getInstallPaths(platform: 'cursor' | 'trae') {
  const paths = {
    cursor: {
      docs: ".cursor/rules/docs",
      tools: ".cursor/rules/tools",
      agent: ".cursor/rules/agent",
      mcp: ".cursor"
    },
    trae: {
      docs: ".trae/rules/docs",
      agent: ".trae/rules/agent",
      tools: ".trae/rules/tools", 
      mcp: ".trae"
    }
  };
  
  return paths[platform];
}

function extractReferenceIds(content: string): number[] {
  const regex = /\[([^\]]+)\]\(refid_(\d+)\)/g;
  const ids: number[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[2]);
    if (id > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

function extractToolIds(content: string): number[] {
  const regex = /\[([^\]]+)\]\(toolid_(\d+)\)/g;
  const ids: number[] = [];
  let match: RegExpExecArray | null;
  
  while ((match = regex.exec(content)) !== null) {
    const id = parseInt(match[2]);
    if (id > 0 && !ids.includes(id)) {
      ids.push(id);
    }
  }
  
  return ids;
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9\u4e00-\u9fff\s-_]/g, '') // Keep Chinese characters, letters, numbers, spaces, hyphens, underscores
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .trim();
}