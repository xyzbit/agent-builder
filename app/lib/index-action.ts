import type { ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";

export const createAction = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    // Dynamic imports for storage and AI
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    const { executionLogsStorage } = await import("~/lib/.server/execution-logs.storage");
    const { userSessionsStorage } = await import("~/lib/.server/user-sessions.storage");
    const { refsStorage } = await import("~/lib/.server/refs.storage");
    const { aiGenerator } = await import("~/lib/.server/ai-generator");

    switch (intent) {
      case "create_reference": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const content = formData.get("content") as string;

        if (!name || !description || !category || !content) {
          return json({
            error: "All fields are required",
            success: false
          }, { status: 400 });
        }

        const reference = await refsStorage.createReference({
          name,
          description,
          category,
          content,
          isActive: true
        });

        return json({
          success: true,
          message: "Reference created successfully",
          reference
        });
      }

      case "update_reference": {
        const id = parseInt(formData.get("id") as string);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const content = formData.get("content") as string;

        if (!id || !name || !description || !category || !content) {
          return json({
            error: "All fields are required",
            success: false
          }, { status: 400 });
        }

        const reference = await refsStorage.updateReference(id, {
          name,
          description,
          category,
          content
        });

        return json({
          success: true,
          message: "Reference updated successfully",
          reference
        });
      }

      case "delete_reference": {
        const id = parseInt(formData.get("id") as string);

        if (!id) {
          return json({
            error: "Reference ID is required",
            success: false
          }, { status: 400 });
        }

        await refsStorage.deleteReference(id);

        return json({
          success: true,
          message: "Reference deleted successfully"
        });
      }

      case "toggle_reference": {
        const id = parseInt(formData.get("id") as string);

        if (!id) {
          return json({
            error: "Reference ID is required",
            success: false
          }, { status: 400 });
        }

        // First get the current reference to know its current status
        const currentReference = await refsStorage.getReferenceById(id);
        if (!currentReference) {
          return json({
            error: "Reference not found",
            success: false
          }, { status: 404 });
        }

        // Toggle the status
        const reference = await refsStorage.toggleReferenceStatus(id, !currentReference.isActive);

        return json({
          success: true,
          message: `Reference ${reference?.isActive ? 'activated' : 'deactivated'} successfully`,
          reference
        });
      }

      case "analyze_requirements": {
        const requirements = formData.get("requirements") as string;

        if (!requirements) {
          return json({
            error: "Requirements are required for analysis",
            success: false
          }, { status: 400 });
        }

        const { inputProcessor } = await import("~/lib/.server/input-processor");
        const analysis = await inputProcessor.analyzeRequirements(requirements);

        if (!analysis) {
          return json({
            error: "Failed to analyze requirements",
            success: false
          }, { status: 500 });
        }

        return json({
          success: true,
          message: "Requirements analyzed successfully",
          analysis
        });
      }

      case "get_recommendations": {
        const taskType = formData.get("taskType") as string;
        const requirements = formData.get("requirements") as string;
        const selectedTools = JSON.parse(formData.get("selectedTools") as string || "[]");

        if (!taskType || !requirements) {
          return json({
            error: "Task type and requirements are required",
            success: false
          }, { status: 400 });
        }

        const { inputProcessor } = await import("~/lib/.server/input-processor");
        const recommendations = await inputProcessor.provideBestPracticeRecommendations(
          taskType,
          requirements,
          selectedTools
        );

        if (!recommendations) {
          return json({
            error: "Failed to generate recommendations",
            success: false
          }, { status: 500 });
        }

        return json({
          success: true,
          message: "Recommendations generated successfully",
          recommendations
        });
      }

      case "generate_agent":
      case "generate_workflow": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const taskRequirements = formData.get("taskRequirements") as string;
        const selectedTools = JSON.parse(formData.get("selectedTools") as string || "[]");
        const selectedReferences = JSON.parse(formData.get("selectedReferences") as string || "[]");
        const toolUsageInstructions = JSON.parse(formData.get("toolUsageInstructions") as string || "{}");
        const type = intent === "generate_agent" ? "agent" : "workflow";
        const previewMode = formData.get("previewMode") === "true";

        if (!taskRequirements) {
          return json({
            error: "Task requirements are required",
            success: false
          }, { status: 400 });
        }

        // Get all available tools and references for AI selection
        const allTools = await toolsStorage.getActiveTools();
        const allReferences = await refsStorage.getActiveReferences();
        
        // Generate agent/workflow with intelligent tool and reference selection
        const generationRequest = {
          type: type as "agent" | "workflow",
          taskRequirements,
          tools: selectedTools,
          references: selectedReferences,
          toolUsageInstructions,
          additionalContext: description,
          allAvailableTools: allTools.map(t => ({ ...t, id: t.id })),
          allAvailableReferences: allReferences.map(r => ({ ...r, id: r.id }))
        };

        const aiResponse = type === "agent"
          ? await aiGenerator.generateAgent(generationRequest)
          : await aiGenerator.generateWorkflow(generationRequest);

        if (!aiResponse) {
          return json({
            error: "Failed to generate configuration. Please try again.",
            success: false
          }, { status: 500 });
        }

        // Check completeness score and handle low scores
        if (aiResponse.completenessScore < 70) {
          return json({
            success: false,
            completenessScore: aiResponse.completenessScore,
            selectedTools: aiResponse.selectedTools,
            selectedReferences: aiResponse.selectedReferences,
            missingInfo: aiResponse.missingInfo || [],
            message: "Configuration needs improvement",
            showMissingInfo: true
          });
        }

        // In preview mode, don't save to database
        if (previewMode) {
          return json({
            success: true,
            message: "Generated successfully",
            aiResponse,
            showPreview: true,
            name,
            description,
            type,
            taskRequirements
          });
        }

        // Only save if name and description are provided
        if (!name || !description) {
          return json({
            error: "Name and description are required for saving",
            success: false
          }, { status: 400 });
        }

        // Create agent in database
        const newAgent = await agentsStorage.createAgent({
          name,
          description,
          type,
          taskRequirements,
          generatedPrompt: aiResponse.result,
          configuration: aiResponse.configuration,
          status: "draft"
        });

        return json({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully`,
          agent: newAgent,
          aiResponse,
          showCelebration: true
        });
      }

      case "save_generated_agent": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const taskRequirements = formData.get("taskRequirements") as string;
        const type = formData.get("type") as string;
        const generatedPrompt = formData.get("generatedPrompt") as string;
        const configuration = JSON.parse(formData.get("configuration") as string || "{}");

        if (!name || !description || !taskRequirements || !generatedPrompt) {
          return json({
            error: "All fields are required for saving",
            success: false
          }, { status: 400 });
        }

        const newAgent = await agentsStorage.createAgent({
          name,
          description,
          type: type as "agent" | "workflow",
          taskRequirements,
          generatedPrompt,
          configuration,
          status: "draft"
        });

        return json({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} saved successfully`,
          agent: newAgent,
          showCelebration: true
        });
      }

      case "validate_config": {
        const taskRequirements = formData.get("taskRequirements") as string;
        const selectedTools = JSON.parse(formData.get("selectedTools") as string || "[]");
        const toolUsageInstructions = JSON.parse(formData.get("toolUsageInstructions") as string || "{}");

        if (!taskRequirements) {
          return json({
            error: "Task requirements are required for validation",
            success: false
          }, { status: 400 });
        }

        const validation = await aiGenerator.validateConfiguration(taskRequirements, selectedTools);

        return json({
          success: true,
          validation,
          message: validation.isComplete ? "Configuration is complete" : "Configuration needs improvement"
        });
      }

      case "run_command": {
        const command = formData.get("command") as string;
        const agentId = formData.get("agentId") ? parseInt(formData.get("agentId") as string) : null;

        if (!command) {
          return json({
            error: "Command is required",
            success: false
          }, { status: 400 });
        }

        const startTime = Date.now();
        let result = "";
        let status = "success";

        try {
          // Process different commands
          if (command.startsWith("agent list")) {
            const agents = await agentsStorage.getAgents(10);
            result = `Found ${agents.length} agents:\n` +
              agents.map(a => `  ${a.id}. ${a.name} (${a.type}) - ${a.status}`).join('\n');
          } else if (command.startsWith("tools list")) {
            const tools = await toolsStorage.getActiveTools();
            result = `Found ${tools.length} active tools:\n` +
              tools.map(t => `  - ${t.name}: ${t.description}`).join('\n');
          } else if (command.startsWith("refs list")) {
            const references = await refsStorage.getReferences(10);
            result = `Found ${references.length} references:\n` +
              references.map(r => `  - ${r.name} (${r.category}): ${r.description}`).join('\n');
          } else if (command.startsWith("agent run") && agentId) {
            const agent = await agentsStorage.getAgentById(agentId);
            if (agent) {
              result = `Executing agent: ${agent.name}\nType: ${agent.type}\nStatus: Running...\nCompleted successfully`;
            } else {
              result = `Error: Agent with ID ${agentId} not found`;
              status = "error";
            }
          } else {
            result = `Command executed: ${command}\nOutput: Command processed successfully`;
          }
        } catch (error) {
          result = `Error executing command: ${error instanceof Error ? error.message : String(error)}`;
          status = "error";
        }

        const executionTime = Date.now() - startTime;

        // Log the execution
        if (agentId) {
          await executionLogsStorage.createLog({
            agentId,
            command,
            parameters: {},
            result,
            status,
            executionTime
          });
        }

        return json({
          success: status === "success",
          message: "Command executed",
          output: result,
          executionTime
        });
      }

      case "update_agent": {
        const id = parseInt(formData.get("id") as string);
        const status = formData.get("status") as string;

        if (!id) {
          return json({
            error: "Agent ID is required",
            success: false
          }, { status: 400 });
        }

        const updatedAgent = await agentsStorage.updateAgent(id, { status: status as any });

        return json({
          success: true,
          message: "Agent updated successfully",
          agent: updatedAgent
        });
      }

      case "create_tool": {
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const toolType = formData.get("toolType") as 'mcp' | 'cli' | 'openapi';
        let usage = formData.get("usage") as string;

        if (!name || !description || !category || !toolType) {
          return json({
            error: "Missing required fields: name, description, category, and tool type are required",
            success: false
          }, { status: 400 });
        }

        // Auto-fill usage based on tool type if not provided
        if (!usage) {
          switch (toolType) {
            case 'mcp':
              usage = '无';
              break;
            case 'cli':
              usage = '通过 -h 获取cli的使用方式';
              break;
            case 'openapi':
              usage = '无';
              break;
          }
        }

        const newTool = await toolsStorage.createTool({
          name,
          description,
          category,
          toolType,
          usage,
          isActive: true
        });

        return json({
          success: true,
          message: "Tool created successfully",
          tool: newTool
        });
      }

      case "update_tool": {
        const id = parseInt(formData.get("id") as string);
        const name = formData.get("name") as string;
        const description = formData.get("description") as string;
        const category = formData.get("category") as string;
        const toolType = formData.get("toolType") as 'mcp' | 'cli' | 'openapi';
        const usage = formData.get("usage") as string;
        const isActive = formData.get("isActive") === "true";

        if (!id || !name || !description || !category || !toolType) {
          return json({
            error: "Missing required fields",
            success: false
          }, { status: 400 });
        }

        const updatedTool = await toolsStorage.updateTool(id, {
          name,
          description,
          category,
          toolType,
          usage,
          isActive
        });

        return json({
          success: true,
          message: "Tool updated successfully",
          tool: updatedTool
        });
      }

      case "delete_tool": {
        const id = parseInt(formData.get("id") as string);

        if (!id) {
          return json({
            error: "Tool ID is required",
            success: false
          }, { status: 400 });
        }

        await toolsStorage.deleteTool(id);

        return json({
          success: true,
          message: "Tool deleted successfully"
        });
      }

      case "toggle_tool": {
        const id = parseInt(formData.get("id") as string);
        const isActive = formData.get("isActive") === "true";

        if (!id) {
          return json({
            error: "Tool ID is required",
            success: false
          }, { status: 400 });
        }

        const updatedTool = await toolsStorage.updateTool(id, { isActive });

        return json({
          success: true,
          message: `Tool ${isActive ? 'enabled' : 'disabled'} successfully`,
          tool: updatedTool
        });
      }

      case "delete_agent": {
        const id = parseInt(formData.get("id") as string);

        if (!id) {
          return json({
            error: "Agent ID is required",
            success: false
          }, { status: 400 });
        }

        await agentsStorage.deleteAgent(id);

        return json({
          success: true,
          message: "Agent deleted successfully"
        });
      }

      default:
        return json({
          error: "Unknown action",
          success: false
        }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json({
      error: "Internal server error: " + (error instanceof Error ? error.message : String(error)),
      success: false
    }, { status: 500 });
  }
};