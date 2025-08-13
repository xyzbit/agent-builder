// @ts-nocheck
import { eq, desc, ilike, and, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import {
  type Reference,
  type InsertReference,
  type ReferenceWithUsage,
  referencesTable
} from "~/drizzle/schema/schema.server";

export interface IRefsStorage {
  createReference(reference: InsertReference): Promise<Reference>;
  getReferenceById(id: number): Promise<Reference | undefined>;
  getReferences(limit?: number): Promise<Reference[]>;
  getReferencesByCategory(category: string, limit?: number): Promise<Reference[]>;
  searchReferences(query: string, limit?: number): Promise<Reference[]>;
  updateReference(id: number, updates: Partial<InsertReference>): Promise<Reference | undefined>;
  deleteReference(id: number): Promise<boolean>;
  getActiveReferences(): Promise<Reference[]>;
  toggleReferenceStatus(id: number, isActive: boolean): Promise<Reference | undefined>;
}

export class RefsStorage implements IRefsStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[RefsStorage] Starting sample data initialization...");

      // Check if the references table exists
      const tableExists = await this.client.execute(
        sql`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'references'
        )`
      );
      
      const exists = tableExists.rows[0]?.exists;
      console.log("[RefsStorage] References table exists: " + exists);

      if (!exists) {
        console.log("[RefsStorage] No existing references found, creating sample data...");

        const sampleReferences = [
          {
            name: "Agent Prompt Template",
            description: "Standard template for creating agent prompts with role definition and task instructions",
            category: "prompt_template" as const,
            isActive: true,
            content: `You are a helpful AI assistant specialized in {DOMAIN}. Your role is to {ROLE_DESCRIPTION}.

Task: {TASK_DESCRIPTION}

Instructions:
1. {INSTRUCTION_1}
2. {INSTRUCTION_2}
3. {INSTRUCTION_3}

Output Format: {OUTPUT_FORMAT}

Constraints:
- {CONSTRAINT_1}
- {CONSTRAINT_2}

Examples:
{EXAMPLES}`
          },
          {
            name: "Workflow Step Template",
            description: "Template for defining workflow steps with clear inputs and outputs",
            category: "workflow_guide" as const,
            isActive: true,
            content: `## Step {STEP_NUMBER}: {STEP_NAME}

**Purpose:** {STEP_PURPOSE}

**Input:** {INPUT_DESCRIPTION}

**Process:**
1. {PROCESS_STEP_1}
2. {PROCESS_STEP_2}
3. {PROCESS_STEP_3}

**Output:** {OUTPUT_DESCRIPTION}

**Tools Required:** {REQUIRED_TOOLS}

**Error Handling:** {ERROR_HANDLING_STRATEGY}

**Success Criteria:** {SUCCESS_CRITERIA}`
          },
          {
            name: "API Tool Documentation",
            description: "Standard format for documenting API tools and their usage",
            category: "tool_documentation" as const,
            isActive: true,
            content: `# {TOOL_NAME} API Documentation

## Overview
{TOOL_DESCRIPTION}

## Base URL
{BASE_URL}

## Authentication
{AUTH_METHOD}

## Endpoints

### {ENDPOINT_NAME}
- **Method:** {HTTP_METHOD}
- **URL:** {ENDPOINT_URL}
- **Description:** {ENDPOINT_DESCRIPTION}

#### Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| {PARAM_NAME} | {PARAM_TYPE} | {REQUIRED} | {PARAM_DESCRIPTION} |

#### Response
\`\`\`json
{RESPONSE_EXAMPLE}
\`\`\`

#### Error Codes
- {ERROR_CODE}: {ERROR_DESCRIPTION}

## Usage Examples
\`\`\`
{USAGE_EXAMPLE}
\`\`\``
          },
          {
            name: "Error Handling Best Practice",
            description: "Guidelines for implementing robust error handling in agents",
            category: "best_practice" as const,
            isActive: true,
            content: `# Error Handling Best Practices

## Principles
1. **Fail Fast:** Detect errors early in the process
2. **Graceful Degradation:** Provide fallback options when possible
3. **Clear Messaging:** Return meaningful error messages
4. **Logging:** Record errors for debugging and monitoring

## Implementation Patterns

### Input Validation
\`\`\`
if (!input || typeof input !== 'expected_type') {
  throw new ValidationError('Invalid input: expected {type}');
}
\`\`\`

### API Error Handling
\`\`\`
try {
  const response = await apiCall();
  return response.data;
} catch (error) {
  if (error.status === 429) {
    // Rate limit - implement backoff
    await delay(exponentialBackoff());
    return retry();
  }
  throw new APIError('API call failed: ' + error.message);
}
\`\`\`

### Timeout Handling
\`\`\`
const timeoutPromise = new Promise((_, reject) => 
  setTimeout(() => reject(new TimeoutError('Operation timed out')), TIMEOUT_MS)
);

const result = await Promise.race([operation(), timeoutPromise]);
\`\`\``
          },
          {
            name: "Data Processing Example",
            description: "Complete example of processing CSV data with validation and error handling",
            category: "example" as const,
            isActive: true,
            content: `# CSV Data Processing Example

## Scenario
Process customer data from CSV file, validate email addresses, and generate summary report.

## Input Format
\`\`\`csv
name,email,purchase_date,amount
John Doe,john@example.com,2024-01-15,99.99
Jane Smith,invalid-email,2024-01-16,149.99
\`\`\`

## Processing Steps

1. **Load and Parse CSV**
\`\`\`python
import pandas as pd
import re
from datetime import datetime

def load_csv(file_path):
    try:
        df = pd.read_csv(file_path)
        return df
    except FileNotFoundError:
        raise FileError(f'File not found: {file_path}')
    except pd.errors.EmptyDataError:
        raise DataError('CSV file is empty')
\`\`\`

2. **Validate Email Addresses**
\`\`\`python
def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def process_emails(df):
    df['email_valid'] = df['email'].apply(validate_email)
    invalid_emails = df[~df['email_valid']]
    
    if len(invalid_emails) > 0:
        print(f'Warning: {len(invalid_emails)} invalid emails found')
    
    return df
\`\`\`

3. **Generate Summary Report**
\`\`\`python
def generate_summary(df):
    summary = {
        'total_records': len(df),
        'valid_emails': len(df[df['email_valid']]),
        'invalid_emails': len(df[~df['email_valid']]),
        'total_amount': df['amount'].sum(),
        'average_amount': df['amount'].mean(),
        'date_range': {
            'start': df['purchase_date'].min(),
            'end': df['purchase_date'].max()
        }
    }
    return summary
\`\`\`

## Expected Output
\`\`\`json
{
  "total_records": 2,
  "valid_emails": 1,
  "invalid_emails": 1,
  "total_amount": 249.98,
  "average_amount": 124.99,
  "date_range": {
    "start": "2024-01-15",
    "end": "2024-01-16"
  }
}
\`\`\``
          }
        ];

        for (const refData of sampleReferences) {
          await this.createReference(refData);
        }

        console.log("[RefsStorage] Created " + sampleReferences.length + " sample references");
      }

      this.initialized = true;
      console.log("[RefsStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[RefsStorage] Failed to initialize sample data:", error);
      this.initialized = true;
    }
  }

  async createReference(referenceData: InsertReference): Promise<Reference> {
    const reference = {
      ...referenceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await this.client.insert(referencesTable).values(reference).returning();
    return result[0];
  }

  async getReferenceById(id: number): Promise<Reference | undefined> {
    await this.ensureInitialized();
    const result = await this.client.select().from(referencesTable).where(eq(referencesTable.id, id));
    const reference = result[0];

    if (reference) {
      if (reference.createdAt && typeof reference.createdAt === 'string') {
        reference.createdAt = new Date(reference.createdAt);
      }
      if (reference.updatedAt && typeof reference.updatedAt === 'string') {
        reference.updatedAt = new Date(reference.updatedAt);
      }
    }

    return reference;
  }

  async getReferences(limit = 50): Promise<Reference[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(referencesTable)
      .orderBy(desc(referencesTable.updatedAt))
      .limit(limit);

    return result.map(reference => ({
      ...reference,
      createdAt: typeof reference.createdAt === 'string' ? new Date(reference.createdAt) : reference.createdAt,
      updatedAt: typeof reference.updatedAt === 'string' ? new Date(reference.updatedAt) : reference.updatedAt
    }));
  }

  async getReferencesByCategory(category: string, limit = 20): Promise<Reference[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(referencesTable)
      .where(eq(referencesTable.category, category))
      .orderBy(desc(referencesTable.updatedAt))
      .limit(limit);

    return result.map(reference => ({
      ...reference,
      createdAt: typeof reference.createdAt === 'string' ? new Date(reference.createdAt) : reference.createdAt,
      updatedAt: typeof reference.updatedAt === 'string' ? new Date(reference.updatedAt) : reference.updatedAt
    }));
  }

  async searchReferences(query: string, limit = 20): Promise<Reference[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(referencesTable)
      .where(
        ilike(referencesTable.name, `%${query}%`)
      )
      .orderBy(desc(referencesTable.updatedAt))
      .limit(limit);

    return result.map(reference => ({
      ...reference,
      createdAt: typeof reference.createdAt === 'string' ? new Date(reference.createdAt) : reference.createdAt,
      updatedAt: typeof reference.updatedAt === 'string' ? new Date(reference.updatedAt) : reference.updatedAt
    }));
  }

  async getActiveReferences(): Promise<Reference[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(referencesTable)
      .where(eq(referencesTable.isActive, true))
      .orderBy(desc(referencesTable.updatedAt));

    return result.map(reference => ({
      ...reference,
      createdAt: typeof reference.createdAt === 'string' ? new Date(reference.createdAt) : reference.createdAt,
      updatedAt: typeof reference.updatedAt === 'string' ? new Date(reference.updatedAt) : reference.updatedAt
    }));
  }

  async updateReference(id: number, updates: Partial<InsertReference>): Promise<Reference | undefined> {
    const updateData = {
      ...updates,
      updatedAt: new Date()
    };

    const result = await this.client
      .update(referencesTable)
      .set(updateData)
      .where(eq(referencesTable.id, id))
      .returning();

    return result[0];
  }

  async deleteReference(id: number): Promise<boolean> {
    const result = await this.client
      .delete(referencesTable)
      .where(eq(referencesTable.id, id));

    return result.rowCount > 0;
  }

  async toggleReferenceStatus(id: number, isActive: boolean): Promise<Reference | undefined> {
    return this.updateReference(id, { isActive });
  }
}

export const refsStorage = new RefsStorage();