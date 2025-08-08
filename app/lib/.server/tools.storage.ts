// @ts-nocheck
import { eq, desc, ilike } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type Tool, 
  type InsertTool,
  toolsTable
} from "~/drizzle/schema/schema.server";

export interface IToolsStorage {
  createTool(tool: InsertTool): Promise<Tool>;
  getToolById(id: number): Promise<Tool | undefined>;
  getToolByName(name: string): Promise<Tool | undefined>;
  getTools(limit?: number): Promise<Tool[]>;
  getToolsByCategory(category: string, limit?: number): Promise<Tool[]>;
  searchTools(query: string, limit?: number): Promise<Tool[]>;
  updateTool(id: number, updates: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;
  getActiveTools(): Promise<Tool[]>;
}

export class ToolsStorage implements IToolsStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[ToolsStorage] Starting sample data initialization...");
      
      const existingTools = await this.client.select().from(toolsTable).limit(1);
      console.log("[ToolsStorage] Found " + existingTools.length + " existing tools");

      if (existingTools.length === 0) {
        console.log("[ToolsStorage] No existing tools found, creating sample data...");
        
        const sampleTools = [
          {
            name: "pandas",
            description: "Data manipulation and analysis library for Python",
            category: "Data Analysis",
            apiEndpoint: "/api/tools/pandas",
            parameters: [
              { name: "file_path", type: "string", required: true, description: "Path to data file" },
              { name: "output_format", type: "select", required: false, description: "Output format", defaultValue: "csv" }
            ]
          },
          {
            name: "eslint",
            description: "JavaScript linting tool for code quality",
            category: "Code Quality",
            apiEndpoint: "/api/tools/eslint",
            parameters: [
              { name: "file_path", type: "string", required: true, description: "Path to code file" },
              { name: "config", type: "string", required: false, description: "ESLint configuration" }
            ]
          },
          {
            name: "security-scanner",
            description: "Security vulnerability scanner",
            category: "Security",
            apiEndpoint: "/api/tools/security-scanner",
            parameters: [
              { name: "target", type: "string", required: true, description: "Target to scan" },
              { name: "depth", type: "number", required: false, description: "Scan depth", defaultValue: 3 }
            ]
          },
          {
            name: "matplotlib",
            description: "Python plotting library for data visualization",
            category: "Visualization",
            apiEndpoint: "/api/tools/matplotlib",
            parameters: [
              { name: "data", type: "string", required: true, description: "Data to visualize" },
              { name: "chart_type", type: "select", required: false, description: "Chart type", defaultValue: "line" }
            ]
          },
          {
            name: "sonarqube",
            description: "Code quality and security analysis platform",
            category: "Code Quality",
            apiEndpoint: "/api/tools/sonarqube",
            parameters: [
              { name: "project_key", type: "string", required: true, description: "Project identifier" },
              { name: "branch", type: "string", required: false, description: "Branch to analyze", defaultValue: "main" }
            ]
          }
        ];

        for (const toolData of sampleTools) {
          await this.createTool(toolData);
        }
        
        console.log("[ToolsStorage] Created " + sampleTools.length + " sample tools");
      }

      this.initialized = true;
      console.log("[ToolsStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[ToolsStorage] Failed to initialize sample data:", error);
      this.initialized = true;
    }
  }

  async createTool(toolData: InsertTool): Promise<Tool> {
    const tool = {
      ...toolData,
      createdAt: new Date()
    };
    
    const result = await this.client.insert(toolsTable).values(tool).returning();
    return result[0];
  }

  async getToolById(id: number): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const result = await this.client.select().from(toolsTable).where(eq(toolsTable.id, id));
    const tool = result[0];
    
    if (tool && tool.createdAt && typeof tool.createdAt === 'string') {
      tool.createdAt = new Date(tool.createdAt);
    }
    
    return tool;
  }

  async getToolByName(name: string): Promise<Tool | undefined> {
    await this.ensureInitialized();
    const result = await this.client.select().from(toolsTable).where(eq(toolsTable.name, name));
    const tool = result[0];
    
    if (tool && tool.createdAt && typeof tool.createdAt === 'string') {
      tool.createdAt = new Date(tool.createdAt);
    }
    
    return tool;
  }

  async getTools(limit = 50): Promise<Tool[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(toolsTable)
      .orderBy(desc(toolsTable.createdAt))
      .limit(limit);

    return result.map(tool => ({
      ...tool,
      createdAt: typeof tool.createdAt === 'string' ? new Date(tool.createdAt) : tool.createdAt
    }));
  }

  async getToolsByCategory(category: string, limit = 20): Promise<Tool[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(toolsTable)
      .where(eq(toolsTable.category, category))
      .orderBy(desc(toolsTable.createdAt))
      .limit(limit);

    return result.map(tool => ({
      ...tool,
      createdAt: typeof tool.createdAt === 'string' ? new Date(tool.createdAt) : tool.createdAt
    }));
  }

  async searchTools(query: string, limit = 20): Promise<Tool[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(toolsTable)
      .where(ilike(toolsTable.name, `%${query}%`))
      .orderBy(desc(toolsTable.createdAt))
      .limit(limit);

    return result.map(tool => ({
      ...tool,
      createdAt: typeof tool.createdAt === 'string' ? new Date(tool.createdAt) : tool.createdAt
    }));
  }

  async getActiveTools(): Promise<Tool[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(toolsTable)
      .where(eq(toolsTable.isActive, true))
      .orderBy(desc(toolsTable.createdAt));

    return result.map(tool => ({
      ...tool,
      createdAt: typeof tool.createdAt === 'string' ? new Date(tool.createdAt) : tool.createdAt
    }));
  }

  async updateTool(id: number, updates: Partial<InsertTool>): Promise<Tool | undefined> {
    const result = await this.client
      .update(toolsTable)
      .set(updates)
      .where(eq(toolsTable.id, id))
      .returning();

    return result[0];
  }

  async deleteTool(id: number): Promise<boolean> {
    const result = await this.client
      .delete(toolsTable)
      .where(eq(toolsTable.id, id));

    return result.rowCount > 0;
  }
}

export const toolsStorage = new ToolsStorage();
