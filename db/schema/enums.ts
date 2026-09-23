import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["CLIENT", "MANAGER", "DRIVER", "WAREHOUSE", "ADMIN"]);

export const orderTypeEnum = pgEnum("order_type", [
  "PICKUP_TO_WAREHOUSE",
  "WAREHOUSE_INTAKE",
  "DELIVERY_OWN_TRANSPORT",
  "DELIVERY_TRANSPORT_COMPANY",
  "COURIER_DOCUMENTS",
  "WAREHOUSE_SERVICE",
]);

export const orderStatusEnum = pgEnum("order_status", [
  "DRAFT",
  "SUBMITTED",
  "REVIEW",
  "CONFIRMED",
  "DRIVER_ASSIGNED",
  "PICKUP_IN_PROGRESS",
  "PICKED_UP",
  "AT_WAREHOUSE",
  "WAREHOUSE_PROCESSING",
  "READY_FOR_DELIVERY",
  "DELIVERY_IN_PROGRESS",
  "DELIVERED",
  "COMPLETED",
  "ON_HOLD",
  "ISSUE",
  "CANCELLED",
]);
export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export const routePointTypeEnum = pgEnum("route_point_type", ["PICKUP", "WAREHOUSE", "DELIVERY", "TERMINAL", "OTHER"]);
export const commentScopeEnum = pgEnum("comment_scope", ["INTERNAL", "CLIENT_VISIBLE"]);
export const attachmentCategoryEnum = pgEnum("attachment_category", ["CARGO_PHOTO", "WAREHOUSE_PHOTO", "DOCUMENT", "INVOICE", "PROOF_OF_DELIVERY", "OTHER"]);
export const attachmentVisibilityEnum = pgEnum("attachment_visibility", ["CLIENT", "INTERNAL"]);
