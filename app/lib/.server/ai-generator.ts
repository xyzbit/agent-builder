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
  prompt: string;
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
    recommendations?: string[];
  };
  selectedTools: Array<{name: string; description: string; reason: string}>;
  selectedReferences: Array<{name: string; description: string; category: string; reason: string}>;
  completenessScore: number;
  missingInfo?: string[];
  suggestions?: string[];
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
    return `
You are an expert AI agent configuration specialist. Generate a comprehensive agent configuration based on the following requirements:

Task Requirements: ${request.taskRequirements}
Selected Tools: ${request.tools.join(", ")}
Selected References: ${request.references.join(", ")}
Additional Context: ${request.additionalContext || "None"}

Please generate:
1. A detailed prompt for the agent that clearly defines its role, responsibilities, and capabilities
2. Configuration parameters for optimal performance
3. Tool usage recommendations
4. Best practices for this type of task

Respond with a JSON object containing:
- prompt: string (the agent prompt)
- configuration: object with tools, references, parameters, best_practices, recommendations
- suggestions: array of optimization suggestions

Focus on creating a flexible, capable agent that can handle variations of the specified task.
`;
  }

  private buildWorkflowPrompt(request: AgentGenerationRequest): string {
    return `
You are an expert workflow design specialist. Create a structured agentic workflow based on the following requirements:

Task Requirements: ${request.taskRequirements}
Selected Tools: ${request.tools.join(", ")}
Selected References: ${request.references.join(", ")}
Additional Context: ${request.additionalContext || "None"}

Please generate:
1. A step-by-step workflow with clear descriptions
2. Tool assignments for each step
3. Dependencies and flow control
4. Error handling and best practices

Respond with a JSON object containing:
- prompt: string (workflow description)
- configuration: object with workflow_steps, tools, references, parameters, best_practices
- suggestions: array of workflow optimization suggestions

Each workflow step should include:
- step: step name
- description: what happens in this step
- tools: tools used in this step
- dependencies: previous steps required

Focus on creating a reliable, repeatable process.
`;
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
      return {
        prompt: parsed.prompt || "Generated agent prompt",
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: parsed.configuration?.parameters || {},
          best_practices: parsed.configuration?.best_practices || [],
          recommendations: parsed.recommendations || []
        },
        selectedTools: [],
        selectedReferences: [],
        completenessScore: 80,
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error("Error parsing agent response:", error);
      return {
        prompt: "Failed to generate agent prompt. Please try again.",
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: {},
          best_practices: [],
          recommendations: []
        },
        selectedTools: [],
        selectedReferences: [],
        completenessScore: 0,
        suggestions: ["Please review your task requirements and try again"]
      };
    }
  }

  private parseWorkflowResponse(response: string, request: AgentGenerationRequest): AgentGenerationResponse {
    try {
      const parsed = JSON.parse(response);
      return {
        prompt: parsed.prompt || "Generated workflow description",
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: parsed.configuration?.parameters || {},
          workflow_steps: parsed.configuration?.workflow_steps || [],
          best_practices: parsed.configuration?.best_practices || [],
          recommendations: parsed.recommendations || []
        },
        selectedTools: [],
        selectedReferences: [],
        completenessScore: 80,
        suggestions: parsed.suggestions || []
      };
    } catch (error) {
      console.error("Error parsing workflow response:", error);
      return {
        prompt: "Failed to generate workflow. Please try again.",
        configuration: {
          tools: request.tools,
          references: request.references,
          parameters: {},
          workflow_steps: [],
          best_practices: [],
          recommendations: []
        },
        selectedTools: [],
        selectedReferences: [],
        completenessScore: 0,
        suggestions: ["Please review your task requirements and try again"]
      };
    }
  }
}

export const aiGenerator = new AIGenerator();
