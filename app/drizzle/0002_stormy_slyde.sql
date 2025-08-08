CREATE TYPE "public"."practice_status" AS ENUM('active', 'deprecated', 'experimental');--> statement-breakpoint
CREATE TYPE "public"."practice_type" AS ENUM('workflow', 'agent', 'tool_usage', 'configuration', 'security', 'performance');--> statement-breakpoint
CREATE TABLE "best_practices" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "best_practices_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"title" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"type" "practice_type" NOT NULL,
	"status" "practice_status" DEFAULT 'active' NOT NULL,
	"tags" text[],
	"content" text NOT NULL,
	"examples" json,
	"related_tools" text[],
	"difficulty" text NOT NULL,
	"estimated_time" text,
	"benefits" text[],
	"common_mistakes" text[],
	"metadata" json,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "practice_recommendations" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "practice_recommendations_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"session_id" text,
	"user_input" text NOT NULL,
	"task_type" text NOT NULL,
	"selected_tools" text[],
	"recommended_practices" json,
	"analysis_results" json,
	"custom_recommendations" text[],
	"confidence" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
