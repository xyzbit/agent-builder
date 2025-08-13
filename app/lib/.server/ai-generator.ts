// @ts-nocheck
import { generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";

async function sleepTillEndOfMinute(): Promise<void> {
  return new Promise((resolve) => {
    const now = new Date();
    const delay = (60 - now.getSeconds()) * 1000;
    console.log("Seconds waiting EoM: ", { delay });
    setTimeout(resolve, delay);
  });
}

async function sleepRandomly(): Promise<void> {
  return new Promise(resolve => {
    const delay = Math.floor(Math.random() * 10000) + 1000;
    setTimeout(resolve, delay);
  });
}

async function generateWithRetries(prompt: string, retries = 3): Promise<string | null> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const openaiClient = createOpenAI({
        apiKey: process.env.OPENAI_API_KEY,
        baseURL: process.env.OPENAI_BASE_URL,
      });

      const { text } = await generateText({
        model: openaiClient(process.env.OPENAI_MODEL),
        prompt,
      });
      return text;
    } catch (error) {
      console.error(`Error on AI generation attempt ${attempt}`, error);
      if (attempt < retries) {
        console.log("Retrying AI generation...");
        await sleepTillEndOfMinute();
        await sleepRandomly();
      } else {
        console.error("Failed AI generation after multiple attempts. No more retries.");
      }
    }
  }
  return null;
}

export interface AgentGenerationRequest {
  type: "agent" | "workflow";
  taskRequirements: string;
  tools: string[];
  references: string[];
  toolUsageInstructions?: Record<string, string>;
  additionalContext?: string;
  allAvailableTools?: Array<{name: string; description: string}>;
  allAvailableReferences?: Array<{name: string; description: string; category: string}>;
}

export interface AgentGenerationResponse {
  result: string; // The generated prompt with reference and tool IDs
  reason: string; // Explanation of the workflow design and tool/reference usage
  recommendations: string[]; // Suggestions for improvements and missing tools/references
  configuration: {
    tools: string[];
    references: string[];
    parameters: Record<string, any>;
    workflow_steps?: Array<{
      step: string;
      description: string;
      tools: string[];
    }>;
    best_practices?: string[];
  };
  selectedTools: Array<{name: string; description: string; reason: string; id?: number}>;
  selectedReferences: Array<{name: string; description: string; category: string; reason: string; id?: number}>;
  missingTools: Array<{name: string; description: string; usage?: string}>;
  missingReferences: Array<{name: string; description: string; category: string; content?: string}>;
  completenessScore: number;
  missingInfo?: string[];
}

export class AIGenerator {
  async generateAgent(request: AgentGenerationRequest): Promise<AgentGenerationResponse | null> {
    try {
      // First, intelligently select tools and references if not provided
      const selectionPrompt = this.buildSelectionPrompt(request);
      const selectionResponse = await generateWithRetries(selectionPrompt);
      
      if (!selectionResponse) {
        throw new Error("Failed to select tools and references");
      }
      
      const selection = this.parseSelectionResponse(selectionResponse, request);
      
      // Then generate the agent with selected tools and references
      const prompt = this.buildAgentPrompt({
        ...request,
        tools: selection.selectedTools.map(t => t.name),
        references: selection.selectedReferences.map(r => r.name)
      });
      const response = await generateWithRetries(prompt);

      if (!response) {
        throw new Error("Failed to generate agent configuration");
      }

      const agentResponse = this.parseAgentResponse(response, request);
      
      // Merge selection data with agent response
      return {
        ...agentResponse,
        selectedTools: selection.selectedTools,
        selectedReferences: selection.selectedReferences,
        completenessScore: selection.completenessScore,
        configuration: {
          ...agentResponse.configuration,
          tools: selection.selectedTools.map(t => t.name),
          references: selection.selectedReferences.map(r => r.name)
        }
      };
    } catch (error) {
      console.error("Error generating agent:", error);
      return null;
    }
  }

  async generateWorkflow(request: AgentGenerationRequest): Promise<AgentGenerationResponse | null> {
    try {
      const prompt = this.buildWorkflowPrompt(request);
      const response = await generateWithRetries(prompt);

      if (!response) {
        throw new Error("Failed to generate workflow configuration");
      }

      return this.parseWorkflowResponse(response, request);
    } catch (error) {
      console.error("Error generating workflow:", error);
      return null;
    }
  }

