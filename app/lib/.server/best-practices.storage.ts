// @ts-nocheck
import { eq, desc, and, ilike, sql } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type BestPractice, 
  type InsertBestPractice,
  type PracticeRecommendation,
  type InsertPracticeRecommendation,
  type BestPracticeWithRecommendations,
  type RecommendationWithPractices,
  bestPracticesTable,
  practiceRecommendationsTable
} from "~/drizzle/schema/schema.server";

export interface IBestPracticesStorage {
  createBestPractice(practice: InsertBestPractice): Promise<BestPractice>;
  getBestPracticeById(id: number): Promise<BestPractice | undefined>;
  getBestPractices(limit?: number): Promise<BestPractice[]>;
  getBestPracticesByCategory(category: string, limit?: number): Promise<BestPractice[]>;
  getBestPracticesByType(type: string, limit?: number): Promise<BestPractice[]>;
  searchBestPractices(query: string, limit?: number): Promise<BestPractice[]>;
  createRecommendation(recommendation: InsertPracticeRecommendation): Promise<PracticeRecommendation>;
  getRecommendationsBySession(sessionId: string): Promise<RecommendationWithPractices[]>;
  getRecentRecommendations(limit?: number): Promise<PracticeRecommendation[]>;
  updateBestPractice(id: number, updates: Partial<InsertBestPractice>): Promise<BestPractice | undefined>;
  deleteBestPractice(id: number): Promise<boolean>;
}

export class BestPracticesStorage implements IBestPracticesStorage {
  private client: any;
  private initialized: boolean = false;

  constructor() {
    this.client = db;
  }

