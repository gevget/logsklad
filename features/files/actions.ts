"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { attachments, auditLogs, orders, users } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/permissions";
import { getSafeStorageExtension, removeFromStorage, uploadToStorage } from "@/features/files/storage";
import { insertNotifications } from "@/features/notifications/service";

const categories = ["CARGO_PHOTO", "WAREHOUSE_PHOTO", "DOCUMENT", "INVOICE", "PROOF_OF_DELIVERY", "OTHER"] as const;

export async function uploadOrderAttachmentAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const orderId = String(formData.get("orderId") ?? "");
  const file = formData.get("file");
  const categoryValue = String(formData.get("category") ?? "OTHER");
  if (!(file instanceof File)) throw new Error("Выберите файл для загрузки.");
  if (!categories.includes(categoryValue as (typeof categories)[number])) throw new Error("Неизвестный тип файла.");
  const category = categoryValue as (typeof categories)[number];
  if (["CARGO_PHOTO", "WAREHOUSE_PHOTO"].includes(category) && !file.type.startsWith("image/")) {
    throw new Error("Для категории фото выберите изображение JPG, PNG или WebP.");
  }
  const allowedCategories: readonly (typeof categories)[number][] = actor.role === "CLIENT"
    ? ["CARGO_PHOTO", "DOCUMENT", "INVOICE", "OTHER"]
    : actor.role === "DRIVER" ? ["CARGO_PHOTO", "DOCUMENT", "PROOF_OF_DELIVERY"]
      : actor.role === "WAREHOUSE" ? ["WAREHOUSE_PHOTO", "DOCUMENT", "PROOF_OF_DELIVERY", "OTHER"]
        : categories;
  if (!allowedCategories.includes(category)) throw new Error("Для вашей роли нельзя загружать файлы этой категории.");
  const { db } = getDatabase();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Заявка не найдена.");
  requirePermission(actor, "files:upload", order);

  const id = randomUUID();
  const originalName = file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 220) || "attachment";
  const extension = getSafeStorageExtension(originalName);
  const storagePath = await uploadToStorage(`${orderId}/${id}.${extension}`, file);
  const visibility = (actor.role === "MANAGER" || actor.role === "ADMIN") && formData.get("visibility") === "INTERNAL" ? "INTERNAL" : "CLIENT";
  try {
    await db.transaction(async (tx) => {
      const now = new Date();
      await tx.insert(attachments).values({
        id, orderId, uploadedByUserId: actor.id, category, visibility,
        filename: originalName, storagePath, mimeType: file.type, sizeBytes: file.size, createdAt: now,
      });
      await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: orderId, action: "ATTACHMENT_UPLOADED", payload: { attachmentId: id, category, visibility, filename: originalName }, createdAt: now });
      if (["DOCUMENT", "INVOICE", "PROOF_OF_DELIVERY"].includes(category)) {
        const recipients = new Map<string, { id: string }>();
        if (actor.role !== "MANAGER" && actor.role !== "ADMIN") {
          const managers = await tx.select({ id: users.id }).from(users).where(and(eq(users.role, "MANAGER"), eq(users.isActive, true)));
          for (const user of managers) recipients.set(user.id, user);
        }
        if (visibility === "CLIENT") {
          const clients = await tx.select({ id: users.id }).from(users).where(and(eq(users.role, "CLIENT"), eq(users.companyId, order.companyId), eq(users.isActive, true)));
          for (const user of clients) recipients.set(user.id, user);
        }
        const visibleRecipients = [...recipients.values()].filter(({ id: userId }) => userId !== actor.id);
        if (visibleRecipients.length) await insertNotifications(tx, visibleRecipients.map(({ id: userId }) => ({
          id: randomUUID(), userId, orderId, type: "ATTACHMENT_UPLOADED",
          title: `Файл по заявке ${order.number}`,
          body: `Добавлен файл «${originalName}».`, isRead: false, createdAt: now,
        })));
      }
    });
  } catch (error) {
    await removeFromStorage(storagePath);
    throw error;
  }
  revalidatePath(`/${actor.role.toLowerCase()}/orders/${orderId}`);
  if (actor.role === "DRIVER") revalidatePath(`/driver/jobs/${orderId}`);
  revalidatePath(`/${actor.role.toLowerCase()}/documents`);
}
