import type { Order, User } from "@/db/schema";
import { DomainError } from "@/lib/errors/domain-error";

export type PermissionAction =
  | "orders:view"
  | "orders:create"
  | "orders:edit_draft"
  | "orders:submit"
  | "orders:assign_driver"
  | "orders:edit_price"
  | "orders:transition"
  | "orders:view_finance"
  | "comments:view_internal"
  | "comments:create_internal"
  | "comments:create_client_visible"
  | "files:upload"
  | "files:view"
  | "warehouse:operate"
  | "notifications:view"
  | "admin:manage_users"
  | "admin:manage_directories"
  | "admin:view_audit";

const operationalWarehouseStatuses = new Set([
  "CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED", "ISSUE",
]);

export function can(user: User, action: PermissionAction, order?: Order): boolean {
  if (action === "admin:manage_users" || action === "admin:manage_directories" || action === "admin:view_audit") return user.role === "ADMIN";
  if (action === "orders:create") return ["CLIENT", "MANAGER", "ADMIN"].includes(user.role);

  if (action === "notifications:view") return true;
  if (!order) return user.role === "ADMIN" || user.role === "MANAGER";

  if (action === "orders:view") {
    if (user.role === "ADMIN" || user.role === "MANAGER") return true;
    if (user.role === "CLIENT") return user.companyId === order.companyId;
    if (user.role === "DRIVER") return order.driverUserId === user.id;
    return user.role === "WAREHOUSE" && order.warehouseId !== null && operationalWarehouseStatuses.has(order.status);
  }

  if (action === "orders:edit_draft" || action === "orders:submit") {
    if (user.role === "ADMIN" || user.role === "MANAGER") return order.status === "DRAFT";
    return user.role === "CLIENT" && user.companyId === order.companyId && order.createdByUserId === user.id && order.status === "DRAFT";
  }

  if (action === "orders:assign_driver" || action === "orders:edit_price") return user.role === "ADMIN" || user.role === "MANAGER";
  if (action === "orders:view_finance") return user.role === "ADMIN" || user.role === "MANAGER" || (user.role === "CLIENT" && user.companyId === order.companyId && !["DRAFT", "SUBMITTED", "REVIEW"].includes(order.status));
  if (action === "orders:transition") {
    if (user.role === "ADMIN" || user.role === "MANAGER") return true;
    if (user.role === "CLIENT") return user.companyId === order.companyId && order.createdByUserId === user.id && ["DRAFT", "SUBMITTED"].includes(order.status);
    if (user.role === "DRIVER") return order.driverUserId === user.id;
    return user.role === "WAREHOUSE" && order.warehouseId !== null;
  }
  if (action === "comments:view_internal") return user.role === "ADMIN" || user.role === "MANAGER" || (user.role === "WAREHOUSE" && order.warehouseId !== null);
  if (action === "comments:create_internal") return user.role === "ADMIN" || user.role === "MANAGER";
  if (action === "comments:create_client_visible") return ["ADMIN", "MANAGER", "CLIENT", "DRIVER", "WAREHOUSE"].includes(user.role) && can(user, "orders:view", order);
  if (action === "files:view") return can(user, "orders:view", order);
  if (action === "files:upload") return !["COMPLETED", "CANCELLED"].includes(order.status) && can(user, "orders:view", order);
  if (action === "warehouse:operate") return user.role === "ADMIN" || (user.role === "WAREHOUSE" && order.warehouseId !== null);

  return false;
}

export function requirePermission(user: User, action: PermissionAction, order?: Order): void {
  if (!can(user, action, order)) {
    throw new DomainError("FORBIDDEN", "Недостаточно прав для выполнения этого действия.");
  }
}
