import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

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