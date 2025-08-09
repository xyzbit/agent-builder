CREATE TYPE "public"."tool_type" AS ENUM('mcp', 'cli', 'openapi');--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "toolType" "tool_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "tools" ADD COLUMN "usage" text;--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "apiEndpoint";--> statement-breakpoint
ALTER TABLE "tools" DROP COLUMN "parameters";