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
 * Works table: Stores manga and manhwa information
 */
export const works = mysqlTable("works", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  coverImageUrl: varchar("coverImageUrl", { length: 512 }),
  type: mysqlEnum("type", ["manga", "manhwa"]).notNull(),
  genre: varchar("genre", { length: 255 }), // comma-separated genres
  status: mysqlEnum("status", ["ongoing", "completed", "hiatus"]).default("ongoing").notNull(),
  chapters: int("chapters").default(0),
  author: varchar("author", { length: 255 }),
  averageRating: varchar("averageRating", { length: 10 }).default("0"), // stored as string for precision
  totalRatings: int("totalRatings").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Work = typeof works.$inferSelect;
export type InsertWork = typeof works.$inferInsert;

/**
 * Ratings table: Stores user ratings for works
 */
export const ratings = mysqlTable("ratings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  workId: int("workId").notNull().references(() => works.id, { onDelete: "cascade" }),
  score: int("score").notNull(), // 1-5 stars
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = typeof ratings.$inferInsert;

/**
 * Reviews table: Stores user reviews and comments
 */
export const reviews = mysqlTable("reviews", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id, { onDelete: "cascade" }),
  workId: int("workId").notNull().references(() => works.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  helpful: int("helpful").default(0), // count of helpful votes
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

/**
 * Reading Links table: Stores multiple reading links for each work
 */
export const readingLinks = mysqlTable("readingLinks", {
  id: int("id").autoincrement().primaryKey(),
  workId: int("workId").notNull().references(() => works.id, { onDelete: "cascade" }),
  platform: varchar("platform", { length: 100 }).notNull(), // e.g., "MangaDex", "Webtoon", "Tappytoon"
  url: varchar("url", { length: 512 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ReadingLink = typeof readingLinks.$inferSelect;
export type InsertReadingLink = typeof readingLinks.$inferInsert;