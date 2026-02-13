import { users, submissions, type User, type InsertUser, type Submission, type InsertSubmission } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>; // id is discordId or internal id
  getUserByDiscordId(discordId: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, user: Partial<InsertUser>): Promise<User>;

  // Submissions
  createSubmission(submission: InsertSubmission): Promise<Submission>;
  getSubmission(id: string): Promise<Submission | undefined>;
  getAllSubmissions(): Promise<(Submission & { user: User })[]>;
  updateSubmissionStatus(id: string, status: "approved" | "denied"): Promise<Submission>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByDiscordId(discordId: string): Promise<User | undefined> {
    // In our schema, 'id' IS the discordId (varchar), or we treat it as such.
    // Let's assume schema 'id' stores the Discord ID for simplicity as defined in schema.ts comment
    // "id: varchar("id").primaryKey() // We'll use the Discord User ID"
    return this.getUser(discordId);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db.update(users).set(updates).where(eq(users.id, id)).returning();
    return user;
  }

  // Submissions
  async createSubmission(insertSubmission: InsertSubmission): Promise<Submission> {
    const [submission] = await db.insert(submissions).values(insertSubmission).returning();
    
    // Increment user submission count
    await db.update(users)
      .set({ submissionCount: sql`${users.submissionCount} + 1` })
      .where(eq(users.id, insertSubmission.userId));
      
    return submission;
  }

  async getSubmission(id: string): Promise<Submission | undefined> {
    const [submission] = await db.select().from(submissions).where(eq(submissions.id, id));
    return submission;
  }

  async getAllSubmissions(): Promise<(Submission & { user: User })[]> {
    const rows = await db.select({
      submission: submissions,
      user: users,
    })
    .from(submissions)
    .innerJoin(users, eq(submissions.userId, users.id))
    .orderBy(desc(submissions.createdAt));

    return rows.map(row => ({
      ...row.submission,
      user: row.user
    }));
  }

  async updateSubmissionStatus(id: string, status: "approved" | "denied"): Promise<Submission> {
    const [submission] = await db.update(submissions)
      .set({ status, updatedAt: new Date() })
      .where(eq(submissions.id, id))
      .returning();
    return submission;
  }
}

export const storage = new DatabaseStorage();
