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

export const galleryAlbums = mysqlTable("gallery_albums", {
  id: int("id").autoincrement().primaryKey(),
  year: int("year").notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  eventDate: varchar("eventDate", { length: 80 }).notNull(),
  location: varchar("location", { length: 120 }).notNull(),
  imageUrl: text("imageUrl").notNull(),
  imageAlt: varchar("imageAlt", { length: 255 }).notNull(),
  photoCount: int("photoCount").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GalleryAlbum = typeof galleryAlbums.$inferSelect;
export type InsertGalleryAlbum = typeof galleryAlbums.$inferInsert;

export const newsPosts = mysqlTable("news_posts", {
  id: int("id").autoincrement().primaryKey(),
  title: varchar("title", { length: 180 }).notNull(),
  excerpt: text("excerpt").notNull(),
  content: text("content").notNull(),
  category: varchar("category", { length: 120 }).notNull(),
  publishedAt: varchar("publishedAt", { length: 80 }).notNull(),
  imageUrl: text("imageUrl").notNull().default(""),
  status: mysqlEnum("status", ["draft", "published"]).default("draft").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type NewsPost = typeof newsPosts.$inferSelect;
export type InsertNewsPost = typeof newsPosts.$inferInsert;

export const boardMembers = mysqlTable("board_members", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 160 }).notNull(),
  role: varchar("role", { length: 160 }).notNull(),
  bio: text("bio").notNull(),
  imageUrl: text("imageUrl").notNull().default(""),
  sortOrder: int("sortOrder").default(0).notNull(),
  active: int("active").default(1).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BoardMember = typeof boardMembers.$inferSelect;
export type InsertBoardMember = typeof boardMembers.$inferInsert;