  private async ensureInitialized(): Promise<void> {
    if (this.initialized) return;

    try {
      console.log("[BestPracticesStorage] Starting sample data initialization...");
      
      // Check if the best_practices table exists
      const tableExists = await this.client.execute(
        sql`SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'best_practices'
        )`
      );
      
      const exists = tableExists.rows[0]?.exists;
      console.log("[BestPracticesStorage] Best practices table exists: " + exists);

      if (!exists) {
        console.log("[BestPracticesStorage] No existing practices found, creating sample data...");
        
        const samplePractices = [
          {
            title: "Define Clear Task Requirements",
            description: "Establish specific, measurable, and actionable task requirements before building agents",
            category: "Planning",
            type: "workflow" as const,
            tags: ["requirements", "planning", "clarity"],
            content: "Always start by clearly defining what your agent needs to accomplish. Include input formats, expected outputs, success criteria, and edge cases. This foundation prevents scope creep and ensures focused development.",
            examples: [
              {
                title: "Good Requirement Example",
                description: "Process CSV files with customer data, validate email formats, and generate summary reports in JSON format",
                configuration: {
                  input: "CSV files with columns: name, email, purchase_date",
                  output: "JSON report with validation results and statistics",
                  validation: "Email format validation using regex"
                }
              }
            ],
            relatedTools: ["pandas", "email-validator", "json-processor"],
            difficulty: "beginner",
            estimatedTime: "15 minutes",
            benefits: ["Reduces development time", "Prevents scope creep", "Improves success rate"],
            commonMistakes: ["Vague requirements", "Missing edge cases", "No success criteria"]
          },
          {
            title: "Implement Proper Error Handling",
            description: "Build robust error handling and fallback mechanisms for reliable agent operation",
            category: "Development",
            type: "agent" as const,
            tags: ["error-handling", "reliability", "robustness"],
            content: "Implement comprehensive error handling including input validation, API failures, timeout handling, and graceful degradation. Always provide meaningful error messages and recovery options.",
            examples: [
              {
                title: "API Error Handling",
                description: "Handle API timeouts and rate limits with exponential backoff",
                code: "try { await apiCall(); } catch (error) { if (error.status === 429) { await delay(exponentialBackoff()); retry(); } }"
              }
            ],
            relatedTools: ["retry-handler", "circuit-breaker", "logging"],
            difficulty: "intermediate",
            estimatedTime: "30 minutes",
            benefits: ["Improved reliability", "Better user experience", "Easier debugging"],
            commonMistakes: ["Silent failures", "Generic error messages", "No retry logic"]
          },
          {
            title: "Use Appropriate Tool Selection",
            description: "Choose tools that match your task complexity and requirements",
            category: "Tool Selection",
            type: "tool_usage" as const,
            tags: ["tools", "selection", "optimization"],
            content: "Select tools based on task requirements, not popularity. Consider performance, reliability, learning curve, and maintenance overhead. Start simple and add complexity only when needed.",
            examples: [
              {
                title: "Data Processing Tool Selection",
                description: "Use pandas for complex data manipulation, but simple CSV module for basic operations",
                configuration: {
                  simple_tasks: ["csv", "json"],
                  complex_tasks: ["pandas", "numpy", "scipy"]
                }
              }
            ],
            relatedTools: ["pandas", "csv", "json", "numpy"],
            difficulty: "intermediate",
            estimatedTime: "20 minutes",
            benefits: ["Optimal performance", "Reduced complexity", "Lower maintenance"],
            commonMistakes: ["Over-engineering", "Tool proliferation", "Ignoring requirements"]
          },
          {
            title: "Implement Comprehensive Testing",
            description: "Test agents with various inputs, edge cases, and failure scenarios",
            category: "Quality Assurance",
            type: "workflow" as const,
            tags: ["testing", "quality", "validation"],
            content: "Create test cases covering normal operations, edge cases, error conditions, and performance scenarios. Use automated testing where possible and maintain test data sets.",
            examples: [
              {
                title: "Test Case Categories",
                description: "Cover happy path, edge cases, error conditions, and performance",
                configuration: {
                  happy_path: "Normal input with expected output",
                  edge_cases: "Empty input, maximum values, special characters",
                  error_conditions: "Invalid input, network failures, timeouts",
                  performance: "Large datasets, concurrent requests"
                }
              }
            ],
            relatedTools: ["pytest", "unittest", "mock", "performance-monitor"],
            difficulty: "intermediate",
            estimatedTime: "45 minutes",
            benefits: ["Higher reliability", "Faster debugging", "Confidence in deployment"],
            commonMistakes: ["Testing only happy path", "No edge case coverage", "Manual testing only"]
          },
          {
            title: "Optimize for Performance",
            description: "Design agents with performance considerations from the start",
            category: "Performance",
            type: "configuration" as const,
            tags: ["performance", "optimization", "efficiency"],
            content: "Consider performance implications of tool choices, data processing methods, and workflow design. Implement caching, parallel processing, and resource management where appropriate.",
            examples: [
              {
                title: "Parallel Processing",
                description: "Process multiple files concurrently instead of sequentially",
                code: "await Promise.all(files.map(file => processFile(file)))"
              }
            ],
            relatedTools: ["async", "parallel", "cache", "profiler"],
            difficulty: "advanced",
            estimatedTime: "1 hour",
            benefits: ["Faster execution", "Better resource utilization", "Improved scalability"],
            commonMistakes: ["Premature optimization", "Ignoring bottlenecks", "No performance monitoring"]
          }
        ];

        for (const practiceData of samplePractices) {
          await this.createBestPractice(practiceData);
        }
        
        console.log("[BestPracticesStorage] Created " + samplePractices.length + " sample practices");
      }

      this.initialized = true;
      console.log("[BestPracticesStorage] Initialization completed successfully");
    } catch (error) {
      console.error("[BestPracticesStorage] Failed to initialize sample data:", error);
      this.initialized = true;
    }
  }

