import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLoaderData, useActionData, useNavigation, useFetcher, Form } from "@remix-run/react";
import type { LoaderFunctionArgs, ActionFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import type { MetaFunction } from "@remix-run/node";

// Global UI Components Import - ALWAYS include this entire block
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "~/components/ui/card";
import { Input, FloatingLabelInput } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { Separator } from "~/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";
import { Switch } from "~/components/ui/switch";
import { Textarea } from "~/components/ui/textarea";
import { Progress } from "~/components/ui/progress";
import { Slider } from "~/components/ui/slider";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "~/components/ui/dropdown-menu";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "~/components/ui/tooltip";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { Toggle } from "~/components/ui/toggle";

// Pre-Built Section Components Import (HIGH IMPACT - USE THESE FIRST)
import { NotFoundPage, DefaultNotFoundRoute } from "~/components/sections/not-found-page";

// Utility Components Import
import { GlassmorphicPanel } from "~/components/ui/glassmorphic-panel";
import { GradientBackground } from "~/components/ui/gradient-background";
import { AnimatedIcon } from "~/components/ui/animated-icon";
import { ThemeProvider, ThemeToggle } from "~/components/ui/theme-provider";

// Utility Functions
import { cn } from "~/lib/utils";
import { safeLucideIcon } from "~/components/ui/icon";
import { useIsMobile } from "~/hooks/use-mobile";
import { useToast } from "~/hooks/use-toast";

export const meta: MetaFunction = () => {
  return [
    { title: "CLI Prompt Builder - Build Agent Workflows" },
    { name: "description", content: "A command-line interface for building and configuring agent or agentic workflow prompts with guided operations and default settings." },
  ];
};

// Types for our CLI application
interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  template: string;
  parameters: PromptParameter[];
  createdAt: string;
}

interface PromptParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  description: string;
  required: boolean;
  defaultValue?: any;
  options?: string[];
}

interface CLICommand {
  command: string;
  description: string;
  example: string;
  category: string;
}

