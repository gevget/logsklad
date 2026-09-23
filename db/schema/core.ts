import { boolean, index, integer, jsonb, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { userRoleEnum } from "./enums";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();

export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  displayName: varchar("display_name", { length: 240 }).notNull(),
  legalName: varchar("legal_name", { length: 300 }),
  inn: varchar("inn", { length: 12 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 40 }),
  billingDetails: jsonb("billing_details").$type<Record<string, string>>(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("companies_is_active_idx").on(table.isActive)]);

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").references(() => companies.id),
  role: userRoleEnum("role").notNull(),
  name: varchar("name", { length: 180 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  phone: varchar("phone", { length: 40 }),
  avatarUrl: text("avatar_url"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("users_email_unique").on(table.email),
  index("users_company_id_idx").on(table.companyId),
  index("users_role_active_idx").on(table.role, table.isActive),
]);

export const driverProfiles = pgTable("driver_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id),
  licenseNumber: varchar("license_number", { length: 80 }),
  notes: text("notes"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("driver_profiles_user_id_unique").on(table.userId)]);

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 160 }).notNull(),
  vehicleType: varchar("vehicle_type", { length: 80 }),
  plateNumber: varchar("plate_number", { length: 20 }),
  capacityKg: integer("capacity_kg"),
  volumeM3: numeric("volume_m3", { precision: 8, scale: 2, mode: "number" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("vehicles_plate_number_unique").on(table.plateNumber), index("vehicles_is_active_idx").on(table.isActive)]);

export const warehouses = pgTable("warehouses", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 180 }).notNull(),
  addressText: text("address_text").notNull(),
  phone: varchar("phone", { length: 40 }),
  workingHours: varchar("working_hours", { length: 120 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("warehouses_is_active_idx").on(table.isActive)]);

export const suppliers = pgTable("suppliers", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  name: varchar("name", { length: 220 }).notNull(),
  inn: varchar("inn", { length: 12 }),
  contactName: varchar("contact_name", { length: 180 }),
  phone: varchar("phone", { length: 40 }),
  email: varchar("email", { length: 320 }),
  addressText: text("address_text"),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("suppliers_company_id_idx").on(table.companyId)]);

export type Company = typeof companies.$inferSelect;
export type User = typeof users.$inferSelect;
export type DriverProfile = typeof driverProfiles.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Warehouse = typeof warehouses.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
