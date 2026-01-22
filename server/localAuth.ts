import crypto from "crypto";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

// Hash password using SHA256
export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Verify password
export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}

// Authenticate user with username and password
export async function authenticateUser(username: string, password: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);

  if (result.length === 0) {
    return null;
  }

  const user = result[0];
  if (!user.passwordHash || !verifyPassword(password, user.passwordHash)) {
    return null;
  }

  return user;
}

// Create admin user
export async function createAdminUser(username: string, password: string, email: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = hashPassword(password);

  try {
    await db.insert(users).values({
      username,
      email,
      passwordHash,
      role: "admin",
      name: "Admin User",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to create admin user:", error);
    return null;
  }
}

// Create regular user
export async function createUser(username: string, password: string, email: string, name?: string) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const passwordHash = hashPassword(password);

  try {
    await db.insert(users).values({
      username,
      email,
      passwordHash,
      name: name || username,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    });

    const result = await db
      .select()
      .from(users)
      .where(eq(users.username, username))
      .limit(1);

    return result[0] || null;
  } catch (error) {
    console.error("Failed to create user:", error);
    return null;
  }
}
