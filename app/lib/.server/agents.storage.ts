// @ts-nocheck
import { eq, desc, and, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type Agent, 
  type InsertAgent, 
  type AgentWithTools,
  type AgentWithLogs,
  agentsTable,
  toolsTable,
  agentToolsTable,
  executionLogsTable
} from "~/drizzle/schema/schema.server";

export interface IAgentsStorage {
  createAgent(agent: InsertAgent): Promise<Agent>;
  getAgentById(id: number): Promise<Agent | undefined>;
  getAgentWithTools(id: number): Promise<AgentWithTools | undefined>;
  getAgentWithLogs(id: number): Promise<AgentWithLogs | undefined>;
  getAgents(limit?: number): Promise<Agent[]>;
  getAgentsByType(type: "agent" | "workflow", limit?: number): Promise<Agent[]>;
  updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined>;
  deleteAgent(id: number): Promise<boolean>;
  addToolToAgent(agentId: number, toolId: number, configuration?: Record<string, any>): Promise<boolean>;
  removeToolFromAgent(agentId: number, toolId: number): Promise<boolean>;
}

export class AgentsStorage implements IAgentsStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[AgentsStorage] Starting sample data initialization...");
      
      const existingAgents = await this.client.select().from(agentsTable).limit(1);
      console.log("[AgentsStorage] Found " + existingAgents.length + " existing agents");

      if (existingAgents.length === 0) {
        console.log("[AgentsStorage] No existing agents found, creating sample data...");
        
        const sampleAgents = [
          {
            name: "Data Analysis Agent",
            description: "Analyze datasets and generate insights with statistical analysis",
            type: "agent" as const,
            taskRequirements: "Analyze CSV data files, identify trends, generate visualizations",
            configuration: {
              tools: ["pandas", "matplotlib", "seaborn"],
              parameters: {
                output_format: "detailed",
                include_charts: true,
                statistical_tests: true
              }
            }
          },
          {
            name: "Code Review Workflow",
            description: "Systematic code review process with security and performance checks",
            type: "workflow" as const,
            taskRequirements: "Review code for best practices, security vulnerabilities, performance issues",
            configuration: {
              tools: ["eslint", "sonarqube", "security-scanner"],
              workflow_steps: [
                {
                  step: "Syntax Check",
                  description: "Check for syntax errors and basic formatting",
                  tools: ["eslint"]
                },
                {
                  step: "Security Analysis",
                  description: "Scan for security vulnerabilities",
                  tools: ["security-scanner"]
                },
                {
                  step: "Performance Review",
                  description: "Analyze performance implications",
                  tools: ["sonarqube"]
                }
              ]
            }
          }
        ];

        for (const agentData of sampleAgents) {
          await this.createAgent(agentData);
        }
        
        console.log("[AgentsStorage] Created " + sampleAgents.length + " sample agents");
      }

      this.initialized = true;
      console.log("[AgentsStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[AgentsStorage] Failed to initialize sample data:", error);
      this.initialized = true;
    }
  }

  async createAgent(agentData: InsertAgent): Promise<Agent> {
    const agent = {
      ...agentData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.client.insert(agentsTable).values(agent).returning();
    return result[0];
  }

  async getAgentById(id: number): Promise<Agent | undefined> {
    await this.ensureInitialized();
    const result = await this.client.select().from(agentsTable).where(eq(agentsTable.id, id));
    const agent = result[0];
    
    if (agent) {
      if (agent.createdAt && typeof agent.createdAt === 'string') {
        agent.createdAt = new Date(agent.createdAt);
      }
      if (agent.updatedAt && typeof agent.updatedAt === 'string') {
        agent.updatedAt = new Date(agent.updatedAt);
      }
    }
    
    return agent;
  }

  async getAgentWithTools(id: number): Promise<AgentWithTools | undefined> {
    await this.ensureInitialized();
    const agent = await this.getAgentById(id);
    if (!agent) return undefined;

    const agentTools = await this.client
      .select({
        tool: toolsTable,
        configuration: agentToolsTable.configuration
      })
      .from(agentToolsTable)
      .leftJoin(toolsTable, eq(agentToolsTable.toolId, toolsTable.id))
      .where(eq(agentToolsTable.agentId, id));

    const tools = agentTools.map(at => ({
      ...at.tool,
      configuration: at.configuration
    }));

    return {
      ...agent,
      tools
    };
  }

  async getAgentWithLogs(id: number): Promise<AgentWithLogs | undefined> {
    await this.ensureInitialized();
    const agent = await this.getAgentById(id);
    if (!agent) return undefined;

    const logs = await this.client
      .select()
      .from(executionLogsTable)
      .where(eq(executionLogsTable.agentId, id))
      .orderBy(desc(executionLogsTable.createdAt))
      .limit(10);

    const convertedLogs = logs.map(log => ({
      ...log,
      createdAt: typeof log.createdAt === 'string' ? new Date(log.createdAt) : log.createdAt
    }));

    return {
      ...agent,
      executionLogs: convertedLogs,
      lastExecution: convertedLogs[0]
    };
  }

  async getAgents(limit = 20): Promise<Agent[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(agentsTable)
      .orderBy(desc(agentsTable.createdAt))
      .limit(limit);

    return result.map(agent => ({
      ...agent,
      createdAt: typeof agent.createdAt === 'string' ? new Date(agent.createdAt) : agent.createdAt,
      updatedAt: typeof agent.updatedAt === 'string' ? new Date(agent.updatedAt) : agent.updatedAt
    }));
  }

  async getAgentsByType(type: "agent" | "workflow", limit = 20): Promise<Agent[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(agentsTable)
      .where(eq(agentsTable.type, type))
      .orderBy(desc(agentsTable.createdAt))
      .limit(limit);

    return result.map(agent => ({
      ...agent,
      createdAt: typeof agent.createdAt === 'string' ? new Date(agent.createdAt) : agent.createdAt,
      updatedAt: typeof agent.updatedAt === 'string' ? new Date(agent.updatedAt) : agent.updatedAt
    }));
  }

  async updateAgent(id: number, updates: Partial<InsertAgent>): Promise<Agent | undefined> {
    const result = await this.client
      .update(agentsTable)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      })
      .where(eq(agentsTable.id, id))
      .returning();

    return result[0];
  }

  async deleteAgent(id: number): Promise<boolean> {
    const result = await this.client
      .delete(agentsTable)
      .where(eq(agentsTable.id, id));

    return result.rowCount > 0;
  }

  async addToolToAgent(agentId: number, toolId: number, configuration?: Record<string, any>): Promise<boolean> {
    try {
      await this.client.insert(agentToolsTable).values({
        agentId,
        toolId,
        configuration,
        createdAt: new Date()
      });
      return true;
    } catch (error) {
      console.error("Error adding tool to agent:", error);
      return false;
    }
  }

  async removeToolFromAgent(agentId: number, toolId: number): Promise<boolean> {
    const result = await this.client
      .delete(agentToolsTable)
      .where(and(
        eq(agentToolsTable.agentId, agentId),
        eq(agentToolsTable.toolId, toolId)
      ));

    return result.rowCount > 0;
  }
}

export const agentsStorage = new AgentsStorage();
