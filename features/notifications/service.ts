import "server-only";

import { randomUUID } from "node:crypto";
import { and, eq, or } from "drizzle-orm";
import { getDatabase } from "@/db";
import { notifications, orderStatusEnum, users, type Order, type User } from "@/db/schema";
import { orderStatusConfig } from "@/config/order-status";
import { warehouseOrderTypes } from "@/features/orders/order-types";

type NotificationTransaction = Parameters<Parameters<ReturnType<typeof getDatabase>["db"]["transaction"]>[0]>[0];
type NotificationInsert = typeof notifications.$inferInsert;
type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

export async function insertNotifications(tx: NotificationTransaction, rows: NotificationInsert[]) {
  if (rows.length) await tx.insert(notifications).values(rows);
}

export async function notifyOrderStatusTransition(
  tx: NotificationTransaction,
  order: Order,
  actor: User,
  status: OrderStatus,
  now: Date,
) {
  const isWarehouseOrder = order.warehouseId !== null && warehouseOrderTypes.has(order.type);
  const warehouseAudience = isWarehouseOrder && ["DRIVER_ASSIGNED", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY"].includes(status);
  const managerEvents = new Set<OrderStatus>(["SUBMITTED", "ISSUE", "AT_WAREHOUSE", "READY_FOR_DELIVERY", "DELIVERED"]);
  const warehouseEvents = new Set<OrderStatus>(["DRIVER_ASSIGNED", "PICKED_UP", "AT_WAREHOUSE", "READY_FOR_DELIVERY"]);
  const managerAudience = managerEvents.has(status);
  const rows = await tx.select({ id: users.id, role: users.role }).from(users).where(and(
    eq(users.isActive, true),
    or(
      eq(users.companyId, order.companyId),
      ...(order.managerUserId ? [eq(users.id, order.managerUserId)] : []),
      ...(order.driverUserId ? [eq(users.id, order.driverUserId)] : []),
      ...(managerAudience ? [eq(users.role, "MANAGER")] : []),
      ...(warehouseAudience ? [eq(users.role, "WAREHOUSE")] : []),
    ),
  ));

  const statusLabel = orderStatusConfig[status].label;
  const clientEvents = new Set<OrderStatus>(["SUBMITTED", "REVIEW", "CONFIRMED", "DRIVER_ASSIGNED", "PICKED_UP", "AT_WAREHOUSE", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED", "ISSUE"]);
  const driverEvents = new Set<OrderStatus>(["DRIVER_ASSIGNED"]);
  const notificationsForEvent = rows.filter((recipient) => {
    if (recipient.id === actor.id) return false;
    if (recipient.role === "CLIENT") return clientEvents.has(status);
    if (recipient.role === "MANAGER") return managerEvents.has(status);
    if (recipient.role === "DRIVER") return driverEvents.has(status) && recipient.id === order.driverUserId;
    if (recipient.role === "WAREHOUSE") return warehouseEvents.has(status);
    return false;
  }).map((recipient) => ({
    id: randomUUID(),
    userId: recipient.id,
    orderId: order.id,
    type: status === "ISSUE" ? "ORDER_ISSUE" : `ORDER_${status}`,
    title: `Заявка ${order.number} · ${statusLabel}`,
    body: status === "ISSUE" ? "По заявке зарегистрирована проблема. Откройте её, чтобы посмотреть детали." : order.title ?? `Статус заявки обновлён: ${statusLabel}.`,
    isRead: false,
    createdAt: now,
  }));

  await insertNotifications(tx, notificationsForEvent);
}
