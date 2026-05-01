import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, launches, users, categorizationRules, CategorizationRule } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Launches queries
export async function getLaunchesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(launches).where(eq(launches.userId, userId));
}

export async function createLaunch(launch: typeof launches.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(launches).values(launch);
  return result;
}

export async function updateLaunch(id: number, data: Partial<typeof launches.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(launches).set(data).where(eq(launches.id, id));
}

export async function deleteLaunch(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(launches).where(eq(launches.id, id));
}

// Categorization Rules queries
export async function getRulesByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(categorizationRules)
    .where(and(eq(categorizationRules.userId, userId), eq(categorizationRules.isActive, 1)))
    .orderBy(desc(categorizationRules.priority));
}

export async function createRule(rule: typeof categorizationRules.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(categorizationRules).values(rule);
  return result;
}

export async function updateRule(id: number, data: Partial<typeof categorizationRules.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(categorizationRules).set(data).where(eq(categorizationRules.id, id));
}

export async function deleteRule(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(categorizationRules).where(eq(categorizationRules.id, id));
}

export async function matchRuleForDescription(
  userId: number,
  description: string,
  type: "receita" | "despesa"
): Promise<CategorizationRule | null> {
  const db = await getDb();
  if (!db) return null;

  const rules = await getRulesByUserId(userId);
  const lowerDesc = description.toLowerCase();

  // Find first matching rule (ordered by priority)
  for (const rule of rules) {
    if (rule.type !== type) continue;
    const pattern = rule.pattern.toLowerCase();
    if (lowerDesc.includes(pattern)) {
      return rule;
    }
  }

  return null;
}

export async function incrementRuleUsage(ruleId: number) {
  const db = await getDb();
  if (!db) return;

  const rule = await db.select().from(categorizationRules).where(eq(categorizationRules.id, ruleId)).limit(1);
  if (rule.length > 0) {
    await db
      .update(categorizationRules)
      .set({ timesApplied: (rule[0].timesApplied || 0) + 1 })
      .where(eq(categorizationRules.id, ruleId));
  }
}
