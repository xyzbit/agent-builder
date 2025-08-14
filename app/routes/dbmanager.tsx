// @ts-nocheck
import React from "react";
import { json, LoaderFunction, ActionFunction } from "@remix-run/node";
import { getDb } from "~/drizzle/config.server";
import { eq, count, inArray, ilike, or, sql } from "drizzle-orm";
import { toSnakeCase } from "drizzle-orm/casing";
import DBManager from "~/components/DBManager";

// Import all schemas from the main schema module
import * as schemaModule from "~/drizzle/schema/schema.server";
import { useLoaderData, useNavigate } from "@remix-run/react";

function isEmpty(value) {
  return value === null || value === undefined || value.trim() === "";
}
// In-memory cache of found schema tables
let schemaCache: any = null;

/**
 * Enhanced schema table discovery with better auto-increment detection
 */
function discoverSchemaTables() {
  try {
    if (schemaCache) return schemaCache;

    const foundTables = {};
    console.log("Schema module keys:", Object.keys(schemaModule));

    Object.entries(schemaModule).forEach(([key, value]) => {
      try {
        console.log(`Checking ${key}:`, typeof value, value?.constructor?.name);

        if (value && typeof value === "object" && value !== null) {
          const hasTableStructure =
            (value._ && typeof value._.name === "string") ||
            (value.$table && typeof value.$table === "object") ||
            (value.constructor &&
              ["PgTable", "MySqlTable", "SQLiteTable"].includes(
                value.constructor.name,
              )) ||
            Object.keys(value).some((prop) => {
              const col = value[prop];
              return (
                col &&
                typeof col === "object" &&
                (col.columnType ||
                  (col.config && col.config.columnType) ||
                  (col.dataType && col.dataType.constructor))
              );
            });

          if (hasTableStructure) {
            console.log(`Found table: ${key}`);
            foundTables[key] = value;
          }

          if (value._def && (value._def.shape || value._def.unknownKeys)) {
            return; // Skip Zod schemas
          }
        }
      } catch (err) {
        console.log(`Error checking if ${key} is a table:`, err);
      }
    });

    console.log("Found tables:", Object.keys(foundTables));
    schemaCache = foundTables;
    return foundTables;
  } catch (err) {
    console.error("Error in discoverSchemaTables:", err);
    return {};
  }
}

/**
 * Enhanced column details extraction with better constraint detection
 */
function getColumnDetails(table: any) {
  const columns = [];
  console.log("Analyzing table structure:", Object.keys(table));

  for (const [colKey, colDef] of Object.entries(table)) {
    try {
      if (
        colKey.startsWith("_") ||
        colKey.startsWith("$") ||
        typeof colDef === "function"
      ) {
        continue;
      }

      if (colDef && typeof colDef === "object" && colDef !== null) {
        let type = "unknown";
        let isPrimaryKey = false;
        let isNotNull = false;
        let hasDefault = false;
        let isAutoIncrement = false;
        let enumValues = null;

        try {
          // Enhanced type detection
          if (colDef.columnType) {
            type = colDef.columnType;
          } else if (colDef.constructor && colDef.constructor.name) {
            type = colDef.constructor.name;
          } else if (colDef.dataType && colDef.dataType.constructor) {
            type = colDef.dataType.constructor.name;
          } else if (colDef.config && colDef.config.columnType) {
            type = colDef.config.columnType;
          }

          // Enhanced constraint detection
          if (colDef.primary || (colDef.config && colDef.config.primaryKey)) {
            isPrimaryKey = true;
          }

          if (colDef.notNull || (colDef.config && colDef.config.notNull)) {
            isNotNull = true;
          }

          // Better auto-increment detection
          if (
            colDef.default !== undefined ||
            (colDef.config && colDef.config.default !== undefined) ||
            colDef.autoIncrement ||
            (colDef.config && colDef.config.autoIncrement) ||
            type.includes("Serial") ||
            type.includes("serial") ||
            type.includes("Identity") ||
            (isPrimaryKey &&
              type.includes("Integer") &&
              colKey.toLowerCase() === "id")
          ) {
            hasDefault = true;
            if (
              type.includes("Serial") ||
              type.includes("serial") ||
              type.includes("Identity") ||
              colDef.autoIncrement
            ) {
              isAutoIncrement = true;
            }
          }

          // Enum detection
          enumValues =
            colDef.enumValues ||
            colDef.config?.enumValues ||
            colDef.dataType?.enumValues ||
            colDef._def?.values ||
            null;

          if (type !== "unknown" || colDef.columnType || colDef.dataType) {
            console.log(`Found column: ${colKey}, type: ${type}`);
            columns.push({
              name: colKey,
              type,
              isPrimaryKey,
              isNotNull,
              hasDefault,
              isAutoIncrement,
              enumValues: Array.isArray(enumValues) ? enumValues : null,
            });
          }
        } catch (err) {
          console.log(`Error detecting column details for ${colKey}:`, err);
        }
      }
    } catch (err) {
      console.log(`Error extracting column ${colKey}:`, err);
    }
  }

  console.log(
    `Found ${columns.length} columns:`,
    columns.map((c) => c.name),
  );
  return columns;
}

