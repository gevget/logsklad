import "server-only";

import { and, count, desc, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { notifications, type Notification, type User } from "@/db/schema";
import { designPreviewEnabled, previewOrderDetails } from "@/lib/design-preview/data";

export async function getUserNotifications(user: User) {
  if (designPreviewEnabled) {
    const relatedOrder = previewOrderDetails.find(({ order }) => user.role !== "DRIVER" || order.driverUserId === user.id)?.order;
    const sample: Omit<Notification, "id" | "userId" | "orderId"> = {
      type: "ORDER_UPDATE", title: relatedOrder ? `Заявка ${relatedOrder.number} · обновление статуса` : "Новая заявка ожидает проверки",
      body: relatedOrder?.title ?? "Поступила новая заявка от компании СтальПром.", isRead: false,
      createdAt: new Date("2026-09-22T08:30:00.000Z"), readAt: null,
    };
    return [
      { ...sample, id: "b9000000-0000-4000-8000-000000000001", userId: user.id, orderId: relatedOrder?.id ?? null },
      { ...sample, id: "b9000000-0000-4000-8000-000000000002", userId: user.id, orderId: relatedOrder?.id ?? null, title: "Комментарий менеджера", body: "Приняли заявку в работу. Уточним время передачи груза.", isRead: true, createdAt: new Date("2026-09-21T14:15:00.000Z"), readAt: new Date("2026-09-21T14:20:00.000Z") },
    ];
  }
  const { db } = getDatabase();
  return db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(100);
}

export async function getUnreadNotificationCount(user: User) {
  if (designPreviewEnabled) return 1;
  const { db } = getDatabase();
  const [result] = await db.select({ count: count() }).from(notifications)
    .where(and(eq(notifications.userId, user.id), eq(notifications.isRead, false)));
  return result?.count ?? 0;
}
