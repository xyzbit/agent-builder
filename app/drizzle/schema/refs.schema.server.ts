// @ts-nocheck
import { pgTable, text, integer, boolean, timestamp, json, jsonb, varchar, char, numeric, time, date, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Reference categories enum
export const refCategoryEnum = pgEnum("ref_category", ["prompt_template", "workflow_guide", "tool_documentation", "best_practice", "example", "configuration"]);

// References table
export const referencesTable = pgTable("references", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: refCategoryEnum("category").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Validation schemas
export const insertReferenceSchema = createInsertSchema(referencesTable).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// TypeScript types
export type Reference = typeof referencesTable.$inferSelect;
export type InsertReference = z.infer<typeof insertReferenceSchema>;

// Extended types for joined data
export type ReferenceWithUsage = Reference & {
  usageCount: number;
  lastUsed?: Date;
};