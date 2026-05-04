import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, launches, users, categorizationRules, CategorizationRule, bankAccounts, budgets, BankAccount, Budget, chatHistory, ChatMessage, financialGoals, FinancialGoal, InsertFinancialGoal, userIntegrations } from "../drizzle/schema";
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

// ===== Bank Accounts Helpers =====

export async function getBankAccountsByUserId(userId: number): Promise<BankAccount[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(bankAccounts)
    .where(and(eq(bankAccounts.userId, userId), eq(bankAccounts.isActive, 1)))
    .orderBy(bankAccounts.displayOrder);
}

export async function createBankAccount(account: typeof bankAccounts.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(bankAccounts).values(account);
  return result;
}

export async function updateBankAccount(id: number, data: Partial<typeof bankAccounts.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(bankAccounts).set(data).where(eq(bankAccounts.id, id));
}

export async function deleteBankAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(bankAccounts).set({ isActive: 0 }).where(eq(bankAccounts.id, id));
}

export async function getTotalBalance(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) return "0";

  const accounts = await getBankAccountsByUserId(userId);
  const total = accounts.reduce((sum, account) => {
    const balance = parseFloat(account.balance) || 0;
    return sum + balance;
  }, 0);

  return total.toFixed(2);
}

// ===== Budget Helpers =====

export async function getBudgetsByUserAndMonth(userId: number, month: string): Promise<Budget[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.month, month)));
}

export async function createBudget(budget: typeof budgets.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(budgets).values(budget);
  return result;
}

export async function updateBudget(id: number, data: Partial<typeof budgets.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.update(budgets).set(data).where(eq(budgets.id, id));
}

export async function deleteBudget(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  return await db.delete(budgets).where(eq(budgets.id, id));
}

export async function getBudgetForCategory(userId: number, category: string, month: string): Promise<Budget | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(budgets)
    .where(and(eq(budgets.userId, userId), eq(budgets.category, category), eq(budgets.month, month)))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


// ===== Chat History Helpers =====

export async function saveChatMessage(userId: number, role: "user" | "assistant", content: string): Promise<ChatMessage | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db.insert(chatHistory).values({
    userId,
    role,
    content,
  });

  // Return the inserted message
  const messages = await db
    .select()
    .from(chatHistory)
    .where(and(eq(chatHistory.userId, userId), eq(chatHistory.role, role)))
    .orderBy(desc(chatHistory.createdAt))
    .limit(1);

  return messages.length > 0 ? messages[0] : null;
}

export async function getChatHistory(userId: number, limit: number = 50): Promise<ChatMessage[]> {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(chatHistory)
    .where(eq(chatHistory.userId, userId))
    .orderBy(desc(chatHistory.createdAt))
    .limit(limit);
}

export async function clearChatHistory(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(chatHistory).where(eq(chatHistory.userId, userId));
}


// ===== Financial Goals Helpers =====
export async function createFinancialGoal(goal: InsertFinancialGoal): Promise<FinancialGoal | null> {
  const db = await getDb();
  if (!db) return null;
  await db.insert(financialGoals).values(goal);
  const result = await db
    .select()
    .from(financialGoals)
    .where(and(eq(financialGoals.userId, goal.userId), eq(financialGoals.name, goal.name)))
    .orderBy(desc(financialGoals.createdAt))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function getFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId))
    .orderBy(desc(financialGoals.createdAt));
}

export async function getActiveFinancialGoalsByUserId(userId: number): Promise<FinancialGoal[]> {
  const db = await getDb();
  if (!db) return [];
  return await db
    .select()
    .from(financialGoals)
    .where(and(eq(financialGoals.userId, userId), eq(financialGoals.status, "ativa")))
    .orderBy(desc(financialGoals.priority));
}

export async function updateFinancialGoal(id: number, data: Partial<InsertFinancialGoal>): Promise<FinancialGoal | null> {
  const db = await getDb();
  if (!db) return null;
  await db.update(financialGoals).set(data).where(eq(financialGoals.id, id));
  const result = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.id, id))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function deleteFinancialGoal(id: number): Promise<void> {
  const db = await getDb();
  if (!db) return;
  await db.delete(financialGoals).where(eq(financialGoals.id, id));
}


// 2FA queries
export async function updateUserTwoFAStatus(
  userId: number,
  twoFAVerified: boolean
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update 2FA status: database not available");
    return;
  }

  try {
    await db
      .update(users)
      .set({ twoFAVerified })
      .where(eq(users.id, userId));
  } catch (error) {
    console.error("[Database] Failed to update 2FA status", error);
    throw error;
  }
}

export async function getUserTwoFAStatus(userId: number): Promise<{
  twoFARequired: boolean;
  twoFAVerified: boolean;
} | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get 2FA status: database not available");
    return null;
  }

  try {
    const result = await db
      .select({ twoFARequired: users.twoFARequired, twoFAVerified: users.twoFAVerified })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error("[Database] Failed to get 2FA status", error);
    return null;
  }
}


// User Integrations queries
export async function addUserIntegration(
  userId: number,
  provider: string,
  name: string,
  credentials: string
): Promise<number> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(userIntegrations).values({
    userId,
    provider: provider as any,
    name,
    credentials,
  });

  // Get the inserted ID
  const inserted = await db
    .select({ id: userIntegrations.id })
    .from(userIntegrations)
    .where(and(eq(userIntegrations.userId, userId), eq(userIntegrations.name, name)))
    .limit(1);

  return inserted[0]?.id || 0;
}

export async function getUserIntegrations(userId: number) {
  const db = await getDb();
  if (!db) {
    return [];
  }

  return await db
    .select()
    .from(userIntegrations)
    .where(eq(userIntegrations.userId, userId));
}

export async function getUserIntegrationById(userId: number, integrationId: number) {
  const db = await getDb();
  if (!db) {
    return null;
  }

  const result = await db
    .select()
    .from(userIntegrations)
    .where(
      and(
        eq(userIntegrations.userId, userId),
        eq(userIntegrations.id, integrationId)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function updateUserIntegration(
  integrationId: number,
  data: any
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(userIntegrations).set(data).where(eq(userIntegrations.id, integrationId));
}

export async function deleteUserIntegration(integrationId: number): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.delete(userIntegrations).where(eq(userIntegrations.id, integrationId));
}