  async validateConfiguration(taskRequirements: string, tools: string[]): Promise<{
    isComplete: boolean;
    missingInfo: string[];
    recommendations: string[];
  }> {
    try {
      const prompt = `
Analyze the following task requirements and available tools to determine if the configuration is complete:

Task Requirements: ${taskRequirements}
Available Tools: ${tools.join(", ")}

Please respond with a JSON object containing:
- isComplete: boolean indicating if the configuration is sufficient
- missingInfo: array of strings describing what information is missing
- recommendations: array of strings with suggestions for improvement

Focus on:
1. Whether the task requirements are clear and specific
2. If the available tools are sufficient for the task
3. Any missing tools or information needed
4. Best practices recommendations
`;

      const response = await generateWithRetries(prompt);
      if (!response) {
        return {
          isComplete: false,
          missingInfo: ["Unable to validate configuration"],
          recommendations: ["Please try again later"]
        };
      }

      try {
        return JSON.parse(response);
      } catch {
        return {
          isComplete: false,
          missingInfo: ["Configuration validation failed"],
          recommendations: ["Please review your task requirements and tools"]
        };
      }
    } catch (error) {
      console.error("Error validating configuration:", error);
      return {
        isComplete: false,
        missingInfo: ["Validation error occurred"],
        recommendations: ["Please check your configuration and try again"]
      };
    }
  }

  private buildSelectionPrompt(request: AgentGenerationRequest): string {
    const userSelectedTools = request.tools.length > 0 ? request.tools : [];
    const userSelectedReferences = request.references.length > 0 ? request.references : [];
    
    return `
You are an expert AI assistant that intelligently selects tools and reference documents for agent/workflow generation.

Task Requirements: ${request.taskRequirements}
Type: ${request.type}

User Pre-selected Tools: ${userSelectedTools.length > 0 ? userSelectedTools.join(", ") : "None (use automatic selection)"}
User Pre-selected References: ${userSelectedReferences.length > 0 ? userSelectedReferences.join(", ") : "None (use automatic selection)"}

Available Tools:
${request.allAvailableTools?.map(t => `- ${t.name}: ${t.description}`).join('\n') || 'No tools available'}

Available References:
${request.allAvailableReferences?.map(r => `- ${r.name} (${r.category}): ${r.description}`).join('\n') || 'No references available'}

Select the most appropriate tools and references for this task. If user has pre-selected items, use them unless they are clearly inappropriate. If no pre-selection, intelligently choose the best ones.

Also provide a completeness score (0-100) based on:
- How well the task requirements are defined
- Availability of appropriate tools
- Availability of relevant documentation
- Overall feasibility

Respond with a JSON object containing:
- selectedTools: array of {name, description, reason} for selected tools
- selectedReferences: array of {name, description, category, reason} for selected references
- completenessScore: number (0-100)
- missingInfo: array of strings describing critical missing information (only if score < 70)

Be selective and choose only the most relevant tools and references.
`;
  }

  private buildAgentPrompt(request: AgentGenerationRequest): string {
    const availableToolsInfo = request.allAvailableTools?.map(t => `- ${t.name} (id: ${this.getToolId(t.name, request)}): ${t.description}`).join('\n') || '';
    const availableReferencesInfo = request.allAvailableReferences?.map(r => `- ${r.name} (id: ${this.getReferenceId(r.name, request)}): ${r.description} [${r.category}]`).join('\n') || '';
    
    return `
You are an expert AI agent configuration specialist. Generate a comprehensive agent configuration based on the following requirements:

## Input Information:
**需求名称**: ${this.extractRequirementName(request.taskRequirements)}
**需求描述**: ${request.additionalContext || "请根据任务需求自行判断"}
**详细内容**: ${request.taskRequirements}

**可用Tools**:
${availableToolsInfo}

**可用References**:
${availableReferencesInfo}

## Output Requirements:
Please respond with a JSON object containing exactly these three fields:

1. **result**: Generate a detailed prompt for the agent. The prompt should:
   - Define the agent's role, responsibilities, and capabilities clearly
   - Reference tools using format: [{tool_name}](toolid_{id})
   - Reference documents using format: [{ref_name}](refid_{id})
   - For missing tools/references not in the available list, use id=0 with specific meaningful names: [{具体工具名称}](toolid_0) or [{具体参考资料名称}](refid_0)
   - Follow a structured workflow with clear phases and steps
   - Include specific instructions for using tools and references

2. **reason**: Explain your design decisions including:
   - Why you chose this particular workflow structure
   - Reasoning for each selected tool and reference
   - How the tools and references work together
   - Why certain phases are ordered this way

3. **recommendations**: Array of strings, each recommendation as a separate item including:
   - Improvements for existing tools (usage instructions, default values)
   - Missing tools or references that would enhance the workflow (with descriptions)
   - Best practices that should be documented
   - Any gaps in the current tool/reference set
   
   **Important**: Return recommendations as an array of strings, not as a single string with line breaks.

## Example Format for result field:
Generate content similar to this structure but adapted to your specific requirements:

\`\`\`markdown
你是一个[角色定义]，擅长[核心能力]。

## 1. [阶段名称]
本阶段的目的：[阶段目标]

在开始本阶段工作前，请再次确认并充分理解 [{reference_name}](refid_{id}) 中的指导原则。
使用 [{tool_name}](toolid_{id}) 工具来[具体用途]。

[具体步骤和指导...]

## 2. [下一阶段]
[继续其他阶段...]
\`\`\`

Focus on creating a practical, step-by-step agent that can handle the specified task effectively.
`;
  }

