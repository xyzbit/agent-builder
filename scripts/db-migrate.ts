import { execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

import { db } from "../app/drizzle/config.server";
import { sql } from "drizzle-orm";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, "..");

function runCommand(command) {
  try {
    const output = execSync(command, {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
    });
    return { success: true, output };
  } catch (error) {
    return {
      success: false,
      output: error.stdout?.toString() || error.message,
    };
  }
}

async function main() {
  console.log("Running initial database migration...");

  // Only reset if explicitly requested via environment variable
  if (process.env.FORCE_DB_RESET === 'true') {
    console.log("🚨 FORCE_DB_RESET is set - resetting database...");
    try {
      await reset();
    } catch (error) {
      console.error("❌ Reset failed");
      console.error(error);
    }
  }

  const firstAttempt = runCommand("pnpm drizzle-kit push");

  if (
    !firstAttempt.success ||
    firstAttempt.output.includes("ASSERTIONS") ||
    firstAttempt.output.includes("created or renamed")
  ) {
    console.log(
      "Migration failed or contains assertions error. Cleaning up and retrying..."
    );
    
    try {
      await reset();
    } catch (error) {
      console.error("❌ Reset failed second time");
      console.error(error);
    }

    console.log("Running migration again...");

    const secondAttempt = runCommand("pnpm drizzle-kit push");

    if (!secondAttempt.success) {
      console.error("Migration failed after cleanup:", secondAttempt.output);
      process.exit(1);
    }
  }

  console.log("Database migration completed");
}

main().catch((error) => {
  console.error("Script failed:", error);
  process.exit(1);
});

async function reset() {
  console.log("⏳ Resetting database...");

  const start = Date.now();

  const query = sql`
      -- Delete all tables
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = current_schema()) LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;
      END $$;
      
      -- Delete enums
      DO $$ DECLARE
          r RECORD;
      BEGIN
          FOR r IN (select t.typname as enum_name
          from pg_type t 
              join pg_enum e on t.oid = e.enumtypid  
              join pg_catalog.pg_namespace n ON n.oid = t.typnamespace
          where n.nspname = current_schema()) LOOP
              EXECUTE 'DROP TYPE IF EXISTS ' || quote_ident(r.enum_name);
          END LOOP;
      END $$;
      
      `;

  await db.execute(query);

  const end = Date.now();
  console.log(`✅ Reset end & took ${end - start}ms`);
  console.log("");
}
