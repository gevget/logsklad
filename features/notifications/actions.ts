"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/db";
import { notifications } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";

export async function markNotificationReadAction(formData: FormData) {
  const user = await getCurrentDemoUser();
  const id = String(formData.get("notificationId") ?? "");
  const { db } = getDatabase();
  await db.update(notifications).set({ isRead: true, readAt: new Date() }).where(and(eq(notifications.id, id), eq(notifications.userId, user.id)));
  revalidatePath(`/${user.role.toLowerCase()}/notifications`);
}