interface Agent {
  id: number;
  name: string;
  description: string;
  type: "agent" | "workflow";
  status: "draft" | "active" | "archived";
  taskRequirements: string;
  generatedPrompt?: string;
  configuration?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface Tool {
  id: number;
  name: string;
  description: string;
  category: string;
  toolType: 'mcp' | 'cli' | 'openapi';
  usage?: string;
  isActive: boolean;
  createdAt: Date;
}

interface UserSession {
  id: number;
  sessionId: string;
  currentStep: string;
  status: string;
  context?: any;
  createdAt: Date;
  updatedAt: Date;
}

interface ProcessingResult {
  response: string;
  nextStep: string;
  missingInfo: string[];
  recommendations: string[];
  confidence: number;
  suggestions: string[];
  isComplete: boolean;
  followUpQuestions?: string[];
}

interface BestPractice {
  id: number;
  title: string;
  description: string;
  category: string;
  type: string;
  status: string;
  tags: string[];
  content: string;
  examples?: any[];
  relatedTools: string[];
  difficulty: string;
  estimatedTime: string;
  benefits: string[];
  commonMistakes: string[];
  createdAt: Date;
  updatedAt: Date;
}

interface BestPracticeAnalysis {
  taskComplexity: "simple" | "moderate" | "complex";
  riskLevel: "low" | "medium" | "high";
  suggestedApproach: string;
  timeEstimate: string;
  requiredSkills: string[];
  potentialChallenges: string[];
  recommendedPractices: Array<{
    title: string;
    priority: "high" | "medium" | "low";
    reasoning: string;
    category: string;
  }>;
  customRecommendations: string[];
  confidence: number;
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
  try {
    // Dynamic imports for storage
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    const { executionLogsStorage } = await import("~/lib/.server/execution-logs.storage");
    const { userSessionsStorage } = await import("~/lib/.server/user-sessions.storage");
    const { bestPracticesStorage } = await import("~/lib/.server/best-practices.storage");

    // Load data for the SPA
    const [agents, tools, recentLogs, recentSessions, bestPractices] = await Promise.all([
      agentsStorage.getAgents(10),
      toolsStorage.getActiveTools(),
      executionLogsStorage.getRecentLogs(5),
      userSessionsStorage.getRecentSessions(5),
      bestPracticesStorage.getBestPractices(20)
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
        command: "best-practices analyze",
        description: "Analyze requirements for best practices",
        example: "best-practices analyze --requirements 'process CSV data'",
        category: "Best Practices"
      }
    ];

    return json({
      agents,
      tools,
      recentLogs,
      recentSessions,
      bestPractices,
      cliCommands,
      stats: {
        totalAgents: agents.length,
        totalTools: tools.length,
        activeAgents: agents.filter(a => a.status === 'active').length,
        activeSessions: recentSessions.filter(s => s.status === 'active').length,
        totalBestPractices: bestPractices.length,
        lastUpdated: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error("Loader error:", error);
    return json({
      agents: [],
      tools: [],
      recentLogs: [],
      recentSessions: [],
      bestPractices: [],
      cliCommands: [],
      stats: {
        totalAgents: 0,
        totalTools: 0,
        activeAgents: 0,
        activeSessions: 0,
        totalBestPractices: 0,
        lastUpdated: new Date().toISOString()
      },
      error: "Failed to load data"
    });
  }
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const intent = formData.get("intent");

  try {
    // Dynamic imports for storage and AI
    const { agentsStorage } = await import("~/lib/.server/agents.storage");
    const { toolsStorage } = await import("~/lib/.server/tools.storage");
    const { executionLogsStorage } = await import("~/lib/.server/execution-logs.storage");
    const { userSessionsStorage } = await import("~/lib/.server/user-sessions.storage");
    const { bestPracticesStorage } = await import("~/lib/.server/best-practices.storage");
    const { aiGenerator } = await import("~/lib/.server/ai-generator");

    switch (intent) {
      case "analyze_best_practices": {
        const requirements = formData.get("requirements") as string;
        const taskType = formData.get("taskType") as string || "general";
        const selectedTools = JSON.parse(formData.get("selectedTools") as string || "[]");

        if (!requirements) {
          return json({
            error: "Requirements are required for best practice analysis",
            success: false
          }, { status: 400 });
        }

        const { inputProcessor } = await import("~/lib/.server/input-processor");
        const analysis = await inputProcessor.provideBestPracticeRecommendations(
          taskType,
          requirements,
          selectedTools
        );

        if (!analysis) {
          return json({
            error: "Failed to analyze best practices",
            success: false
          }, { status: 500 });
        }

        // Store the recommendation
        await bestPracticesStorage.createRecommendation({
          sessionId: `analysis_${Date.now()}`,
          userInput: requirements,
          taskType,
          selectedTools,
          recommendedPractices: [],
          analysisResults: {
            complexity: analysis.taskComplexity,
            riskLevel: analysis.riskLevel,
            suggestedApproach: analysis.suggestedApproach,
            timeEstimate: analysis.timeEstimate,
            requiredSkills: analysis.requiredSkills,
            potentialChallenges: analysis.potentialChallenges
          },
          customRecommendations: analysis.customRecommendations,
          confidence: analysis.confidence
        });

        return json({
          success: true,
          message: "Best practice analysis completed",
          analysis
        });
      }

      case "search_best_practices": {
        const query = formData.get("query") as string;
        const category = formData.get("category") as string;
        const type = formData.get("type") as string;

        let practices: BestPractice[] = [];

        if (query) {
          practices = await bestPracticesStorage.searchBestPractices(query, 20);
        } else if (category) {
          practices = await bestPracticesStorage.getBestPracticesByCategory(category, 20);
        } else if (type) {
          practices = await bestPracticesStorage.getBestPracticesByType(type, 20);
        } else {
          practices = await bestPracticesStorage.getBestPractices(20);
        }

        return json({
          success: true,
          practices,
          message: `Found ${practices.length} best practices`
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
        const toolUsageInstructions = JSON.parse(formData.get("toolUsageInstructions") as string || "{}");
        const type = intent === "generate_agent" ? "agent" : "workflow";

        if (!name || !description || !taskRequirements) {
          return json({
            error: "Missing required fields: name, description, and task requirements are required",
            success: false
          }, { status: 400 });
        }

        // Validate configuration first
        const validation = await aiGenerator.validateConfiguration(taskRequirements, selectedTools);

        if (!validation.isComplete) {
          return json({
            success: false,
            validation,
            message: "Configuration needs improvement before generation"
          });
        }

        // Generate agent/workflow
        const generationRequest = {
          type: type as "agent" | "workflow",
          taskRequirements,
          tools: selectedTools,
          toolUsageInstructions,
          additionalContext: description
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

        // Create agent in database
        const newAgent = await agentsStorage.createAgent({
          name,
          description,
          type,
          taskRequirements,
          generatedPrompt: aiResponse.prompt,
          configuration: aiResponse.configuration,
          status: "draft"
        });

        return json({
          success: true,
          message: `${type.charAt(0).toUpperCase() + type.slice(1)} generated successfully`,
          agent: newAgent,
          aiResponse
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
          } else if (command.startsWith("best-practices list")) {
            const practices = await bestPracticesStorage.getBestPractices(10);
            result = `Found ${practices.length} best practices:\n` +
              practices.map(p => `  - ${p.title} (${p.category}): ${p.description}`).join('\n');
          } else if (command.startsWith("best-practices analyze")) {
            const requirements = command.split("--requirements")[1]?.trim().replace(/['"]/g, "") || "";
            if (requirements) {
              const { inputProcessor } = await import("~/lib/.server/input-processor");
              const analysis = await inputProcessor.analyzeRequirements(requirements);
              if (analysis) {
                result = `Analysis Results:\n` +
                  `Complexity: ${analysis.taskComplexity}\n` +
                  `Risk Level: ${analysis.riskLevel}\n` +
                  `Approach: ${analysis.suggestedApproach}\n` +
                  `Time Estimate: ${analysis.timeEstimate}\n` +
                  `Required Skills: ${analysis.requiredSkills.join(", ")}\n` +
                  `Recommendations: ${analysis.customRecommendations.join("; ")}`;
              } else {
                result = "Failed to analyze requirements";
                status = "error";
              }
            } else {
              result = "Error: --requirements parameter is required";
              status = "error";
            }
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

export default function Index() {
  const { agents, tools, recentLogs, recentSessions, bestPractices, cliCommands, stats } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  // SPA state management
  const [activeView, setActiveView] = useState<'dashboard' | 'agents' | 'builder' | 'tools' | 'terminal' | 'best-practices' | 'docs'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [terminalHistory, setTerminalHistory] = useState<string[]>([
    "Welcome to CLI Prompt Builder v1.0.0",
    "Type 'help' for available commands",
    "Type 'best-practices list' to view best practices",
    ""
  ]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTerminalActive, setIsTerminalActive] = useState(false);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [toolUsageInstructions, setToolUsageInstructions] = useState<Record<string, string>>({});
  const [generationType, setGenerationType] = useState<"agent" | "workflow">("agent");


  // Best practices state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [analysisResult, setAnalysisResult] = useState<BestPracticeAnalysis | null>(null);
  const [analysisRequirements, setAnalysisRequirements] = useState("");

  // Tools state
  const [selectedToolType, setSelectedToolType] = useState<'mcp' | 'cli' | 'openapi' | ''>('');
  const [toolUsage, setToolUsage] = useState('');
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);
  
  // Fetcher for tool operations
  const toolFetcher = useFetcher();

  // Handle tool type change and auto-fill usage
  const handleToolTypeChange = (value: 'mcp' | 'cli' | 'openapi') => {
    setSelectedToolType(value);
    let defaultUsage = '';
    switch (value) {
      case 'mcp':
        defaultUsage = '如果该mcp工具本身没有描述清楚，可以在此补充，否则可不填';
        break;
      case 'cli':
        defaultUsage = '默认通过 -h 获取cli的使用方式，你也可以做格外补充';
        break;
      case 'openapi':
        defaultUsage = '请填入 openapi 接口文档，建议使用 openapi v3｜swagger 格式';
        break;
    }
    setToolUsage(defaultUsage);
  };

  // Reset tool form
  const resetToolForm = () => {
    setSelectedToolType('');
    setToolUsage('');
    setIsCreateModalOpen(false);
  };

  // Handle successful tool creation
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success && 'tool' in actionData) {
      resetToolForm();
    }
  }, [actionData]);

  // Handle tool operations
  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    setSelectedToolType(tool.toolType);
    setToolUsage(tool.usage || '');
    setIsEditModalOpen(true);
  };

  const handleDeleteTool = (tool: Tool) => {
    setToolToDelete(tool);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteTool = () => {
    if (toolToDelete) {
      toolFetcher.submit(
        { intent: 'delete_tool', id: toolToDelete.id.toString() },
        { method: 'post' }
      );
      setIsDeleteConfirmOpen(false);
      setToolToDelete(null);
    }
  };

  const handleToggleTool = (tool: Tool) => {
    toolFetcher.submit(
      { 
        intent: 'toggle_tool', 
        id: tool.id.toString(), 
        isActive: (!tool.isActive).toString() 
      },
      { method: 'post' }
    );
  };

  const resetEditToolForm = () => {
    setEditingTool(null);
    setSelectedToolType('');
    setToolUsage('');
    setIsEditModalOpen(false);
  };

  // Handle tool fetcher responses
  useEffect(() => {
    if (toolFetcher.data && 'success' in toolFetcher.data && toolFetcher.data.success) {
      const message = 'message' in toolFetcher.data ? String(toolFetcher.data.message) : 'Operation completed successfully';
      toast({
        title: "Success",
        description: message,
      });
      if ('tool' in toolFetcher.data) {
        resetEditToolForm();
      }
    } else if (toolFetcher.data && 'error' in toolFetcher.data) {
      toast({
        title: "Error",
        description: String(toolFetcher.data.error),
        variant: "destructive",
      });
    }
  }, [toolFetcher.data, toast]);

  const isSubmitting = navigation.state === "submitting";
  const terminalRef = useRef<HTMLDivElement>(null);

  // Handle action responses
  useEffect(() => {
    if (actionData && 'success' in actionData && actionData.success) {
      toast({
        title: "Success",
        description: (actionData as any).message || "Operation completed",
        duration: 3000,
      });

      if ('output' in actionData && (actionData as any).output) {
        setTerminalHistory(prev => [...prev, (actionData as any).output, ""]);
      }

      if ('analysis' in actionData && (actionData as any).analysis) {
        setAnalysisResult((actionData as any).analysis);
      }

      if (activeView === 'builder') {
        setIsCreateModalOpen(false);
        setSelectedTools([]);
        setToolUsageInstructions({});
      }
    } else if (actionData && 'error' in actionData && (actionData as any).error) {
      toast({
        title: "Error",
        description: (actionData as any).error,
        duration: 5000,
        variant: "destructive"
      });
    }
  }, [actionData, toast, activeView]);

  // Terminal command handler
  const handleTerminalCommand = useCallback((command: string) => {
    if (!command.trim()) return;

    const newHistory = [...terminalHistory, `$ ${command}`];

    // Simple command processing
    if (command === "help") {
      newHistory.push("Available commands:");
      cliCommands.forEach(cmd => {
        newHistory.push(`  ${cmd.command} - ${cmd.description}`);
      });
    } else if (command === "clear") {
      setTerminalHistory(["Welcome to CLI Prompt Builder v1.0.0", "Type 'help' for available commands", ""]);
      setCurrentCommand("");
      return;
    } else if (command.startsWith("agent list")) {
      newHistory.push("Available agents:");
      agents.forEach((agent, index) => {
        newHistory.push(`  ${index + 1}. ${agent.name} (${agent.type}) - ${agent.status}`);
      });
    } else if (command.startsWith("tools list")) {
      newHistory.push("Available tools:");
      tools.forEach((tool, index) => {
        newHistory.push(`  ${index + 1}. ${tool.name} - ${tool.description}`);
      });
    } else if (command.startsWith("best-practices")) {
      newHistory.push("Available best practices:");
      bestPractices.slice(0, 5).forEach((practice, index) => {
        newHistory.push(`  ${index + 1}. ${practice.title} (${practice.category})`);
      });
    } else {
      // Submit command to server
      const fetcher = useFetcher();
      fetcher.submit(
        { intent: "run_command", command },
        { method: "POST" }
      );
      newHistory.push(`Executing: ${command}...`);
    }

    newHistory.push("");
    setTerminalHistory(newHistory);
    setCurrentCommand("");
  }, [terminalHistory, cliCommands, agents, tools, bestPractices]);


  // Best practices search handler
  const handleBestPracticesSearch = useCallback(() => {
    const fetcher = useFetcher();
    fetcher.submit({
      intent: "search_best_practices",
      query: searchQuery,
      category: selectedCategory !== "all" ? selectedCategory : "",
      type: selectedType !== "all" ? selectedType : ""
    }, { method: "POST" });
  }, [searchQuery, selectedCategory, selectedType]);

  // Best practices analysis handler
  const handleAnalyzeRequirements = useCallback(() => {
    if (!analysisRequirements.trim()) return;

    const fetcher = useFetcher();
    fetcher.submit({
      intent: "analyze_best_practices",
      requirements: analysisRequirements,
      taskType: "general",
      selectedTools: JSON.stringify(selectedTools)
    }, { method: "POST" });
  }, [analysisRequirements, selectedTools]);

  // Auto-scroll terminal and guidance
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [terminalHistory]);




  return (
    <div className="min-h-screen bg-gradient-to-br from-cli-dark via-cli-bg to-cli-terminal">
      {/* Header */}
      <div className="-mx-6 -mt-6 border-b border-cli-teal/20 bg-cli-terminal/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {safeLucideIcon('Terminal', 'h-8 w-8 text-cli-teal')}
              <h1 className="font-mono text-xl font-bold text-cli-teal">CLI Prompt Builder</h1>
            </div>
            <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
              v1.0.0
            </Badge>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <button
              onClick={() => setActiveView("dashboard")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "dashboard"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('BarChart3', 'mr-2 h-4 w-4')}
              Dashboard
            </button>
            <button
              onClick={() => setActiveView("agents")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "agents"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Bot', 'mr-2 h-4 w-4')}
              Agents
            </button>
            <button
              onClick={() => setActiveView("builder")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "builder"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Wrench', 'mr-2 h-4 w-4')}
              Builder
            </button>
            <button
              onClick={() => setActiveView("tools")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "tools"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Settings', 'mr-2 h-4 w-4')}
              Tools
            </button>
            <button
              onClick={() => setActiveView("best-practices")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "best-practices"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Lightbulb', 'mr-2 h-4 w-4')}
              Best Practices
            </button>
            <button
              onClick={() => setActiveView("terminal")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "terminal"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Terminal', 'mr-2 h-4 w-4')}
              Terminal
            </button>
            <button
              onClick={() => setActiveView("docs")}
              className={cn(
                "font-mono text-sm transition-colors px-3 py-2 rounded-md",
                activeView === "docs"
                  ? "bg-cli-teal text-white"
                  : "text-cli-teal hover:bg-cli-teal/10"
              )}
            >
              {safeLucideIcon('Book', 'mr-2 h-4 w-4')}
              Docs
            </button>
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            {safeLucideIcon('Settings', 'h-5 w-5 text-cli-coral cursor-pointer hover:text-cli-yellow transition-colors')}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-8">
        {/* Dashboard View */}
        {activeView === 'dashboard' && (
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center space-y-6">
              <div className="relative">
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-10 rounded-3xl"
                  style={{
                    backgroundImage: 'url(https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=1200)'
                  }}
                />
                <div className="relative p-12 bg-cli-terminal/80 backdrop-blur-sm border border-cli-teal/30 shadow-terminal rounded-3xl">
                  <h1 className="text-4xl md:text-6xl font-mono font-bold text-cli-teal mb-4">
                    <span className="animate-typing overflow-hidden whitespace-nowrap border-r-4 border-cli-coral">
                      CLI Prompt Builder
                    </span>
                  </h1>
                  <p className="text-lg text-cli-yellow max-w-2xl mx-auto font-mono leading-relaxed">
                    Build and configure agent workflows with best practices guidance and interactive assistance.
                  </p>
                  <div className="flex gap-4 justify-center mt-8">
                    <Button
                      onClick={() => setActiveView("builder")}
                      className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono px-8 py-3 text-lg shadow-cli-glow"
                    >
                      {safeLucideIcon('Wrench', 'mr-2 h-5 w-5')}
                      Start Building
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveView("best-practices")}
                      className="border-cli-yellow text-cli-yellow hover:bg-cli-yellow/10 font-mono px-8 py-3 text-lg"
                    >
                      {safeLucideIcon('Lightbulb', 'mr-2 h-5 w-5')}
                      Best Practices
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cli-yellow font-mono text-sm">Total Agents</p>
                      <p className="text-3xl font-mono font-bold text-cli-teal">{stats.totalAgents}</p>
                    </div>
                    <div className="w-12 h-12 bg-cli-teal/20 rounded-lg flex items-center justify-center">
                      {safeLucideIcon('Bot', 'h-6 w-6 text-cli-teal')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cli-terminal/50 border-cli-coral/30 shadow-terminal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cli-yellow font-mono text-sm">Active Agents</p>
                      <p className="text-3xl font-mono font-bold text-cli-coral">{stats.activeAgents}</p>
                    </div>
                    <div className="w-12 h-12 bg-cli-coral/20 rounded-lg flex items-center justify-center">
                      {safeLucideIcon('Activity', 'h-6 w-6 text-cli-coral')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cli-terminal/50 border-cli-yellow/30 shadow-terminal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cli-yellow font-mono text-sm">Available Tools</p>
                      <p className="text-3xl font-mono font-bold text-cli-yellow">{stats.totalTools}</p>
                    </div>
                    <div className="w-12 h-12 bg-cli-yellow/20 rounded-lg flex items-center justify-center">
                      {safeLucideIcon('Wrench', 'h-6 w-6 text-cli-yellow')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cli-terminal/50 border-cli-green/30 shadow-terminal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cli-yellow font-mono text-sm">Active Sessions</p>
                      <p className="text-3xl font-mono font-bold text-cli-green">{stats.activeSessions}</p>
                    </div>
                    <div className="w-12 h-12 bg-cli-green/20 rounded-lg flex items-center justify-center">
                      {safeLucideIcon('MessageSquare', 'h-6 w-6 text-cli-green')}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-cli-terminal/50 border-cli-amber/30 shadow-terminal">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cli-yellow font-mono text-sm">Best Practices</p>
                      <p className="text-3xl font-mono font-bold text-cli-amber">{stats.totalBestPractices}</p>
                    </div>
                    <div className="w-12 h-12 bg-cli-amber/20 rounded-lg flex items-center justify-center">
                      {safeLucideIcon('Lightbulb', 'h-6 w-6 text-cli-amber')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Agents */}
            <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
              <CardHeader>
                <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                  {safeLucideIcon('Clock', 'h-5 w-5')}
                  Recent Agents
                </CardTitle>
                <CardDescription className="text-cli-yellow font-mono">
                  Your recently created agents and workflows
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agents.slice(0, 3).map((agent) => (
                    <div key={agent.id} className="flex items-center justify-between p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-cli-teal/20 rounded-lg flex items-center justify-center">
                          {safeLucideIcon(agent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5 text-cli-teal')}
                        </div>
                        <div>
                          <h3 className="font-mono font-semibold text-cli-teal">{agent.name}</h3>
                          <p className="text-sm text-cli-yellow font-mono">{agent.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono">
                          {agent.type}
                        </Badge>
                        <Badge variant="outline" className={cn(
                          "font-mono",
                          agent.status === 'active' ? "border-cli-green text-cli-green" : "border-cli-yellow text-cli-yellow"
                        )}>
                          {agent.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Best Practices View */}
        {activeView === 'best-practices' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mono font-bold text-cli-teal">Best Practice Recommendations</h2>
              <p className="text-cli-yellow font-mono">Analyze requirements and get AI-powered recommendations for optimal workflows</p>
            </div>

            {/* Analysis Section */}
            <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
              <CardHeader>
                <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                  {safeLucideIcon('Brain', 'h-5 w-5')}
                  Requirements Analysis
                </CardTitle>
                <CardDescription className="text-cli-yellow font-mono">
                  Describe your task requirements to get personalized best practice recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-cli-yellow font-mono">Task Requirements</Label>
                    <Textarea
                      value={analysisRequirements}
                      onChange={(e) => setAnalysisRequirements(e.target.value)}
                      placeholder="Describe what you want to build. Be specific about inputs, outputs, and expected behavior..."
                      rows={4}
                      className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral resize-none"
                    />
                  </div>

                  <div>
                    <Label className="text-cli-yellow font-mono">Selected Tools (Optional)</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-32 overflow-y-auto p-4 bg-cli-bg/30 rounded-lg border border-cli-teal/20">
                      {tools.slice(0, 12).map((tool) => (
                        <div key={tool.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`analysis-tool-${tool.id}`}
                            checked={selectedTools.includes(tool.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTools([...selectedTools, tool.name]);
                              } else {
                                setSelectedTools(selectedTools.filter(t => t !== tool.name));
                              }
                            }}
                            className="border-cli-teal/50"
                          />
                          <Label
                            htmlFor={`analysis-tool-${tool.id}`}
                            className="text-cli-teal font-mono text-sm cursor-pointer"
                          >
                            {tool.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    onClick={handleAnalyzeRequirements}
                    disabled={!analysisRequirements.trim() || isSubmitting}
                    className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
                  >
                    {isSubmitting ? (
                      <>
                        {safeLucideIcon('Loader2', 'mr-2 h-4 w-4 animate-spin')}
                        Analyzing...
                      </>
                    ) : (
                      <>
                        {safeLucideIcon('Sparkles', 'mr-2 h-4 w-4')}
                        Analyze Requirements
                      </>
                    )}
                  </Button>
                </div>

                {/* Analysis Results */}
                {analysisResult && (
                  <div className="mt-6 p-6 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                    <h4 className="font-mono font-semibold text-cli-teal mb-4 flex items-center gap-2">
                      {safeLucideIcon('CheckCircle', 'h-5 w-5')}
                      Analysis Results
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <p className="text-cli-yellow font-mono text-sm mb-2">Task Assessment</p>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-cli-green font-mono text-sm">Complexity:</span>
                              <Badge variant="outline" className={cn(
                                "font-mono text-xs",
                                analysisResult.taskComplexity === 'simple' ? "border-cli-green text-cli-green" :
                                  analysisResult.taskComplexity === 'moderate' ? "border-cli-yellow text-cli-yellow" :
                                    "border-cli-coral text-cli-coral"
                              )}>
                                {analysisResult.taskComplexity}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-cli-green font-mono text-sm">Risk Level:</span>
                              <Badge variant="outline" className={cn(
                                "font-mono text-xs",
                                analysisResult.riskLevel === 'low' ? "border-cli-green text-cli-green" :
                                  analysisResult.riskLevel === 'medium' ? "border-cli-yellow text-cli-yellow" :
                                    "border-cli-coral text-cli-coral"
                              )}>
                                {analysisResult.riskLevel}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-cli-green font-mono text-sm">Time Estimate:</span>
                              <span className="text-cli-teal font-mono text-sm">{analysisResult.timeEstimate}</span>
                            </div>
                          </div>
                        </div>

                        <div>
                          <p className="text-cli-yellow font-mono text-sm mb-2">Required Skills</p>
                          <div className="flex flex-wrap gap-2">
                            {analysisResult.requiredSkills.map((skill, index) => (
                              <Badge key={index} variant="outline" className="border-cli-teal text-cli-teal font-mono text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <p className="text-cli-yellow font-mono text-sm mb-2">Suggested Approach</p>
                          <p className="text-cli-green font-mono text-sm bg-cli-terminal/50 p-3 rounded border border-cli-teal/20">
                            {analysisResult.suggestedApproach}
                          </p>
                        </div>

                        <div>
                          <p className="text-cli-yellow font-mono text-sm mb-2">Confidence Score</p>
                          <div className="flex items-center gap-2">
                            <Progress value={analysisResult.confidence} className="flex-1" />
                            <span className="text-cli-green font-mono text-sm">{analysisResult.confidence}%</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {analysisResult.potentialChallenges.length > 0 && (
                      <div className="mt-4">
                        <p className="text-cli-coral font-mono text-sm mb-2">Potential Challenges</p>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.potentialChallenges.map((challenge, index) => (
                            <li key={index} className="text-cli-yellow font-mono text-sm">{challenge}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {analysisResult.customRecommendations.length > 0 && (
                      <div className="mt-4">
                        <p className="text-cli-teal font-mono text-sm mb-2">Custom Recommendations</p>
                        <ul className="list-disc list-inside space-y-1">
                          {analysisResult.customRecommendations.map((rec, index) => (
                            <li key={index} className="text-cli-green font-mono text-sm">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Best Practices Library */}
            <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
              <CardHeader>
                <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                  {safeLucideIcon('Library', 'h-5 w-5')}
                  Best Practices Library
                </CardTitle>
                <CardDescription className="text-cli-yellow font-mono">
                  Browse and search our curated collection of best practices
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search and Filters */}
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search best practices..."
                      className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-48 bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="Planning">Planning</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Tool Selection">Tool Selection</SelectItem>
                      <SelectItem value="Quality Assurance">Quality Assurance</SelectItem>
                      <SelectItem value="Performance">Performance</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48 bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="workflow">Workflow</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="tool_usage">Tool Usage</SelectItem>
                      <SelectItem value="configuration">Configuration</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleBestPracticesSearch}
                    className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
                  >
                    {safeLucideIcon('Search', 'h-4 w-4')}
                  </Button>
                </div>

                {/* Best Practices Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bestPractices.map((practice) => (
                    <Card key={practice.id} className="bg-cli-bg/50 border-cli-teal/20 hover:border-cli-coral/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-cli-teal font-mono text-lg">{practice.title}</CardTitle>
                          <div className="flex flex-col gap-1">
                            <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
                              {practice.type}
                            </Badge>
                            <Badge variant="outline" className={cn(
                              "font-mono text-xs",
                              practice.difficulty === 'beginner' ? "border-cli-green text-cli-green" :
                                practice.difficulty === 'intermediate' ? "border-cli-yellow text-cli-yellow" :
                                  "border-cli-coral text-cli-coral"
                            )}>
                              {practice.difficulty}
                            </Badge>
                          </div>
                        </div>
                        <CardDescription className="text-cli-yellow font-mono text-sm">
                          {practice.description}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-xs font-mono text-cli-green">
                            {safeLucideIcon('Clock', 'h-3 w-3')}
                            <span>{practice.estimatedTime}</span>
                          </div>

                          <div className="flex items-center gap-2 text-xs font-mono text-cli-coral">
                            {safeLucideIcon('Tag', 'h-3 w-3')}
                            <span>{practice.category}</span>
                          </div>

                          {practice.tags && practice.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {practice.tags.slice(0, 3).map((tag, index) => (
                                <Badge key={index} variant="outline" className="border-cli-yellow/50 text-cli-yellow font-mono text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="pt-2 border-t border-cli-teal/20">
                            <p className="text-cli-green font-mono text-xs line-clamp-3">
                              {practice.content.substring(0, 120)}...
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}


        {/* Agents View */}
        {activeView === 'agents' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-mono font-bold text-cli-teal">Agents & Workflows</h2>
                <p className="text-cli-yellow font-mono mt-2">Manage your AI agents and workflow configurations</p>
              </div>
              <Button
                onClick={() => setActiveView("builder")}
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
              >
                {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
                New Agent
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {agents.map((agent) => (
                <Card key={agent.id} className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal hover:shadow-cli-glow transition-all duration-300 cursor-pointer"
                  onClick={() => setSelectedAgent(agent)}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-cli-teal font-mono text-lg flex items-center gap-2">
                        {safeLucideIcon(agent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5')}
                        {agent.name}
                      </CardTitle>
                      <Badge variant="outline" className="border-cli-coral text-cli-coral font-mono text-xs">
                        {agent.type}
                      </Badge>
                    </div>
                    <CardDescription className="text-cli-yellow font-mono">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="bg-cli-bg/50 p-3 rounded-lg border border-cli-teal/20">
                        <p className="text-xs font-mono text-cli-yellow mb-2">Task Requirements:</p>
                        <p className="text-sm font-mono text-cli-teal truncate">
                          {agent.taskRequirements.substring(0, 80)}...
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono">
                        <Badge variant="outline" className={cn(
                          "font-mono",
                          agent.status === 'active' ? "border-cli-green text-cli-green" :
                            agent.status === 'draft' ? "border-cli-yellow text-cli-yellow" : "border-cli-coral text-cli-coral"
                        )}>
                          {agent.status}
                        </Badge>
                        <span className="text-cli-coral">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Builder View */}
        {activeView === 'builder' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mono font-bold text-cli-teal">Agent & Workflow Builder</h2>
              <p className="text-cli-yellow font-mono">Create intelligent agents and workflows with AI assistance</p>
            </div>

            <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal max-w-4xl mx-auto">
              <CardHeader>
                <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                  {safeLucideIcon('Wrench', 'h-5 w-5')}
                  Configuration Builder
                </CardTitle>
                <CardDescription className="text-cli-yellow font-mono">
                  Provide task requirements and select tools to generate optimized configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form method="post" className="space-y-6">
                  <input type="hidden" name="intent" value={`generate_${generationType}`} />
                  <input type="hidden" name="selectedTools" value={JSON.stringify(selectedTools)} />
                  <input type="hidden" name="toolUsageInstructions" value={JSON.stringify(toolUsageInstructions)} />

                  <div className="space-y-2">
                    <Label className="text-cli-yellow font-mono">Configuration Type</Label>
                    <div className="flex gap-4">
                      <button
                        type="button"
                        onClick={() => setGenerationType("agent")}
                        className={cn(
                          "px-4 py-2 rounded-lg font-mono text-sm transition-colors",
                          generationType === "agent"
                            ? "bg-cli-teal text-white"
                            : "bg-cli-bg/50 text-cli-teal border border-cli-teal/30"
                        )}
                      >
                        {safeLucideIcon('Bot', 'mr-2 h-4 w-4')}
                        Agent
                      </button>
                      <button
                        type="button"
                        onClick={() => setGenerationType("workflow")}
                        className={cn(
                          "px-4 py-2 rounded-lg font-mono text-sm transition-colors",
                          generationType === "workflow"
                            ? "bg-cli-teal text-white"
                            : "bg-cli-bg/50 text-cli-teal border border-cli-teal/30"
                        )}
                      >
                        {safeLucideIcon('GitBranch', 'mr-2 h-4 w-4')}
                        Workflow
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-cli-yellow font-mono">Name</Label>
                      <Input
                        name="name"
                        placeholder={`e.g., ${generationType === 'agent' ? 'Data Analysis Agent' : 'Code Review Workflow'}`}
                        className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-cli-yellow font-mono">Description</Label>
                      <Input
                        name="description"
                        placeholder="Brief description of the purpose"
                        className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cli-yellow font-mono">Task Requirements</Label>
                    <Textarea
                      name="taskRequirements"
                      placeholder="Describe what this agent/workflow should accomplish. Be specific about inputs, outputs, and expected behavior."
                      rows={4}
                      className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono focus:border-cli-coral resize-none"
                      required
                    />
                    <p className="text-xs text-cli-coral font-mono">
                      Tip: Include details about data types, expected outputs, and any constraints
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-cli-yellow font-mono">Available Tools</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-4 bg-cli-bg/30 rounded-lg border border-cli-teal/20">
                      {tools.map((tool) => (
                        <div key={tool.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tool-${tool.id}`}
                            checked={selectedTools.includes(tool.name)}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setSelectedTools([...selectedTools, tool.name]);
                                // Initialize usage instruction for this tool
                                setToolUsageInstructions(prev => ({
                                  ...prev,
                                  [tool.name]: prev[tool.name] || ''
                                }));
                              } else {
                                setSelectedTools(selectedTools.filter(t => t !== tool.name));
                                // Remove usage instruction for this tool
                                setToolUsageInstructions(prev => {
                                  const newInstructions = { ...prev };
                                  delete newInstructions[tool.name];
                                  return newInstructions;
                                });
                              }
                            }}
                            className="border-cli-teal/50"
                          />
                          <Label
                            htmlFor={`tool-${tool.id}`}
                            className="text-cli-teal font-mono text-sm cursor-pointer"
                          >
                            {tool.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-cli-yellow font-mono">
                      Selected: {selectedTools.length} tools
                    </p>
                  </div>

                  {/* Tool Usage Instructions */}
                  {selectedTools.length > 0 && (
                    <div className="space-y-4">
                      <Label className="text-cli-yellow font-mono">Tool Usage Instructions</Label>
                      <div className="space-y-3">
                        {selectedTools.map((toolName) => {
                          const tool = tools.find(t => t.name === toolName);
                          return (
                            <div key={toolName} className="space-y-2">
                              <Label className="text-cli-teal font-mono text-sm">
                                {toolName} - 使用说明
                              </Label>
                              <Textarea
                                placeholder={`请描述在此${generationType === 'agent' ? 'agent' : 'workflow'}中如何使用 ${toolName} 工具...`}
                                value={toolUsageInstructions[toolName] || ''}
                                onChange={(e) => {
                                  setToolUsageInstructions(prev => ({
                                    ...prev,
                                    [toolName]: e.target.value
                                  }));
                                }}
                                rows={2}
                                className="bg-cli-bg/50 border-cli-teal/30 text-cli-teal font-mono text-sm focus:border-cli-coral resize-none"
                              />
                              {tool?.description && (
                                <p className="text-xs text-cli-coral/70 font-mono">
                                  工具描述: {tool.description}
                                </p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="submit"
                      name="intent"
                      value="validate_config"
                      variant="outline"
                      disabled={isSubmitting}
                      className="border-cli-yellow text-cli-yellow hover:bg-cli-yellow/10 font-mono"
                    >
                      {safeLucideIcon('CheckCircle', 'mr-2 h-4 w-4')}
                      Validate Config
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow"
                    >
                      {isSubmitting ? (
                        <>
                          {safeLucideIcon('Loader2', 'mr-2 h-4 w-4 animate-spin')}
                          Generating...
                        </>
                      ) : (
                        <>
                          {safeLucideIcon('Sparkles', 'mr-2 h-4 w-4')}
                          Generate {generationType.charAt(0).toUpperCase() + generationType.slice(1)}
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Validation Results */}
                {actionData && 'validation' in actionData && (actionData as any).validation && (
                  <div className="mt-6 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                    <h4 className="font-mono font-semibold text-cli-teal mb-3">Configuration Validation</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        {(actionData as any).validation.isComplete ? (
                          <>
                            {safeLucideIcon('CheckCircle', 'h-5 w-5 text-cli-green')}
                            <span className="text-cli-green font-mono">Configuration is complete</span>
                          </>
                        ) : (
                          <>
                            {safeLucideIcon('AlertCircle', 'h-5 w-5 text-cli-yellow')}
                            <span className="text-cli-yellow font-mono">Configuration needs improvement</span>
                          </>
                        )}
                      </div>

                      {(actionData as any).validation.missingInfo.length > 0 && (
                        <div>
                          <p className="text-cli-coral font-mono text-sm mb-2">Missing Information:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {(actionData as any).validation.missingInfo.map((info: string, index: number) => (
                              <li key={index} className="text-cli-yellow font-mono text-sm">{info}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {(actionData as any).validation.recommendations.length > 0 && (
                        <div>
                          <p className="text-cli-teal font-mono text-sm mb-2">Recommendations:</p>
                          <ul className="list-disc list-inside space-y-1">
                            {(actionData as any).validation.recommendations.map((rec: string, index: number) => (
                              <li key={index} className="text-cli-green font-mono text-sm">{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Terminal View */}
        {activeView === 'terminal' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mono font-bold text-cli-teal">Interactive Terminal</h2>
              <p className="text-cli-yellow font-mono">Execute CLI commands and interact with your agents</p>
            </div>

            <Card className="bg-cli-terminal border-cli-teal/30 shadow-terminal animate-terminal-glow">
              <CardContent className="p-0">
                <div
                  ref={terminalRef}
                  className="h-96 overflow-y-auto p-4 font-mono text-sm bg-cli-bg/30"
                  onClick={() => setIsTerminalActive(true)}
                >
                  {terminalHistory.map((line, index) => (
                    <div key={index} className={cn(
                      "mb-1",
                      line.startsWith('$') ? 'text-cli-coral' : 'text-cli-green',
                      line.includes('✓') && 'text-cli-teal',
                      line.includes('Error') && 'text-red-400'
                    )}>
                      {line}
                    </div>
                  ))}
                  <div className="flex items-center">
                    <span className="text-cli-coral mr-2">$</span>
                    <input
                      type="text"
                      value={currentCommand}
                      onChange={(e) => setCurrentCommand(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleTerminalCommand(currentCommand);
                        }
                      }}
                      className="flex-1 bg-transparent border-none outline-none text-cli-green font-mono"
                      placeholder="Type a command..."
                      autoFocus={isTerminalActive}
                    />
                    <span className="text-cli-green animate-blink">|</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Command Reference */}
            <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
              <CardHeader>
                <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                  {safeLucideIcon('BookOpen', 'h-5 w-5')}
                  Command Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {cliCommands.map((cmd, index) => (
                    <div key={index} className="p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                      <div className="space-y-2">
                        <code className="text-cli-coral font-mono font-semibold">{cmd.command}</code>
                        <p className="text-cli-yellow font-mono text-sm">{cmd.description}</p>
                        <code className="text-cli-green font-mono text-xs block bg-cli-terminal/50 p-2 rounded">
                          {cmd.example}
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Tools View */}
        {activeView === 'tools' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-mono font-bold text-cli-teal">Tools Management</h2>
                <p className="text-cli-yellow font-mono mt-2">Manage your MCP, CLI, and OpenAPI tools</p>
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono shadow-cli-glow">
                    {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
                    Add Tool
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
                  <DialogHeader>
                    <DialogTitle className="text-cli-teal font-mono">Add New Tool</DialogTitle>
                    <DialogDescription className="text-cli-yellow font-mono">
                      Configure a new tool for your agent workflows
                    </DialogDescription>
                  </DialogHeader>
                  <Form method="post" className="space-y-4">
                    <input type="hidden" name="intent" value="create_tool" />
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-cli-teal font-mono">Tool Name</Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="Enter tool name"
                          className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-cli-teal font-mono">Category</Label>
                        <Input
                          id="category"
                          name="category"
                          placeholder="e.g., development, productivity"
                          className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-cli-teal font-mono">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Describe what this tool does"
                        className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="toolType" className="text-cli-teal font-mono">Tool Type</Label>
                      <Select name="toolType" value={selectedToolType} onValueChange={handleToolTypeChange} required>
                        <SelectTrigger className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono">
                          <SelectValue placeholder="Select tool type" />
                        </SelectTrigger>
                        <SelectContent className="bg-cli-terminal border-cli-teal/30">
                          <SelectItem value="mcp" className="text-cli-green font-mono">MCP</SelectItem>
                          <SelectItem value="cli" className="text-cli-green font-mono">CLI</SelectItem>
                          <SelectItem value="openapi" className="text-cli-green font-mono">OpenAPI</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="usage" className="text-cli-teal font-mono">Usage Instructions</Label>
                      <Textarea
                        id="usage"
                        name="usage"
                        value={toolUsage}
                        onChange={(e) => setToolUsage(e.target.value)}
                        placeholder="Usage instructions will be auto-filled based on tool type"
                        className="bg-cli-bg border-cli-teal/30 text-cli-green font-mono"
                        rows={4}
                      />
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={resetToolForm}
                        className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
                      >
                        {isSubmitting ? 'Creating...' : 'Create Tool'}
                      </Button>
                    </DialogFooter>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <Card key={tool.id} className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal hover:shadow-cli-glow transition-all duration-300">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-cli-teal font-mono text-lg flex items-center gap-2">
                        {safeLucideIcon(
                          tool.toolType === 'mcp' ? 'Plug' :
                            tool.toolType === 'cli' ? 'Terminal' : 'Globe',
                          'h-5 w-5'
                        )}
                        {tool.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn(
                          "font-mono text-xs",
                          tool.toolType === 'mcp' ? "border-cli-teal text-cli-teal" :
                            tool.toolType === 'cli' ? "border-cli-yellow text-cli-yellow" :
                              "border-cli-coral text-cli-coral"
                        )}>
                          {tool.toolType.toUpperCase()}
                        </Badge>
                        <Switch
                          checked={tool.isActive}
                          onCheckedChange={() => handleToggleTool(tool)}
                          className="data-[state=checked]:bg-cli-teal"
                        />
                      </div>
                    </div>
                    <CardDescription className="text-cli-yellow font-mono">
                      {tool.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-cli-coral font-mono">Category:</span>
                        <Badge variant="secondary" className="bg-cli-bg/50 text-cli-green font-mono">
                          {tool.category}
                        </Badge>
                      </div>
                      {tool.usage && (
                        <div className="space-y-2">
                          <span className="text-cli-coral font-mono text-sm">Usage:</span>
                          <p className="text-cli-green font-mono text-xs bg-cli-bg/50 p-2 rounded border border-cli-teal/20 line-clamp-3">
                            {tool.usage}
                          </p>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-cli-coral font-mono">Created:</span>
                        <span className="text-cli-yellow font-mono">
                          {new Date(tool.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditTool(tool)}
                        className="flex-1 border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
                      >
                        {safeLucideIcon('Edit', 'mr-1 h-3 w-3')}
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTool(tool)}
                        className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
                      >
                        {safeLucideIcon('Trash2', 'h-3 w-3')}
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {tools.length === 0 && (
              <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
                <CardContent className="text-center py-12">
                  <div className="space-y-4">
                    {safeLucideIcon('Settings', 'h-12 w-12 text-cli-teal/50 mx-auto')}
                    <div>
                      <h3 className="text-cli-teal font-mono text-lg font-semibold">No Tools Configured</h3>
                      <p className="text-cli-yellow font-mono mt-2">Start by adding your first tool to enhance your agent workflows</p>
                    </div>
                    <Button
                      onClick={() => setIsCreateModalOpen(true)}
                      className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
                    >
                      {safeLucideIcon('Plus', 'mr-2 h-4 w-4')}
                      Add Your First Tool
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Documentation View */}
        {activeView === 'docs' && (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-3xl font-mono font-bold text-cli-teal">Documentation</h2>
              <p className="text-cli-yellow font-mono">Learn how to build and configure agent workflows</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Getting Started */}
              <Card className="bg-cli-terminal/50 border-cli-teal/30 shadow-terminal">
                <CardHeader>
                  <CardTitle className="text-cli-teal font-mono flex items-center gap-2">
                    {safeLucideIcon('Rocket', 'h-5 w-5')}
                    Getting Started
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cli-teal/20 rounded-full flex items-center justify-center text-cli-teal font-mono text-xs font-bold">1</div>
                      <div>
                        <h4 className="font-mono font-semibold text-cli-teal">Start AI Guidance</h4>
                        <p className="text-sm text-cli-yellow font-mono">Use AI assistance for personalized help</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cli-coral/20 rounded-full flex items-center justify-center text-cli-coral font-mono text-xs font-bold">2</div>
                      <div>
                        <h4 className="font-mono font-semibold text-cli-coral">Define Requirements</h4>
                        <p className="text-sm text-cli-yellow font-mono">Specify your task requirements clearly</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-cli-yellow/20 rounded-full flex items-center justify-center text-cli-yellow font-mono text-xs font-bold">3</div>
                      <div>
                        <h4 className="font-mono font-semibold text-cli-yellow">Generate & Test</h4>
                        <p className="text-sm text-cli-yellow font-mono">Generate configuration and test via terminal</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Builder Features */}
              <Card className="bg-cli-terminal/50 border-cli-coral/30 shadow-terminal">
                <CardHeader>
                  <CardTitle className="text-cli-coral font-mono flex items-center gap-2">
                    {safeLucideIcon('Wrench', 'h-5 w-5')}
                    Builder Features
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-mono font-semibold text-cli-coral mb-2">Interactive Builder</h4>
                      <p className="text-cli-yellow font-mono text-sm">
                        Step-by-step interface for building configurations
                      </p>
                    </div>
                    <div>
                      <h4 className="font-mono font-semibold text-cli-coral mb-2">Smart Validation</h4>
                      <p className="text-cli-yellow font-mono text-sm">
                        AI-powered validation and suggestions for improvements
                      </p>
                    </div>
                    <div>
                      <h4 className="font-mono font-semibold text-cli-coral mb-2">Tool Selection</h4>
                      <p className="text-cli-yellow font-mono text-sm">
                        Choose from available tools to optimize your workflow
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Best Practices */}
              <Card className="bg-cli-terminal/50 border-cli-yellow/30 shadow-terminal">
                <CardHeader>
                  <CardTitle className="text-cli-yellow font-mono flex items-center gap-2">
                    {safeLucideIcon('Lightbulb', 'h-5 w-5')}
                    Best Practices
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-cli-yellow rounded-full mt-2"></div>
                      <p className="text-sm text-cli-yellow font-mono">Start with the builder for step-by-step help</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-cli-yellow rounded-full mt-2"></div>
                      <p className="text-sm text-cli-yellow font-mono">Be specific about input/output formats</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-cli-yellow rounded-full mt-2"></div>
                      <p className="text-sm text-cli-yellow font-mono">Use validation to improve quality</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-cli-yellow rounded-full mt-2"></div>
                      <p className="text-sm text-cli-yellow font-mono">Test configurations before deployment</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="bg-cli-terminal border-cli-teal/30 max-w-4xl">
            <DialogHeader>
              <DialogTitle className="text-cli-teal font-mono flex items-center gap-2">
                {safeLucideIcon(selectedAgent.type === 'agent' ? 'Bot' : 'GitBranch', 'h-5 w-5')}
                {selectedAgent.name}
              </DialogTitle>
              <DialogDescription className="text-cli-yellow font-mono">
                {selectedAgent.description}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              <div>
                <Label className="text-cli-yellow font-mono">Task Requirements</Label>
                <div className="mt-2 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                  <p className="text-cli-green font-mono text-sm whitespace-pre-wrap">
                    {selectedAgent.taskRequirements}
                  </p>
                </div>
              </div>

              {selectedAgent.generatedPrompt && (
                <div>
                  <Label className="text-cli-yellow font-mono">Generated Prompt</Label>
                  <div className="mt-2 p-4 bg-cli-bg/50 rounded-lg border border-cli-teal/20">
                    <p className="text-cli-green font-mono text-sm whitespace-pre-wrap">
                      {selectedAgent.generatedPrompt}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Edit Tool Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="bg-cli-terminal border-cli-teal/30 text-cli-green max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-cli-teal font-mono">Edit Tool</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Update the tool configuration
            </DialogDescription>
          </DialogHeader>
          
          <toolFetcher.Form method="post" className="space-y-4">
            <input type="hidden" name="intent" value="update_tool" />
            <input type="hidden" name="toolId" value={editingTool?.id || ''} />
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-name" className="text-cli-yellow font-mono">Tool Name</Label>
              <Input
                id="edit-tool-name"
                name="name"
                defaultValue={editingTool?.name || ''}
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-description" className="text-cli-yellow font-mono">Description</Label>
              <Textarea
                id="edit-tool-description"
                name="description"
                defaultValue={editingTool?.description || ''}
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal min-h-[100px]"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-tool-category" className="text-cli-yellow font-mono">Category</Label>
                <Select name="category" defaultValue={editingTool?.category || ''}>
                  <SelectTrigger className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="development" className="text-cli-green font-mono">Development</SelectItem>
                    <SelectItem value="automation" className="text-cli-green font-mono">Automation</SelectItem>
                    <SelectItem value="integration" className="text-cli-green font-mono">Integration</SelectItem>
                    <SelectItem value="analysis" className="text-cli-green font-mono">Analysis</SelectItem>
                    <SelectItem value="communication" className="text-cli-green font-mono">Communication</SelectItem>
                    <SelectItem value="other" className="text-cli-green font-mono">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-tool-type" className="text-cli-yellow font-mono">Tool Type</Label>
                <Select name="toolType" defaultValue={editingTool?.toolType || ''}>
                  <SelectTrigger className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-cli-terminal border-cli-teal/30">
                    <SelectItem value="mcp" className="text-cli-green font-mono">MCP</SelectItem>
                    <SelectItem value="cli" className="text-cli-green font-mono">CLI</SelectItem>
                    <SelectItem value="openapi" className="text-cli-green font-mono">OpenAPI</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-tool-usage" className="text-cli-yellow font-mono">Usage Instructions</Label>
              <Textarea
                id="edit-tool-usage"
                name="usage"
                defaultValue={editingTool?.usage || ''}
                placeholder="Describe how to use this tool..."
                className="bg-cli-bg/50 border-cli-teal/30 text-cli-green font-mono focus:border-cli-teal min-h-[80px]"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                name="isActive"
                defaultChecked={editingTool?.isActive || false}
                className="data-[state=checked]:bg-cli-teal"
              />
              <Label className="text-cli-yellow font-mono">Tool is active</Label>
            </div>
            
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditModalOpen(false);
                  resetEditToolForm();
                }}
                className="border-cli-coral text-cli-coral hover:bg-cli-coral/10 font-mono"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-cli-teal hover:bg-cli-teal/80 text-white font-mono"
              >
                Update Tool
              </Button>
            </DialogFooter>
          </toolFetcher.Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-cli-terminal border-cli-coral/30 text-cli-green">
          <DialogHeader>
            <DialogTitle className="text-cli-coral font-mono">Delete Tool</DialogTitle>
            <DialogDescription className="text-cli-yellow font-mono">
              Are you sure you want to delete "{toolToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setToolToDelete(null);
              }}
              className="border-cli-teal text-cli-teal hover:bg-cli-teal/10 font-mono"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmDeleteTool}
              className="bg-cli-coral hover:bg-cli-coral/80 text-white font-mono"
            >
              Delete Tool
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}