/**
 * Get table reference for database operations
 */
function getTableReference(tableName: string) {
  const allTables = discoverSchemaTables();
  const tableEntry = Object.entries(allTables).find(([key, table]) => {
    const name = table._ && table._.name ? table._.name : key;
    return name === tableName;
  });

  return tableEntry ? tableEntry[1] : null;
}

/**
 * Convert form value to appropriate database type
 */
function convertFormValue(value: any, column: any) {
  if (value === null || value === "" || value === undefined) {
    return column.isNotNull && !column.hasDefault ? null : null;
  }

  if (column.type.includes("Integer") || column.type.includes("Serial")) {
    const parsed = parseInt(value as string);
    return isNaN(parsed) ? null : parsed;
  } else if (column.type.includes("Boolean")) {
    return value === "true" || value === true;
  } else if (column.type.includes("Timestamp")) {
    return value ? new Date(value as string) : null;
  } else if (column.type.includes("Float") || column.type.includes("Numeric")) {
    const parsed = parseFloat(value as string);
    return isNaN(parsed) ? null : parsed;
  }

  return value;
}

export const action: ActionFunction = async ({ request }) => {
  if (process.env.ENV === "production") {
    return new Response("Not Found", { status: 404 });
  }
  try {
    const formData = await request.formData();
    const url = new URL(request.url);
    const dbUrl = url.searchParams.get("dbUrl") ?? process.env.DATABASE_URL;
    const showProdDb = url.searchParams.get("showProdDb") === "true";

    const db = getDb(dbUrl, showProdDb);

    const action = formData.get("_action") as string;
    const tableName = formData.get("tableName") as string;

    const table = getTableReference(tableName);
    if (!table) {
      return json({ error: `Table ${tableName} not found` }, { status: 404 });
    }

    const columns = getColumnDetails(table);

    switch (action) {
      case "create": {
        const insertData = {};

        for (const column of columns) {
          // Skip auto-increment primary keys
          if (
            column.isAutoIncrement ||
            (column.isPrimaryKey && column.hasDefault)
          ) {
            continue;
          }

          const value = formData.get(column.name);
          const convertedValue = convertFormValue(value, column);

          if (convertedValue !== null || !column.isNotNull) {
            insertData[column.name] = convertedValue;
          }
        }

        console.log("Insert data:", insertData);
        await db.insert(table).values(insertData);
        return json({ success: true, message: "Record created successfully" });
      }

      case "update": {
        const recordId = formData.get("recordId") as string;
        const updateData = {};

        const pkColumn = columns.find((col) => col.isPrimaryKey);
        if (!pkColumn) {
          return json(
            { error: "No primary key found for table" },
            { status: 400 },
          );
        }

        for (const column of columns) {
          if (!column.isPrimaryKey) {
            const value = formData.get(column.name);
            const convertedValue = convertFormValue(value, column);

            if (convertedValue !== null || !column.isNotNull) {
              updateData[column.name] = convertedValue;
            }
          }
        }

        console.log("Update data:", updateData);
        await db
          .update(table)
          .set(updateData)
          .where(eq(table[pkColumn.name], recordId));

        return json({ success: true, message: "Record updated successfully" });
      }

      case "delete": {
        const recordId = formData.get("recordId") as string;
        const pkColumn = columns.find((col) => col.isPrimaryKey);

        if (!pkColumn) {
          return json(
            { error: "No primary key found for table" },
            { status: 400 },
          );
        }

        await db.delete(table).where(eq(table[pkColumn.name], recordId));
        return json({ success: true, message: "Record deleted successfully" });
      }

      case "bulk-delete": {
        const recordIds = formData.getAll("recordIds[]") as string[];
        const pkColumn = columns.find((col) => col.isPrimaryKey);

        if (!pkColumn) {
          return json(
            { error: "No primary key found for table" },
            { status: 400 },
          );
        }

        if (!recordIds.length) {
          return json({ error: "No records selected" }, { status: 400 });
        }

        await db.delete(table).where(inArray(table[pkColumn.name], recordIds)); // 🧠 Use inArray for bulk delete

        return json({
          success: true,
          message: "Records deleted successfully",
        });
      }

      default:
        return json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Action error:", error);
    return json(
      {
        error: "Operation failed: " + String(error),
        success: false,
      },
      { status: 500 },
    );
  }
};

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const limit = url.searchParams.get("limit") ?? 10;
    const offset = Number(url.searchParams.get("offset")) ?? 0;

    const dbUrl = url.searchParams.get("dbUrl") ?? process.env.DATABASE_URL;
    const showProdDb = url.searchParams.get("showProdDb") === "true";
    const searchTerm = url.searchParams.get("search")?.trim() ?? undefined;

    const db = getDb(dbUrl, showProdDb);

    console.log("Starting dbmanager loader...");

    const allTables = discoverSchemaTables();
    console.log("Discovered tables:", Object.keys(allTables));

    const tablesInfo = [];
    const tablesData = {};

    for (const [key, table] of Object.entries(allTables)) {
      try {
        let tableName;
        if (table._ && table._.name) {
          tableName = table._.name;
        } else if (table.$table && table.$table.name) {
          tableName = table.$table.name;
        } else if (table.tableName) {
          tableName = table.tableName;
        } else if (table.config && table.config.name) {
          tableName = table.config.name;
        } else {
          tableName = key;
        }

        console.log(`Table name resolved to: ${tableName}`);
        const columns = getColumnDetails(table);

        if (columns.length > 0) {
          try {
            console.log(`Loading data for table: ${tableName}`);
            let tableRef = table;
            if (table.$table) {
              tableRef = table.$table;
            }

            const searchConditions = !isEmpty(searchTerm)
              ? Object.entries(tableRef)
                  .filter(([_, column]) => column.dataType === "string")
                  .map(([key]) => {
                    const colKey = toSnakeCase(key);
                    return ilike(
                      sql`${sql.identifier(colKey)}::text`,
                      `%${searchTerm}%`,
                    );
                  })
              : [];

            const [data, totalCount] = await Promise.all([
              searchConditions?.length > 0
                ? db
                    .select()
                    .from(tableRef)
                    .limit(limit)
                    .offset(offset)
                    .where(or(...searchConditions))
                : db.select().from(tableRef).limit(limit).offset(offset),
              searchConditions?.length > 0
                ? db
                    .select({ count: count() })
                    .from(tableRef)
                    .where(or(...searchConditions))
                : db.select({ count: count() }).from(tableRef),
            ]);

            tablesData[tableName] = data;

            tablesInfo.push({
              name: tableName,
              columns,
              tableRef: key,
              count: totalCount?.[0]?.count,
              offset,
            });

            console.log(`Loaded ${data.length} records for ${tableName}`);
          } catch (err) {
            console.error(`Failed to load data for table ${tableName}:`, err);
            tablesData[tableName] = [];
          }
        } else {
          console.log(`No columns found for ${key}, skipping...`);
        }
      } catch (err) {
        console.error(`Error processing table ${key}:`, err);
      }
    }

    console.log(`Final result: ${tablesInfo.length} tables processed`);

    if (tablesInfo.length === 0) {
      const debugInfo = {
        moduleKeys: Object.keys(schemaModule),
        schemaDetails: Object.entries(schemaModule)
          .slice(0, 5)
          .map(([key, value]) => {
            if (typeof value === "object" && value !== null) {
              try {
                return {
                  key,
                  type: typeof value,
                  constructor: value.constructor?.name,
                  hasUnderscore: !!value._,
                  underscoreKeys: value._ ? Object.keys(value._) : [],
                  sampleKeys: Object.keys(value).slice(0, 10),
                };
              } catch (structErr) {
                return { key, error: String(structErr) };
              }
            }
            return { key, type: typeof value };
          }),
        allTablesKeys: Object.keys(allTables),
        tablesFound: Object.keys(allTables).length,
      };

      return json({
        env: process.env.ENV,
        tablesInfo,
        tablesData,
        success: false,
        tablesCount: 0,
        error: "No tables found in the database schema",
        schemaDebugInfo: debugInfo,
      });
    }

    return json({
      env: process.env.ENV,
      tablesInfo,
      tablesData,
      success: true,
      tablesCount: tablesInfo.length,
    });
  } catch (error) {
    console.error("Error in dbmanager loader:", error);
    return json({
      env: process.env.ENV,
      error: "Failed to load database information: " + String(error),
      errorStack: error.stack,
      tablesInfo: [],
      tablesData: {},
      success: false,
      tablesCount: 0,
    });
  }
};

export default function DbManagerComponent() {
  const loaderData = useLoaderData<typeof loader>();
  const navigate = useNavigate();
  React.useEffect(() => {
    if (loaderData.env === "production") {
      navigate("/404", { replace: true });
    }
  }, [loaderData.env, navigate]);
  if (loaderData.env === "production") {
    return null;
  }
  return (
    <>
      <DBManager loaderData={loaderData} />
    </>
  );
}
