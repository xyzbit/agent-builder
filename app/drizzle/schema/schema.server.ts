// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// MANDATORY CORE TABLES - Always include these
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: text().notNull().unique(),
  password: text().notNull(),
});

export const stripeCustomersTable = pgTable("stripe_customers", {
  userId: integer().primaryKey(),
  customerId: text().notNull(),
});

// Agent/Workflow Configuration Tables
export const agentTypesEnum = pgEnum("agent_types", ["agent", "workflow"]);
export const agentStatusEnum = pgEnum("agent_status", ["draft", "active", "archived"]);
export const toolTypeEnum = pgEnum("tool_type", ["mcp", "cli", "openapi"]);

export const agentsTable = pgTable("agents", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull(),
  description: text().notNull(),
  type: agentTypesEnum().notNull(),
  status: agentStatusEnum().default("draft").notNull(),
  taskRequirements: text().notNull(),
  generatedPrompt: text(),
  configuration: json().$type<{
    tools: string[];
    parameters: Record<string, any>;
    workflow_steps?: Array<{
      step: string;
      description: string;
      tools: string[];
    }>;
    best_practices?: string[];
    recommendations?: string[];
  }>(),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});

export const toolsTable = pgTable("tools", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: text().notNull().unique(),
  description: text().notNull(),
  category: text().notNull(),
  toolType: toolTypeEnum().notNull(),
  usage: text(),
  isActive: boolean().default(true).notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const agentToolsTable = pgTable("agent_tools", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer().notNull(),
  toolId: integer().notNull(),
  configuration: json().$type<Record<string, any>>(),
  createdAt: timestamp().defaultNow().notNull(),
});

export const executionLogsTable = pgTable("execution_logs", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  agentId: integer().notNull(),
  command: text().notNull(),
  parameters: json().$type<Record<string, any>>(),
  result: text(),
  status: text().notNull(),
  executionTime: integer(), // milliseconds
  createdAt: timestamp().defaultNow().notNull(),
});

// Export user session schemas
export * from "./user-sessions.schema.server";

// Export best practices schemas
export * from "./best-practices.schema.server";

// Export refs schemas
export * from "./refs.schema.server";

// Validation schemas
export const insertAgentSchema = createInsertSchema(agentsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertToolSchema = createInsertSchema(toolsTable).omit({
  id: true,
  createdAt: true,
});

export const insertExecutionLogSchema = createInsertSchema(executionLogsTable).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type Agent = typeof agentsTable.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Tool = typeof toolsTable.$inferSelect;
export type InsertTool = z.infer<typeof insertToolSchema>;
export type AgentTool = typeof agentToolsTable.$inferSelect;
export type ExecutionLog = typeof executionLogsTable.$inferSelect;
export type InsertExecutionLog = z.infer<typeof insertExecutionLogSchema>;

// Extended types for joined data
export type AgentWithTools = Agent & {
  tools: (Tool & { configuration?: Record<string, any> })[];
};

export type AgentWithLogs = Agent & {
  executionLogs: ExecutionLog[];
  lastExecution?: ExecutionLog;
};
