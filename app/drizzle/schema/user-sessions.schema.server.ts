// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User session status enum
export const sessionStatusEnum = pgEnum("session_status", ["active", "completed", "abandoned"]);

// User sessions table for tracking interactive sessions
export const userSessionsTable = pgTable("user_sessions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id"),
  currentStep: text("current_step").notNull(),
  status: sessionStatusEnum("status").default("active").notNull(),
  context: json("context").$type<{
    taskType?: string;
    requirements?: string[];
    selectedTools?: string[];
    missingInfo?: string[];
    recommendations?: string[];
    userResponses?: Record<string, any>;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User interactions table for tracking conversation flow
export const userInteractionsTable = pgTable("user_interactions", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id").notNull(),
  userInput: text("user_input").notNull(),
  aiResponse: text("ai_response"),
  inputType: text("input_type").notNull(), // 'requirement', 'clarification', 'tool_selection', etc.
  metadata: json("metadata").$type<{
    confidence?: number;
    suggestions?: string[];
    nextSteps?: string[];
    validationResults?: any;
  }>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validation schemas
export const insertUserSessionSchema = createInsertSchema(userSessionsTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertUserInteractionSchema = createInsertSchema(userInteractionsTable).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type UserSession = typeof userSessionsTable.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type UserInteraction = typeof userInteractionsTable.$inferSelect;
export type InsertUserInteraction = z.infer<typeof insertUserInteractionSchema>;

// Extended types for joined data
export type UserSessionWithInteractions = UserSession & {
  interactions: UserInteraction[];
  lastInteraction?: UserInteraction;
};
