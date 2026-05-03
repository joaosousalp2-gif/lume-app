import { boolean, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
  twoFARequired: boolean("twoFARequired").default(true).notNull(),
  twoFAVerified: boolean("twoFAVerified").default(false).notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Launches table for storing financial transactions
 */
export const launches = mysqlTable("launches", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["receita", "despesa"]).notNull(),
  date: varchar("date", { length: 10 }).notNull(),
  category: varchar("category", { length: 64 }).notNull(),
  value: varchar("value", { length: 20 }).notNull(),
  description: text("description"),
  recurrence: varchar("recurrence", { length: 20 }).default("Única").notNull(),
  endDate: varchar("endDate", { length: 10 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Launch = typeof launches.$inferSelect;
export type InsertLaunch = typeof launches.$inferInsert;

/**
 * Categorization Rules table for storing user-defined rules
 */
export const categorizationRules = mysqlTable("categorizationRules", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  /** Pattern to match against launch description (case-insensitive) */
  pattern: varchar("pattern", { length: 255 }).notNull(),
  /** Type of launch: receita or despesa */
  type: mysqlEnum("type", ["receita", "despesa"]).notNull(),
  /** Category to apply when pattern matches */
  category: varchar("category", { length: 64 }).notNull(),
  /** Priority for rule matching (higher = applied first) */
  priority: int("priority").default(0).notNull(),
  /** Whether rule is active */
  isActive: int("isActive").default(1).notNull(),
  /** Number of times this rule was applied */
  timesApplied: int("timesApplied").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CategorizationRule = typeof categorizationRules.$inferSelect;
export type InsertCategorizationRule = typeof categorizationRules.$inferInsert;
/**
 * Bank Accounts table for storing multiple user accounts
 */
export const bankAccounts = mysqlTable("bankAccounts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 128 }).notNull(),
  type: mysqlEnum("type", ["corrente", "poupanca", "investimentos", "outro"]).notNull(),
  balance: varchar("balance", { length: 20 }).default("0").notNull(),
  bankName: varchar("bankName", { length: 128 }),
  accountNumber: varchar("accountNumber", { length: 20 }),
  isActive: int("isActive").default(1).notNull(),
  displayOrder: int("displayOrder").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BankAccount = typeof bankAccounts.$inferSelect;
export type InsertBankAccount = typeof bankAccounts.$inferInsert;

/**
 * Budget table for storing monthly budgets by category
 */
export const budgets = mysqlTable("budgets", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  category: varchar("category", { length: 64 }).notNull(),
  limit: varchar("limit", { length: 20 }).notNull(),
  month: varchar("month", { length: 7 }).notNull(),
  alertThresholds: varchar("alertThresholds", { length: 50 }).default("75,90,100").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = typeof budgets.$inferInsert;

/**
 * Chat History table for storing AI chat conversations
 */
export const chatHistory = mysqlTable("chatHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatHistory.$inferSelect;
export type InsertChatMessage = typeof chatHistory.$inferInsert;

/**
 * Financial Goals table for storing user savings goals
 */
export const financialGoals = mysqlTable("financialGoals", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  name: varchar("name", { length: 128 }).notNull(),
  description: text("description"),
  targetAmount: varchar("targetAmount", { length: 20 }).notNull(),
  currentAmount: varchar("currentAmount", { length: 20 }).default("0").notNull(),
  category: varchar("category", { length: 64 }),
  targetDate: varchar("targetDate", { length: 10 }),
  priority: mysqlEnum("priority", ["baixa", "media", "alta"]).default("media").notNull(),
  status: mysqlEnum("status", ["ativa", "concluida", "cancelada"]).default("ativa").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FinancialGoal = typeof financialGoals.$inferSelect;
export type InsertFinancialGoal = typeof financialGoals.$inferInsert;

/**
 * 2FA Methods table for storing user's enabled 2FA methods
 */
export const twoFAMethods = mysqlTable("twoFAMethods", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  method: mysqlEnum("method", ["email", "sms", "authenticator"]).notNull(),
  isEnabled: int("isEnabled").default(0).notNull(),
  /** For SMS: phone number (encrypted) */
  phoneNumber: varchar("phoneNumber", { length: 255 }),
  /** For Authenticator: secret key (encrypted) */
  secret: varchar("secret", { length: 255 }),
  /** Backup codes (encrypted, comma-separated) */
  backupCodes: text("backupCodes"),
  /** Number of backup codes remaining */
  backupCodesRemaining: int("backupCodesRemaining").default(10).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TwoFAMethod = typeof twoFAMethods.$inferSelect;
export type InsertTwoFAMethod = typeof twoFAMethods.$inferInsert;

/**
 * Audit Log table for tracking user actions (login/logout)
 */
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  action: mysqlEnum("action", ["login", "logout", "2fa_enabled", "2fa_disabled", "password_changed", "data_accessed", "data_modified"]).notNull(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  details: text("details"),
  status: mysqlEnum("status", ["success", "failed"]).default("success").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Encrypted Fields table for storing encrypted sensitive data
 * Maps field identifiers to their encrypted values and encryption metadata
 */
export const encryptedFields = mysqlTable("encryptedFields", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  /** Field identifier: e.g., "bankAccount_123_cpf" */
  fieldKey: varchar("fieldKey", { length: 255 }).notNull(),
  /** Encrypted value */
  encryptedValue: text("encryptedValue").notNull(),
  /** Encryption algorithm version */
  encryptionVersion: int("encryptionVersion").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type EncryptedField = typeof encryptedFields.$inferSelect;
export type InsertEncryptedField = typeof encryptedFields.$inferInsert;

/**
 * AI Recommendations table for storing generated recommendations
 */
export const aiRecommendations = mysqlTable("aiRecommendations", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  type: mysqlEnum("type", ["economia", "investimento", "fraude", "planejamento"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  priority: mysqlEnum("priority", ["baixa", "media", "alta"]).default("media").notNull(),
  status: mysqlEnum("status", ["novo", "visualizado", "implementado", "descartado"]).default("novo").notNull(),
  metadata: text("metadata"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AIRecommendation = typeof aiRecommendations.$inferSelect;
export type InsertAIRecommendation = typeof aiRecommendations.$inferInsert;
