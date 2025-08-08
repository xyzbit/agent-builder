// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Best practice categories enum
export const practiceTypeEnum = pgEnum("practice_type", ["workflow", "agent", "tool_usage", "configuration", "security", "performance"]);
export const practiceStatusEnum = pgEnum("practice_status", ["active", "deprecated", "experimental"]);

// Best practices table
export const bestPracticesTable = pgTable("best_practices", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  type: practiceTypeEnum("type").notNull(),
  status: practiceStatusEnum("status").default("active").notNull(),
  tags: text("tags").array(),
  content: text("content").notNull(),
  examples: json("examples").$type<Array<{
    title: string;
    description: string;
    code?: string;
    configuration?: Record<string, any>;
  }>>(),
  relatedTools: text("related_tools").array(),
  difficulty: text("difficulty").notNull(), // beginner, intermediate, advanced
  estimatedTime: text("estimated_time"), // e.g., "5 minutes", "1 hour"
  benefits: text("benefits").array(),
  commonMistakes: text("common_mistakes").array(),
  metadata: json("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Practice recommendations table
export const practiceRecommendationsTable = pgTable("practice_recommendations", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  sessionId: text("session_id"),
  userInput: text("user_input").notNull(),
  taskType: text("task_type").notNull(),
  selectedTools: text("selected_tools").array(),
  recommendedPractices: json("recommended_practices").$type<Array<{
    practiceId: number;
    relevanceScore: number;
    reasoning: string;
    priority: "high" | "medium" | "low";
  }>>(),
  analysisResults: json("analysis_results").$type<{
    complexity: string;
    riskLevel: string;
    suggestedApproach: string;
    timeEstimate: string;
    requiredSkills: string[];
    potentialChallenges: string[];
  }>(),
  customRecommendations: text("custom_recommendations").array(),
  confidence: integer("confidence"), // 0-100
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Validation schemas
export const insertBestPracticeSchema = createInsertSchema(bestPracticesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPracticeRecommendationSchema = createInsertSchema(practiceRecommendationsTable).omit({
  id: true,
  createdAt: true,
});

// TypeScript types
export type BestPractice = typeof bestPracticesTable.$inferSelect;
export type InsertBestPractice = z.infer<typeof insertBestPracticeSchema>;
export type PracticeRecommendation = typeof practiceRecommendationsTable.$inferSelect;
export type InsertPracticeRecommendation = z.infer<typeof insertPracticeRecommendationSchema>;

// Extended types for joined data
export type BestPracticeWithRecommendations = BestPractice & {
  recommendationCount: number;
  lastUsed?: Date;
};

export type RecommendationWithPractices = PracticeRecommendation & {
  practices: BestPractice[];
};
