import "server-only";

import { randomUUID } from "node:crypto";
import { and, desc, eq, or } from "drizzle-orm";
import { z } from "zod";
import { getDatabase } from "@/db";
import { attachments, auditLogs, cargoItems, driverProfiles, orderServices, orderStatusEnum, orders, routePoints, statusHistory, users, vehicles, warehouseOperations, type Order, type User } from "@/db/schema";
import { orderStatusConfig } from "@/config/order-status";
import { warehouseOrderTypes } from "@/features/orders/order-types";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { can, requirePermission } from "@/lib/permissions";
import { DomainError } from "@/lib/errors/domain-error";
import { designPreviewEnabled, getPreviewOrderDetail } from "@/lib/design-preview/data";
import { notifyOrderStatusTransition } from "@/features/notifications/service";

export type OrderStatus = (typeof orderStatusEnum.enumValues)[number];
export type IntakeAttachmentInput = {
  id: string;
  filename: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
};

const standardTransitions: Record<OrderStatus, OrderStatus[]> = {
  DRAFT: ["SUBMITTED", "CANCELLED"],
  SUBMITTED: ["REVIEW", "CANCELLED"],
  REVIEW: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: [],
  DRIVER_ASSIGNED: ["PICKUP_IN_PROGRESS"],
  PICKUP_IN_PROGRESS: ["PICKED_UP"],
  PICKED_UP: [],
  AT_WAREHOUSE: ["WAREHOUSE_PROCESSING"],
  WAREHOUSE_PROCESSING: [],
  READY_FOR_DELIVERY: [],
  DELIVERY_IN_PROGRESS: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
  COMPLETED: [],
  ON_HOLD: [],
  ISSUE: [],
  CANCELLED: [],
};