  private buildWorkflowPrompt(request: AgentGenerationRequest): string {
    const availableToolsInfo = request.allAvailableTools?.map(t => `- ${t.name} (id: ${this.getToolId(t.name, request)}): ${t.description}`).join('\n') || '';
    const availableReferencesInfo = request.allAvailableReferences?.map(r => `- ${r.name} (id: ${this.getReferenceId(r.name, request)}): ${r.description} [${r.category}]`).join('\n') || '';
    
    return `
You are an expert workflow design specialist. Create a structured agentic workflow based on the following requirements:

## Input Information:
**需求名称**: ${this.extractRequirementName(request.taskRequirements)}
**需求描述**: ${request.additionalContext || "请根据任务需求自行判断"}
**详细内容**: ${request.taskRequirements}

**可用Tools**:
${availableToolsInfo}

**可用References**:
${availableReferencesInfo}

## Output Requirements:
Please respond with a JSON object containing exactly these three fields:

1. **result**: Generate a detailed workflow prompt. The workflow should:
   - Define clear phases and steps with specific objectives
   - Reference tools using format: [{tool_name}](toolid_{id})
   - Reference documents using format: [{ref_name}](refid_{id})
   - For missing tools/references not in the available list, use id=0 with specific meaningful names: [{具体工具名称}](toolid_0) or [{具体参考资料名称}](refid_0)
   - Include dependencies between steps
   - Specify error handling and validation points
   - Provide clear success criteria for each phase

2. **reason**: Explain your workflow design including:
   - Why you structured the workflow in this particular order
   - Reasoning for each selected tool and reference
   - How different phases connect and depend on each other
   - Risk mitigation strategies built into the workflow

3. **recommendations**: Array of strings, each recommendation as a separate item including:
   - Improvements for existing tools (usage patterns, configurations)
   - Missing tools or references that would enhance the workflow
   - Additional validation steps or checkpoints
   - Alternative workflow approaches to consider
   
   **Important**: Return recommendations as an array of strings, not as a single string with line breaks.

## Example Format for result field:
Generate content similar to this structure but adapted to your specific workflow requirements:

\`\`\`markdown
你是一个[工作流角色]，负责[主要职责]。

## 工作流概述
本工作流包含[X]个主要阶段，旨在[工作流目标]。

## 阶段1: [阶段名称]
**目标**: [阶段目标]
**前置条件**: [前置要求]

参考 [{reference_name}](refid_{id}) 中的指导原则。
使用 [{tool_name}](toolid_{id}) 工具进行[具体操作]。

**步骤**:
1. [具体步骤]
2. [验证点]

**成功标准**: [如何判断此阶段完成]

## 阶段2: [下一阶段]
[继续其他阶段...]

## 错误处理
- [错误情况1]: [处理方式]
- [错误情况2]: [处理方式]
\`\`\`

Focus on creating a practical, step-by-step workflow that can be reliably executed.
`;
  }

  private getToolId(toolName: string, request: AgentGenerationRequest): string {
    const tool = request.allAvailableTools?.find(t => t.name === toolName);
    return tool ? (tool as any).id?.toString() || "auto" : "0";
  }

