import { boolean, index, jsonb, numeric, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { attachmentCategoryEnum, attachmentVisibilityEnum, commentScopeEnum, orderStatusEnum } from "./enums";
import { users, warehouses } from "./core";
import { orders } from "./orders";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const warehouseOperations = pgTable("warehouse_operations", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  warehouseId: uuid("warehouse_id").notNull().references(() => warehouses.id),
  performedByUserId: uuid("performed_by_user_id").notNull().references(() => users.id),
  operationType: varchar("operation_type", { length: 48 }).notNull(),
  quantity: numeric("quantity", { precision: 12, scale: 2, mode: "number" }),
  weightKg: numeric("weight_kg", { precision: 12, scale: 2, mode: "number" }),
  resultText: text("result_text"),
  notes: text("notes"),
  performedAt: timestamp("performed_at", { withTimezone: true }).notNull().defaultNow(),
  createdAt: createdAt(),
}, (table) => [index("warehouse_operations_order_id_idx").on(table.orderId), index("warehouse_operations_warehouse_id_idx").on(table.warehouseId)]);

export const attachments = pgTable("attachments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").references(() => orders.id),
  warehouseOperationId: uuid("warehouse_operation_id").references(() => warehouseOperations.id),
  uploadedByUserId: uuid("uploaded_by_user_id").notNull().references(() => users.id),
  category: attachmentCategoryEnum("category").notNull(),
  visibility: attachmentVisibilityEnum("visibility").notNull().default("CLIENT"),
  filename: varchar("filename", { length: 255 }).notNull(),
  storagePath: text("storage_path").notNull(),
  mimeType: varchar("mime_type", { length: 120 }),
  sizeBytes: numeric("size_bytes", { precision: 14, scale: 0, mode: "number" }),
  createdAt: createdAt(),
}, (table) => [index("attachments_order_id_idx").on(table.orderId), index("attachments_uploaded_by_user_id_idx").on(table.uploadedByUserId)]);

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  attachmentId: uuid("attachment_id").references(() => attachments.id),
  documentType: varchar("document_type", { length: 48 }).notNull(),
  documentNumber: varchar("document_number", { length: 120 }),
  issuedAt: timestamp("issued_at", { withTimezone: true }),
  title: varchar("title", { length: 240 }).notNull(),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("documents_order_id_idx").on(table.orderId)]);

export const comments = pgTable("comments", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  authorUserId: uuid("author_user_id").notNull().references(() => users.id),
  scope: commentScopeEnum("scope").notNull(),
  body: text("body").notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("comments_order_id_idx").on(table.orderId), index("comments_scope_idx").on(table.scope)]);

export const statusHistory = pgTable("status_history", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  fromStatus: orderStatusEnum("from_status"),
  toStatus: orderStatusEnum("to_status").notNull(),
  changedByUserId: uuid("changed_by_user_id").notNull().references(() => users.id),
  note: text("note"),
  createdAt: createdAt(),
}, (table) => [index("status_history_order_created_at_idx").on(table.orderId, table.createdAt)]);

export const notifications = pgTable("notifications", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  orderId: uuid("order_id").references(() => orders.id),
  type: varchar("type", { length: 64 }).notNull(),
  title: varchar("title", { length: 240 }).notNull(),
  body: text("body"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: createdAt(),
  readAt: timestamp("read_at", { withTimezone: true }),
}, (table) => [index("notifications_user_read_created_at_idx").on(table.userId, table.isRead, table.createdAt)]);

export const auditLogs = pgTable("audit_logs", {
  id: uuid("id").primaryKey().defaultRandom(),
  actorUserId: uuid("actor_user_id").references(() => users.id),
  entityType: varchar("entity_type", { length: 80 }).notNull(),
  entityId: uuid("entity_id"),
  action: varchar("action", { length: 100 }).notNull(),
  payload: jsonb("payload").$type<Record<string, unknown>>(),
  createdAt: createdAt(),
}, (table) => [index("audit_logs_actor_created_at_idx").on(table.actorUserId, table.createdAt), index("audit_logs_entity_idx").on(table.entityType, table.entityId)]);

export type WarehouseOperation = typeof warehouseOperations.$inferSelect;
export type Attachment = typeof attachments.$inferSelect;
export type Document = typeof documents.$inferSelect;
export type Comment = typeof comments.$inferSelect;
export type StatusHistory = typeof statusHistory.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
