import type { LoaderFunctionArgs } from "@remix-run/node";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { toolId } = params;

  if (!toolId || isNaN(Number(toolId))) {
    return new Response("Invalid tool ID", { status: 400 });
  }

  try {
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    
    const tool = await toolsStorage.getToolById(Number(toolId));
    if (!tool) {
      return new Response("Tool not found", { status: 404 });
    }

    const content = `# ${tool.name}

## 描述
${tool.description}

## 分类
${tool.category}

## 工具类型
${tool.toolType}

${tool.usage ? `## 使用方法
${tool.usage}` : ''}

## 状态
${tool.isActive ? '已启用' : '已禁用'}

---
*生成时间: ${new Date().toLocaleString('zh-CN')}*
`;

    return new Response(content, {
      headers: {
        'Content-Type': 'text/markdown; charset=utf-8',
        'Content-Disposition': `inline; filename="tool_${toolId}.mdc"`
      }
    });
  } catch (error) {
    console.error("Error serving tool:", error);
    return new Response("Error serving file", { status: 500 });
  }
};

