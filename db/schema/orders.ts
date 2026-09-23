import { boolean, index, integer, numeric, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";
import { orderStatusEnum, orderTypeEnum, routePointTypeEnum } from "./enums";
import { companies, suppliers, users, vehicles, warehouses } from "./core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () => timestamp("updated_at", { withTimezone: true }).notNull().defaultNow();
const money = (name: string) => numeric(name, { precision: 14, scale: 2, mode: "number" }).notNull().default(0);

export const orders = pgTable("orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  number: varchar("number", { length: 24 }).notNull(),
  companyId: uuid("company_id").notNull().references(() => companies.id),
  createdByUserId: uuid("created_by_user_id").notNull().references(() => users.id),
  managerUserId: uuid("manager_user_id").references(() => users.id),
  driverUserId: uuid("driver_user_id").references(() => users.id),
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  warehouseId: uuid("warehouse_id").references(() => warehouses.id),
  type: orderTypeEnum("type").notNull(),
  status: orderStatusEnum("status").notNull().default("DRAFT"),
  title: varchar("title", { length: 240 }),
  description: text("description"),
  clientReference: varchar("client_reference", { length: 120 }),
  externalCarrierName: varchar("external_carrier_name", { length: 180 }),
  externalPayer: varchar("external_payer", { length: 40 }),
  transportDestinationCity: varchar("transport_destination_city", { length: 120 }),
  documentSetCount: integer("document_set_count"),
  returnDocuments: boolean("return_documents").notNull().default(false),
  subtotal: money("subtotal"),
  servicesTotal: money("services_total"),
  insuranceTotal: money("insurance_total"),
  discountTotal: money("discount_total"),
  taxTotal: money("tax_total"),
  total: money("total"),
  currency: varchar("currency", { length: 3 }).notNull().default("RUB"),
  plannedPickupAt: timestamp("planned_pickup_at", { withTimezone: true }),
  plannedDeliveryAt: timestamp("planned_delivery_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [
  uniqueIndex("orders_number_unique").on(table.number),
  index("orders_company_id_idx").on(table.companyId),
  index("orders_status_idx").on(table.status),
  index("orders_type_idx").on(table.type),
  index("orders_manager_user_id_idx").on(table.managerUserId),
  index("orders_driver_user_id_idx").on(table.driverUserId),
  index("orders_created_at_idx").on(table.createdAt),
]);

export const cargoItems = pgTable("cargo_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  supplierId: uuid("supplier_id").references(() => suppliers.id),
  title: varchar("title", { length: 240 }).notNull(),
  category: varchar("category", { length: 100 }),
  description: text("description"),
  quantity: numeric("quantity", { precision: 12, scale: 2, mode: "number" }).notNull().default(1),
  unit: varchar("unit", { length: 32 }),
  places: integer("places"),
  weightKg: numeric("weight_kg", { precision: 12, scale: 2, mode: "number" }),
  lengthCm: numeric("length_cm", { precision: 10, scale: 2, mode: "number" }),
  widthCm: numeric("width_cm", { precision: 10, scale: 2, mode: "number" }),
  heightCm: numeric("height_cm", { precision: 10, scale: 2, mode: "number" }),
  declaredValue: numeric("declared_value", { precision: 14, scale: 2, mode: "number" }),
  specialRequirements: text("special_requirements"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("cargo_items_order_id_idx").on(table.orderId)]);

export const routePoints = pgTable("route_points", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  sequence: integer("sequence").notNull(),
  type: routePointTypeEnum("type").notNull(),
  label: varchar("label", { length: 120 }),
  addressText: text("address_text").notNull(),
  contactName: varchar("contact_name", { length: 180 }),
  contactPhone: varchar("contact_phone", { length: 40 }),
  plannedAt: timestamp("planned_at", { withTimezone: true }),
  arrivedAt: timestamp("arrived_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("route_points_order_sequence_unique").on(table.orderId, table.sequence), index("route_points_order_id_idx").on(table.orderId)]);

export const services = pgTable("services", {
  id: uuid("id").primaryKey().defaultRandom(),
  code: varchar("code", { length: 40 }).notNull(),
  name: varchar("name", { length: 160 }).notNull(),
  description: text("description"),
  unit: varchar("unit", { length: 40 }),
  basePrice: numeric("base_price", { precision: 12, scale: 2, mode: "number" }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [uniqueIndex("services_code_unique").on(table.code), index("services_is_active_idx").on(table.isActive)]);

export const orderServices = pgTable("order_services", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => orders.id),
  serviceId: uuid("service_id").notNull().references(() => services.id),
  quantity: numeric("quantity", { precision: 12, scale: 2, mode: "number" }).notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2, mode: "number" }).notNull().default(0),
  totalPrice: numeric("total_price", { precision: 14, scale: 2, mode: "number" }).notNull().default(0),
  isCompleted: boolean("is_completed").notNull().default(false),
  notes: text("notes"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
}, (table) => [index("order_services_order_id_idx").on(table.orderId), index("order_services_service_id_idx").on(table.serviceId)]);

export type Order = typeof orders.$inferSelect;
export type CargoItem = typeof cargoItems.$inferSelect;
export type RoutePoint = typeof routePoints.$inferSelect;
export type Service = typeof services.$inferSelect;
export type OrderService = typeof orderServices.$inferSelect;