  async createBestPractice(practiceData: InsertBestPractice): Promise<BestPractice> {
    const practice = {
      ...practiceData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.client.insert(bestPracticesTable).values(practice).returning();
    return result[0];
  }

  async getBestPracticeById(id: number): Promise<BestPractice | undefined> {
    await this.ensureInitialized();
    const result = await this.client.select().from(bestPracticesTable).where(eq(bestPracticesTable.id, id));
    const practice = result[0];
    
    if (practice) {
      if (practice.createdAt && typeof practice.createdAt === 'string') {
        practice.createdAt = new Date(practice.createdAt);
      }
      if (practice.updatedAt && typeof practice.updatedAt === 'string') {
        practice.updatedAt = new Date(practice.updatedAt);
      }
    }
    
    return practice;
  }

  async getBestPractices(limit = 20): Promise<BestPractice[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(bestPracticesTable)
      .where(eq(bestPracticesTable.status, "active"))
      .orderBy(desc(bestPracticesTable.createdAt))
      .limit(limit);

    return result.map(practice => ({
      ...practice,
      createdAt: typeof practice.createdAt === 'string' ? new Date(practice.createdAt) : practice.createdAt,
      updatedAt: typeof practice.updatedAt === 'string' ? new Date(practice.updatedAt) : practice.updatedAt
    }));
  }

  async getBestPracticesByCategory(category: string, limit = 20): Promise<BestPractice[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(bestPracticesTable)
      .where(and(
        eq(bestPracticesTable.category, category),
        eq(bestPracticesTable.status, "active")
      ))
      .orderBy(desc(bestPracticesTable.createdAt))
      .limit(limit);

    return result.map(practice => ({
      ...practice,
      createdAt: typeof practice.createdAt === 'string' ? new Date(practice.createdAt) : practice.createdAt,
      updatedAt: typeof practice.updatedAt === 'string' ? new Date(practice.updatedAt) : practice.updatedAt
    }));
  }

  async getBestPracticesByType(type: string, limit = 20): Promise<BestPractice[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(bestPracticesTable)
      .where(and(
        eq(bestPracticesTable.type, type),
        eq(bestPracticesTable.status, "active")
      ))
      .orderBy(desc(bestPracticesTable.createdAt))
      .limit(limit);

    return result.map(practice => ({
      ...practice,
      createdAt: typeof practice.createdAt === 'string' ? new Date(practice.createdAt) : practice.createdAt,
      updatedAt: typeof practice.updatedAt === 'string' ? new Date(practice.updatedAt) : practice.updatedAt
    }));
  }

  async searchBestPractices(query: string, limit = 20): Promise<BestPractice[]> {
    await this.ensureInitialized();
    const result = await this.client
      .select()
      .from(bestPracticesTable)
      .where(and(
        eq(bestPracticesTable.status, "active"),
        sql`(
          ${bestPracticesTable.title} ILIKE ${`%${query}%`} OR
          ${bestPracticesTable.description} ILIKE ${`%${query}%`} OR
          ${bestPracticesTable.content} ILIKE ${`%${query}%`} OR
          ${bestPracticesTable.category} ILIKE ${`%${query}%`}
        )`
      ))
      .orderBy(desc(bestPracticesTable.createdAt))
      .limit(limit);

    return result.map(practice => ({
      ...practice,
      createdAt: typeof practice.createdAt === 'string' ? new Date(practice.createdAt) : practice.createdAt,
      updatedAt: typeof practice.updatedAt === 'string' ? new Date(practice.updatedAt) : practice.updatedAt
    }));
  }

  async createRecommendation(recommendationData: InsertPracticeRecommendation): Promise<PracticeRecommendation> {
    const recommendation = {
      ...recommendationData,
      createdAt: new Date()
    };
    
    const result = await this.client.insert(practiceRecommendationsTable).values(recommendation).returning();
    return result[0];
  }

  async getRecommendationsBySession(sessionId: string): Promise<RecommendationWithPractices[]> {
    const recommendations = await this.client
      .select()
      .from(practiceRecommendationsTable)
      .where(eq(practiceRecommendationsTable.sessionId, sessionId))
      .orderBy(desc(practiceRecommendationsTable.createdAt));

    const enrichedRecommendations = await Promise.all(
      recommendations.map(async (rec) => {
        const practiceIds = rec.recommendedPractices?.map(rp => rp.practiceId) || [];
        const practices = await Promise.all(
          practiceIds.map(id => this.getBestPracticeById(id))
        );
        
        return {
          ...rec,
          createdAt: typeof rec.createdAt === 'string' ? new Date(rec.createdAt) : rec.createdAt,
          practices: practices.filter(Boolean) as BestPractice[]
        };
      })
    );

    return enrichedRecommendations;
  }

  async getRecentRecommendations(limit = 10): Promise<PracticeRecommendation[]> {
    const result = await this.client
      .select()
      .from(practiceRecommendationsTable)
      .orderBy(desc(practiceRecommendationsTable.createdAt))
      .limit(limit);

    return result.map(rec => ({
      ...rec,
      createdAt: typeof rec.createdAt === 'string' ? new Date(rec.createdAt) : rec.createdAt
    }));
  }

  async updateBestPractice(id: number, updates: Partial<InsertBestPractice>): Promise<BestPractice | undefined> {
    const result = await this.client
      .update(bestPracticesTable)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      })
      .where(eq(bestPracticesTable.id, id))
      .returning();

    return result[0];
  }

  async deleteBestPractice(id: number): Promise<boolean> {
    const result = await this.client
      .delete(bestPracticesTable)
      .where(eq(bestPracticesTable.id, id));

    return result.rowCount > 0;
  }
}

export const bestPracticesStorage = new BestPracticesStorage();
