// @ts-nocheck
import { eq, desc, and } from "drizzle-orm";
import { db } from "~/drizzle/config.server";
import { 
  type UserSession, 
  type InsertUserSession,
  type UserInteraction,
  type InsertUserInteraction,
  type UserSessionWithInteractions,
  userSessionsTable,
  userInteractionsTable
} from "~/drizzle/schema/schema.server";

export interface IUserSessionsStorage {
  createSession(session: InsertUserSession): Promise<UserSession>;
  getSessionById(sessionId: string): Promise<UserSession | undefined>;
  getSessionWithInteractions(sessionId: string): Promise<UserSessionWithInteractions | undefined>;
  updateSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<UserSession | undefined>;
  addInteraction(interaction: InsertUserInteraction): Promise<UserInteraction>;
  getRecentSessions(limit?: number): Promise<UserSession[]>;
  deleteSession(sessionId: string): Promise<boolean>;
}

export class UserSessionsStorage implements IUserSessionsStorage {
  private client: any;

  constructor() {
    this.client = db;
  }

  async createSession(sessionData: InsertUserSession): Promise<UserSession> {
    const session = {
      ...sessionData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await this.client.insert(userSessionsTable).values(session).returning();
    return result[0];
  }

  async getSessionById(sessionId: string): Promise<UserSession | undefined> {
    const result = await this.client.select().from(userSessionsTable).where(eq(userSessionsTable.sessionId, sessionId));
    const session = result[0];
    
    if (session) {
      if (session.createdAt && typeof session.createdAt === 'string') {
        session.createdAt = new Date(session.createdAt);
      }
      if (session.updatedAt && typeof session.updatedAt === 'string') {
        session.updatedAt = new Date(session.updatedAt);
      }
    }
    
    return session;
  }

  async getSessionWithInteractions(sessionId: string): Promise<UserSessionWithInteractions | undefined> {
    const session = await this.getSessionById(sessionId);
    if (!session) return undefined;

    const interactions = await this.client
      .select()
      .from(userInteractionsTable)
      .where(eq(userInteractionsTable.sessionId, sessionId))
      .orderBy(desc(userInteractionsTable.createdAt));

    const convertedInteractions = interactions.map(interaction => ({
      ...interaction,
      createdAt: typeof interaction.createdAt === 'string' ? new Date(interaction.createdAt) : interaction.createdAt
    }));

    return {
      ...session,
      interactions: convertedInteractions,
      lastInteraction: convertedInteractions[0]
    };
  }

  async updateSession(sessionId: string, updates: Partial<InsertUserSession>): Promise<UserSession | undefined> {
    const result = await this.client
      .update(userSessionsTable)
      .set({ 
        ...updates, 
        updatedAt: new Date() 
      })
      .where(eq(userSessionsTable.sessionId, sessionId))
      .returning();

    return result[0];
  }

  async addInteraction(interactionData: InsertUserInteraction): Promise<UserInteraction> {
    const interaction = {
      ...interactionData,
      createdAt: new Date()
    };
    
    const result = await this.client.insert(userInteractionsTable).values(interaction).returning();
    return result[0];
  }

  async getRecentSessions(limit = 20): Promise<UserSession[]> {
    const result = await this.client
      .select()
      .from(userSessionsTable)
      .orderBy(desc(userSessionsTable.createdAt))
      .limit(limit);

    return result.map(session => ({
      ...session,
      createdAt: typeof session.createdAt === 'string' ? new Date(session.createdAt) : session.createdAt,
      updatedAt: typeof session.updatedAt === 'string' ? new Date(session.updatedAt) : session.updatedAt
    }));
  }

  async deleteSession(sessionId: string): Promise<boolean> {
    // Delete interactions first
    await this.client
      .delete(userInteractionsTable)
      .where(eq(userInteractionsTable.sessionId, sessionId));

    // Delete session
    const result = await this.client
      .delete(userSessionsTable)
      .where(eq(userSessionsTable.sessionId, sessionId));

    return result.rowCount > 0;
  }
}

export const userSessionsStorage = new UserSessionsStorage();
