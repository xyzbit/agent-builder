// @ts-nocheck
import { eq, desc, and } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type ExecutionLog, 
  type InsertExecutionLog,
  executionLogsTable
} from "~/drizzle/schema/schema.server";

export interface IExecutionLogsStorage {
  createLog(log: InsertExecutionLog): Promise<ExecutionLog>;
  getLogById(id: number): Promise<ExecutionLog | undefined>;
  getLogsByAgent(agentId: number, limit?: number): Promise<ExecutionLog[]>;
  getRecentLogs(limit?: number): Promise<ExecutionLog[]>;
  deleteLog(id: number): Promise<boolean>;
  deleteLogsByAgent(agentId: number): Promise<boolean>;
}

export class ExecutionLogsStorage implements IExecutionLogsStorage {
  private client: any;

  constructor() {
    this.client = db;
  }

  async createLog(logData: InsertExecutionLog): Promise<ExecutionLog> {
    const log = {
      ...logData,
      createdAt: new Date()
    };
    
    const result = await this.client.insert(executionLogsTable).values(log).returning();
    return result[0];
  }

  async getLogById(id: number): Promise<ExecutionLog | undefined> {
    const result = await this.client.select().from(executionLogsTable).where(eq(executionLogsTable.id, id));
    const log = result[0];
    
    if (log && log.createdAt && typeof log.createdAt === 'string') {
      log.createdAt = new Date(log.createdAt);
    }
    
    return log;
  }

  async getLogsByAgent(agentId: number, limit = 50): Promise<ExecutionLog[]> {
    const result = await this.client
      .select()
      .from(executionLogsTable)
      .where(eq(executionLogsTable.agentId, agentId))
      .orderBy(desc(executionLogsTable.createdAt))
      .limit(limit);

    return result.map(log => ({
      ...log,
      createdAt: typeof log.createdAt === 'string' ? new Date(log.createdAt) : log.createdAt
    }));
  }

  async getRecentLogs(limit = 100): Promise<ExecutionLog[]> {
    const result = await this.client
      .select()
      .from(executionLogsTable)
      .orderBy(desc(executionLogsTable.createdAt))
      .limit(limit);

    return result.map(log => ({
      ...log,
      createdAt: typeof log.createdAt === 'string' ? new Date(log.createdAt) : log.createdAt
    }));
  }

  async deleteLog(id: number): Promise<boolean> {
    const result = await this.client
      .delete(executionLogsTable)
      .where(eq(executionLogsTable.id, id));

    return result.rowCount > 0;
  }

  async deleteLogsByAgent(agentId: number): Promise<boolean> {
    const result = await this.client
      .delete(executionLogsTable)
      .where(eq(executionLogsTable.agentId, agentId));

    return result.rowCount > 0;
  }
}

export const executionLogsStorage = new ExecutionLogsStorage();
