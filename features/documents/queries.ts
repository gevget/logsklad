import "server-only";

import { desc, eq, isNotNull } from "drizzle-orm";
import { getDatabase } from "@/db";
import { attachments, documents, orders, type User } from "@/db/schema";
import { can } from "@/lib/permissions";
import { designPreviewEnabled, listPreviewOrders, previewOrderDetails } from "@/lib/design-preview/data";

export async function getDocumentsForUser(user: User) {
  if (designPreviewEnabled) {
    const allowedOrderIds = new Set(listPreviewOrders(user).map(({ order }) => order.id));
    return previewOrderDetails.filter(({ order }) => allowedOrderIds.has(order.id)).flatMap(({ order, files }) => files
      .filter((attachment) => user.role === "MANAGER" || user.role === "ADMIN" || user.role === "WAREHOUSE" || attachment.visibility === "CLIENT")
      .map((attachment) => ({ attachment, order, document: null })));
  }
  const { db } = getDatabase();
  const rows = await db.select({ attachment: attachments, order: orders, document: documents })
    .from(attachments).innerJoin(orders, eq(orders.id, attachments.orderId))
    .leftJoin(documents, eq(documents.attachmentId, attachments.id))
    .where(isNotNull(attachments.orderId)).orderBy(desc(attachments.createdAt)).limit(150);
  const canSeeInternalFiles = user.role === "MANAGER" || user.role === "ADMIN" || user.role === "WAREHOUSE";
  return rows.filter(({ attachment, order }) => can(user, "files:view", order) && (canSeeInternalFiles || attachment.visibility === "CLIENT"));
}
