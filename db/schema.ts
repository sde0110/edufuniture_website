import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const inquiries = sqliteTable("inquiries", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  school: text("school").notNull(),
  phone: text("phone").notNull(),
  details: text("details").notNull(),
  status: text("status").notNull().default("new"),
  emailStatus: text("email_status").notNull().default("pending"),
  createdAt: text("created_at").notNull(),
});

export const productImages = sqliteTable("product_images", {
  id: text("id").primaryKey(),
  productKey: text("product_key").notNull(),
  objectKey: text("object_key").notNull(),
  filename: text("filename").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  createdAt: text("created_at").notNull(),
});

export const adminLoginAttempts = sqliteTable("admin_login_attempts", {
  key: text("key").primaryKey(),
  attempts: integer("attempts").notNull().default(0),
  lockedUntil: text("locked_until"),
  updatedAt: text("updated_at").notNull(),
});