  private getReferenceId(refName: string, request: AgentGenerationRequest): string {
    const ref = request.allAvailableReferences?.find(r => r.name === refName);
    return ref ? (ref as any).id?.toString() || "auto" : "0";
  }

  private extractRequirementName(taskRequirements: string): string {
    // Extract the first line or first sentence as requirement name
    const firstLine = taskRequirements.split('\n')[0];
    return firstLine.length > 50 ? firstLine.substring(0, 50) + "..." : firstLine;
  }

  private parseSelectionResponse(response: string, request: AgentGenerationRequest): {
    selectedTools: Array<{name: string; description: string; reason: string}>;
    selectedReferences: Array<{name: string; description: string; category: string; reason: string}>;
    completenessScore: number;
    missingInfo?: string[];
  } {
    try {
      const parsed = JSON.parse(response);
      return {
        selectedTools: parsed.selectedTools || [],
        selectedReferences: parsed.selectedReferences || [],
        completenessScore: parsed.completenessScore || 50,
        missingInfo: parsed.missingInfo || []
      };
    } catch (error) {
      console.error("Error parsing selection response:", error);
      // Fallback to user selections or empty arrays
      const allTools = request.allAvailableTools || [];
      const allReferences = request.allAvailableReferences || [];
      
      const selectedTools = request.tools.length > 0 
        ? request.tools.map(name => {
            const tool = allTools.find(t => t.name === name);
            return {
              name,
              description: tool?.description || "Tool description not available",
              reason: "User selected"
            };
          })
        : [];
      
      const selectedReferences = request.references.length > 0
        ? request.references.map(name => {
            const ref = allReferences.find(r => r.name === name);
            return {
              name,
              description: ref?.description || "Reference description not available",
              category: ref?.category || "unknown",
              reason: "User selected"
            };
          })
        : [];
      
      return {
        selectedTools,
        selectedReferences,
        completenessScore: 30,
        missingInfo: ["Unable to analyze task requirements automatically"]
      };
    }
  }

