CREATE TYPE "public"."ref_category" AS ENUM('prompt_template', 'workflow_guide', 'tool_documentation', 'best_practice', 'example', 'configuration');--> statement-breakpoint
CREATE TABLE "references" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "references_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" "ref_category" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