const terminalStatuses = new Set<OrderStatus>(["COMPLETED", "CANCELLED"]);
const driverStatuses = new Set<OrderStatus>(["PICKUP_IN_PROGRESS", "PICKED_UP", "DELIVERY_IN_PROGRESS", "DELIVERED"]);
const warehouseStatuses = new Set<OrderStatus>(["AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "COMPLETED"]);

function getBaseTransitions(order: Order): OrderStatus[] {
  switch (order.status) {
    case "CONFIRMED":
      if (order.type === "DELIVERY_TRANSPORT_COMPANY") return ["DELIVERY_IN_PROGRESS"];
      if (order.type === "WAREHOUSE_INTAKE" || order.type === "WAREHOUSE_SERVICE") return ["AT_WAREHOUSE"];
      return ["DRIVER_ASSIGNED"];
    case "PICKED_UP":
      return order.type === "PICKUP_TO_WAREHOUSE" ? ["AT_WAREHOUSE"] : ["DELIVERY_IN_PROGRESS"];
    case "WAREHOUSE_PROCESSING":
      return order.type === "WAREHOUSE_SERVICE" ? ["COMPLETED"] : ["READY_FOR_DELIVERY"];
    case "READY_FOR_DELIVERY":
      return ["DELIVERY_IN_PROGRESS"];
    default:
      return standardTransitions[order.status];
  }
}

function roleCanPerformTransition(user: User, order: Order, nextStatus: OrderStatus): boolean {
  if (!can(user, "orders:transition", order)) return false;
  if (user.role === "ADMIN") return true;
  if (user.role === "MANAGER") {
    return !(order.status === "READY_FOR_DELIVERY" && nextStatus === "DELIVERY_IN_PROGRESS" && warehouseOrderTypes.has(order.type));
  }

  if (user.role === "CLIENT") {
    return order.status === "DRAFT" && (nextStatus === "SUBMITTED" || nextStatus === "CANCELLED");
  }

  if (user.role === "DRIVER") {
    if (nextStatus === "ISSUE") return !terminalStatuses.has(order.status);
    if (order.type === "DELIVERY_TRANSPORT_COMPANY" || !driverStatuses.has(nextStatus)) return false;
    if (order.status === "READY_FOR_DELIVERY") return nextStatus === "DELIVERY_IN_PROGRESS";
    return true;
  }

  if (user.role === "WAREHOUSE") {
    if (nextStatus === "ISSUE") return !terminalStatuses.has(order.status);
    return warehouseOrderTypes.has(order.type) && warehouseStatuses.has(nextStatus);
  }

  return false;
}

export function canTransition(order: Order, nextStatus: OrderStatus, user: User, resumeStatus?: OrderStatus | null): boolean {
  if (!roleCanPerformTransition(user, order, nextStatus)) return false;
  if (terminalStatuses.has(order.status)) return false;

  if (nextStatus === "ISSUE") return order.status !== "ISSUE";
  if (nextStatus === "ON_HOLD") return (user.role === "ADMIN" || user.role === "MANAGER") && order.status !== "ON_HOLD";

  if (order.status === "ISSUE" || order.status === "ON_HOLD") {
    return (user.role === "ADMIN" || user.role === "MANAGER") && resumeStatus === nextStatus;
  }

  const allowed = getBaseTransitions(order);
  if (!allowed.includes(nextStatus)) return false;
  if (nextStatus === "DRIVER_ASSIGNED" && !order.driverUserId) return false;
  if (nextStatus === "DELIVERY_IN_PROGRESS" && order.type !== "DELIVERY_TRANSPORT_COMPANY" && !order.driverUserId) return false;
  return true;
}

export async function getAllowedTransitions(order: Order, user?: User): Promise<OrderStatus[]> {
  const actor = user ?? await getCurrentDemoUser();
  const resumeStatus = order.status === "ISSUE" || order.status === "ON_HOLD" ? await getResumeStatus(order.id) : null;
  return orderStatusEnum.enumValues.filter((status) => canTransition(order, status, actor, resumeStatus));
}

export async function transitionOrderStatus(input: unknown, intakeAttachment?: IntakeAttachmentInput) {
  const inputSchema = z.object({
    orderId: z.string().uuid(),
    nextStatus: z.enum(orderStatusEnum.enumValues),
    note: z.string().trim().max(1000).optional(),
    driverUserId: z.string().uuid().optional(),
    vehicleId: z.string().uuid().optional(),
    quantity: z.coerce.number().min(0).max(1000000).optional(),
    weightKg: z.coerce.number().min(0).max(1000000).optional(),
  });
  const parsed = inputSchema.safeParse(input);
  if (!parsed.success) throw new DomainError("VALIDATION_ERROR", "Проверьте данные перехода статуса.");

  const actor = await getCurrentDemoUser();
  const { db } = getDatabase();

  return db.transaction(async (tx) => {
    const [currentOrder] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for("update").limit(1);
    if (!currentOrder) throw new DomainError("NOT_FOUND", "Заявка не найдена.");
    requirePermission(actor, "orders:transition", currentOrder);

    let assignedDriverId = currentOrder.driverUserId;
    let assignedVehicleId = currentOrder.vehicleId;
    if (parsed.data.driverUserId || parsed.data.vehicleId) {
      requirePermission(actor, "orders:assign_driver", currentOrder);
      if (currentOrder.status !== "CONFIRMED" || parsed.data.nextStatus !== "DRIVER_ASSIGNED") {
        throw new DomainError("INVALID_STATUS_TRANSITION", "Водителя можно назначить перед началом забора груза.");
      }
      if (parsed.data.driverUserId) {
        const [driver] = await tx.select({ id: users.id }).from(users).innerJoin(driverProfiles, eq(driverProfiles.userId, users.id))
          .where(and(eq(users.id, parsed.data.driverUserId), eq(users.role, "DRIVER"), eq(users.isActive, true), eq(driverProfiles.isAvailable, true))).for("update").limit(1);
        if (!driver) throw new DomainError("VALIDATION_ERROR", "Выберите активного и доступного водителя.");
        assignedDriverId = driver.id;
        await tx.update(driverProfiles).set({ isAvailable: false, updatedAt: new Date() }).where(eq(driverProfiles.userId, driver.id));
      }
      if (parsed.data.vehicleId) {
        const [vehicle] = await tx.select({ id: vehicles.id }).from(vehicles).where(and(eq(vehicles.id, parsed.data.vehicleId), eq(vehicles.isActive, true))).limit(1);
        if (!vehicle) throw new DomainError("VALIDATION_ERROR", "Выберите активный транспорт.");
        assignedVehicleId = vehicle.id;
      }
    }
    const transitionOrder = assignedDriverId === currentOrder.driverUserId ? currentOrder : { ...currentOrder, driverUserId: assignedDriverId };

    const resumeStatus = currentOrder.status === "ISSUE" || currentOrder.status === "ON_HOLD"
      ? await getResumeStatus(currentOrder.id, tx)
      : null;
    if (!canTransition(transitionOrder, parsed.data.nextStatus, actor, resumeStatus)) {
      throw new DomainError("INVALID_STATUS_TRANSITION", "Этот переход статуса недоступен для заявки или вашей роли.");
    }
    if (parsed.data.nextStatus === "ISSUE" && !parsed.data.note?.trim()) {
      throw new DomainError("VALIDATION_ERROR", "Опишите проблему перед отправкой менеджеру.");
    }
    if (intakeAttachment && (parsed.data.nextStatus !== "AT_WAREHOUSE" || !["WAREHOUSE", "ADMIN"].includes(actor.role))) {
      throw new DomainError("VALIDATION_ERROR", "Фото приёмки можно добавить только во время складской приёмки.");
    }
    if (intakeAttachment) requirePermission(actor, "files:upload", currentOrder);
    if (intakeAttachment && !currentOrder.warehouseId) {
      throw new DomainError("VALIDATION_ERROR", "Для приёмки выберите склад в заявке.");
    }
    if (parsed.data.nextStatus === "DELIVERED") {
      const [proof] = currentOrder.driverUserId
        ? await tx.select({ id: attachments.id }).from(attachments)
          .where(and(
            eq(attachments.orderId, currentOrder.id),
            eq(attachments.uploadedByUserId, currentOrder.driverUserId),
            eq(attachments.category, "PROOF_OF_DELIVERY"),
            eq(attachments.visibility, "CLIENT"),
          )).limit(1)
        : [];
      if (!proof) throw new DomainError("VALIDATION_ERROR", "Перед подтверждением доставки добавьте клиентский Proof of Delivery.");
    }

    if (parsed.data.nextStatus === "DELIVERY_IN_PROGRESS" && currentOrder.status === "READY_FOR_DELIVERY" && ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE"].includes(currentOrder.type)) {
      const [release] = await tx.select({ id: warehouseOperations.id }).from(warehouseOperations)
        .where(and(eq(warehouseOperations.orderId, currentOrder.id), eq(warehouseOperations.operationType, "RELEASE"))).limit(1);
      if (!release) throw new DomainError("VALIDATION_ERROR", "Склад должен оформить выдачу до начала исходящей доставки.");
    }

    if (parsed.data.nextStatus === "AT_WAREHOUSE" && actor.role === "WAREHOUSE") {
      if (parsed.data.quantity === undefined || parsed.data.weightKg === undefined) {
        throw new DomainError("VALIDATION_ERROR", "Укажите фактическое количество мест и вес при приёмке.");
      }
      const expectedCargo = await tx.select({ places: cargoItems.places, quantity: cargoItems.quantity, weightKg: cargoItems.weightKg })
        .from(cargoItems).where(eq(cargoItems.orderId, currentOrder.id));
      const expectedPlaces = expectedCargo.reduce((total, item) => total + (item.places ?? item.quantity), 0);
      const expectedWeight = expectedCargo.reduce((total, item) => total + (item.weightKg ?? 0), 0);
      const hasDiscrepancy = parsed.data.quantity !== expectedPlaces || Math.abs(parsed.data.weightKg - expectedWeight) >= 0.01;
      if (hasDiscrepancy && !parsed.data.note) {
        throw new DomainError("VALIDATION_ERROR", "Добавьте комментарий, если фактические данные отличаются от заявки.");
      }
    }
    if (actor.role === "WAREHOUSE" && (parsed.data.nextStatus === "READY_FOR_DELIVERY" || (parsed.data.nextStatus === "COMPLETED" && currentOrder.type === "WAREHOUSE_SERVICE"))) {
      const incompleteServices = await tx.select({ id: orderServices.id }).from(orderServices)
        .where(and(eq(orderServices.orderId, currentOrder.id), eq(orderServices.isCompleted, false)));
      if (incompleteServices.length) throw new DomainError("VALIDATION_ERROR", "Отметьте выполненными все заказанные услуги перед завершением обработки.");
    }

    const now = new Date();
    const [updatedOrder] = await tx.update(orders).set({
      status: parsed.data.nextStatus,
      driverUserId: assignedDriverId,
      vehicleId: assignedVehicleId,
      completedAt: parsed.data.nextStatus === "COMPLETED" ? now : currentOrder.completedAt,
      updatedAt: now,
    }).where(eq(orders.id, currentOrder.id)).returning();
    if (currentOrder.driverUserId && (parsed.data.nextStatus === "COMPLETED" || parsed.data.nextStatus === "CANCELLED")) {
      await tx.update(driverProfiles).set({ isAvailable: true, updatedAt: now }).where(eq(driverProfiles.userId, currentOrder.driverUserId));
    }
    const routeType = parsed.data.nextStatus === "PICKED_UP" ? "PICKUP"
      : parsed.data.nextStatus === "AT_WAREHOUSE" ? "WAREHOUSE"
        : parsed.data.nextStatus === "DELIVERED" ? currentOrder.type === "DELIVERY_TRANSPORT_COMPANY" ? "TERMINAL" : "DELIVERY"
          : null;
    if (routeType) await tx.update(routePoints).set({ arrivedAt: now, completedAt: now, updatedAt: now }).where(and(eq(routePoints.orderId, currentOrder.id), eq(routePoints.type, routeType)));

    await tx.insert(statusHistory).values({
      id: randomUUID(),
      orderId: currentOrder.id,
      fromStatus: currentOrder.status,
      toStatus: parsed.data.nextStatus,
      changedByUserId: actor.id,
      note: parsed.data.note || null,
      createdAt: now,
    });
    await tx.insert(auditLogs).values({
      id: randomUUID(),
      actorUserId: actor.id,
      entityType: "ORDER",
      entityId: currentOrder.id,
      action: "STATUS_CHANGED",
      payload: { from: currentOrder.status, to: parsed.data.nextStatus, note: parsed.data.note ?? null, quantity: parsed.data.quantity ?? null, weightKg: parsed.data.weightKg ?? null, attachmentId: intakeAttachment?.id ?? null },
      createdAt: now,
    });

    const warehouseOperation = ({ AT_WAREHOUSE: "INTAKE", WAREHOUSE_PROCESSING: "PROCESSING", READY_FOR_DELIVERY: "READY_FOR_DELIVERY", COMPLETED: currentOrder.type === "WAREHOUSE_SERVICE" ? "SERVICE_COMPLETE" : undefined } as Partial<Record<OrderStatus, string>>)[parsed.data.nextStatus];
    if (warehouseOperation && currentOrder.warehouseId && ["WAREHOUSE", "MANAGER", "ADMIN"].includes(actor.role)) {
      const operationId = randomUUID();
      await tx.insert(warehouseOperations).values({
        id: operationId, orderId: currentOrder.id, warehouseId: currentOrder.warehouseId,
        performedByUserId: actor.id, operationType: warehouseOperation,
        resultText: parsed.data.note || orderStatusConfig[parsed.data.nextStatus].label,
        quantity: parsed.data.quantity ?? null, weightKg: parsed.data.weightKg ?? null, notes: parsed.data.note || null,
        performedAt: now, createdAt: now,
      });
      if (intakeAttachment) {
        await tx.insert(attachments).values({
          id: intakeAttachment.id, orderId: currentOrder.id, warehouseOperationId: operationId, uploadedByUserId: actor.id,
          category: "WAREHOUSE_PHOTO", visibility: "CLIENT", filename: intakeAttachment.filename,
          storagePath: intakeAttachment.storagePath, mimeType: intakeAttachment.mimeType,
          sizeBytes: intakeAttachment.sizeBytes, createdAt: now,
        });
      }
    }

    await notifyOrderStatusTransition(tx, updatedOrder, actor, parsed.data.nextStatus, now);
    return updatedOrder;
  });
}

async function getResumeStatus(orderId: string, tx?: Parameters<Parameters<ReturnType<typeof getDatabase>["db"]["transaction"]>[0]>[0]) {
  if (designPreviewEnabled) {
    const event = getPreviewOrderDetail(orderId)?.history.filter((item) => item.toStatus === "ISSUE" || item.toStatus === "ON_HOLD").sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0];
    return event?.fromStatus ?? null;
  }
  const database = tx ?? getDatabase().db;
  const [event] = await database.select({ fromStatus: statusHistory.fromStatus }).from(statusHistory)
    .where(and(eq(statusHistory.orderId, orderId), or(eq(statusHistory.toStatus, "ISSUE"), eq(statusHistory.toStatus, "ON_HOLD"))))
    .orderBy(desc(statusHistory.createdAt)).limit(1);
  return event?.fromStatus ?? null;
}