  private parseAgentResponse(response: string, request: AgentGenerationRequest): AgentGenerationResponse {
    try {
      const parsed = JSON.parse(response);
      
      // Extract missing tools and references from the result
      const missingTools = this.extractMissingItems(parsed.result || "", "toolid_0", "tool");
      const missingReferences = this.extractMissingItems(parsed.result || "", "refid_0", "reference");
      
      return {
        result: parsed.result || "Failed to generate prompt content",
        reason: parsed.reason || "No reasoning provided",
        recommendations: this.parseRecommendations(parsed.recommendations),
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: parsed.configuration?.parameters || {},
          best_practices: parsed.configuration?.best_practices || []
        },
        selectedTools: [],
        selectedReferences: [],
        missingTools,
        missingReferences,
        completenessScore: 80
      };
    } catch (error) {
      console.error("Error parsing agent response:", error);
      return {
        result: "Failed to generate agent prompt. Please try again.",
        reason: "Error occurred during generation",
        recommendations: ["Please review your task requirements and try again"],
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: {},
          best_practices: []
        },
        selectedTools: [],
        selectedReferences: [],
        missingTools: [],
        missingReferences: [],
        completenessScore: 0
      };
    }
  }

  private extractMissingItems(content: string, idPattern: string, type: "tool" | "reference"): Array<{name: string; description: string; usage?: string; category?: string; content?: string}> {
    const regex = type === "tool" 
      ? /\[([^\]]+)\]\(toolid_0\)/g 
      : /\[([^\]]+)\]\(refid_0\)/g;
    
    const matches = [...content.matchAll(regex)];
    const uniqueNames = [...new Set(matches.map(match => match[1]))];
    
    return uniqueNames.map(name => {
      if (type === "tool") {
        // 根据工具名称智能推测描述和用法
        let description = "";
        let usage = "";
        
        if (name.toLowerCase().includes("sonarqube") || name.toLowerCase().includes("代码质量")) {
          description = "代码质量分析工具，用于检测代码漏洞、安全问题和技术债务";
          usage = "通过配置质量门禁规则，对代码进行静态分析和质量评估";
        } else if (name.toLowerCase().includes("eslint") || name.toLowerCase().includes("lint")) {
          description = "JavaScript/TypeScript代码风格检查工具";
          usage = "通过配置规则文件，对代码进行语法和风格检查";
        } else if (name.toLowerCase().includes("scanner") || name.toLowerCase().includes("扫描")) {
          description = "安全扫描工具，用于检测安全漏洞和合规性问题";
          usage = "配置扫描规则和目标，执行自动化安全检测";
        } else if (name.toLowerCase().includes("git") || name.toLowerCase().includes("版本")) {
          description = "版本控制工具，用于代码管理和协作开发";
          usage = "通过命令行或图形界面进行代码提交、分支管理等操作";
        } else {
          description = `${name} - 专业工具，用于支持特定的开发或分析任务`;
          usage = "请根据具体需求配置和使用该工具";
        }
        
        return { name, description, usage };
      } else {
        // 参考资料的智能推测
        let description = "";
        let category = "best-practice";
        let content = "";
        
        if (name.toLowerCase().includes("template") || name.toLowerCase().includes("模板")) {
          description = `${name} - 标准化模板文档，提供规范的格式和流程指导`;
          category = "template";
          content = "请提供具体的模板内容和使用说明";
        } else if (name.toLowerCase().includes("best") || name.toLowerCase().includes("最佳")) {
          description = `${name} - 最佳实践指南，包含经验总结和推荐做法`;
          category = "best-practice";
          content = "请提供具体的最佳实践内容和实施建议";
        } else if (name.toLowerCase().includes("security") || name.toLowerCase().includes("安全")) {
          description = `${name} - 安全相关文档，提供安全规范和防护措施`;
          category = "security";
          content = "请提供具体的安全规范和实施要求";
        } else {
          description = `${name} - 专业参考文档，提供相关领域的指导和规范`;
          content = "请提供具体的文档内容和使用指南";
        }
        
        return { name, description, category, content };
      }
    });
  }

  private parseRecommendations(recommendations: any): string[] {
    if (Array.isArray(recommendations)) {
      return recommendations.filter(rec => rec && typeof rec === 'string');
    }
    
    if (typeof recommendations === 'string') {
      // 如果是字符串，尝试按行分割或按数字编号分割
      const lines = recommendations.split('\n').filter(line => line.trim());
      
      // 检查是否有编号格式 (1. 2. 3. 或 - )
      const hasNumbering = lines.some(line => /^[\d]+\.\s/.test(line.trim()) || /^-\s/.test(line.trim()));
      
      if (hasNumbering) {
        return lines.map(line => {
          // 移除编号前缀
          return line.replace(/^[\d]+\.\s*/, '').replace(/^-\s*/, '').trim();
        }).filter(line => line.length > 0);
      } else {
        // 如果没有明显的分割符，按句号分割
        const sentences = recommendations.split(/[。\.]\s*/).filter(s => s.trim().length > 0);
        if (sentences.length > 1) {
          return sentences.map(s => s.trim() + (s.endsWith('.') || s.endsWith('。') ? '' : ''));
        }
        // 否则作为单个建议返回
        return [recommendations.trim()];
      }
    }
    
    return ["No recommendations provided"];
  }

  private parseWorkflowResponse(response: string, request: AgentGenerationRequest): AgentGenerationResponse {
    try {
      const parsed = JSON.parse(response);
      
      // Extract missing tools and references from the result
      const missingTools = this.extractMissingItems(parsed.result || "", "toolid_0", "tool");
      const missingReferences = this.extractMissingItems(parsed.result || "", "refid_0", "reference");
      
      return {
        result: parsed.result || "Failed to generate workflow content",
        reason: parsed.reason || "No reasoning provided",
        recommendations: this.parseRecommendations(parsed.recommendations),
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: parsed.configuration?.parameters || {},
          workflow_steps: parsed.configuration?.workflow_steps || [],
          best_practices: parsed.configuration?.best_practices || []
        },
        selectedTools: [],
        selectedReferences: [],
        missingTools,
        missingReferences,
        completenessScore: 80
      };
    } catch (error) {
      console.error("Error parsing workflow response:", error);
      return {
        result: "Failed to generate workflow. Please try again.",
        reason: "Error occurred during generation",
        recommendations: ["Please review your task requirements and try again"],
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: {},
          workflow_steps: [],
          best_practices: []
        },
        selectedTools: [],
        selectedReferences: [],
        missingTools: [],
        missingReferences: [],
        completenessScore: 0
      };
    }
  }
}

export const aiGenerator = new AIGenerator();
