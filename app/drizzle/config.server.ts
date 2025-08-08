// @ts-nocheck
import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

import * as schema from "./schema/schema.server";

export function getDb(
  dbUrl?: string,
  showProdDb?: boolean,
): ReturnType<typeof drizzle> {
  let connectionUrl: string;
  if (showProdDb) {
    connectionUrl = dbUrl || process.env.DATABASE_URL;
  } else {
    connectionUrl = process.env.DATABASE_URL;
  }
  const db = drizzle(connectionUrl);
  return db;
}

let dbInstance: ReturnType<typeof getDb> | null = null;

export function getDbInstance() {
  if (!dbInstance) {
    try {
      dbInstance = getDb();
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
  return dbInstance;
}

export const db = getDbInstance();

export type Schema = typeof schema;
