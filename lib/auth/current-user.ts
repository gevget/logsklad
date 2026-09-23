import "server-only";

import { and, eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { getDatabase } from "@/db";
import { companies, users } from "@/db/schema";
import { DomainError } from "@/lib/errors/domain-error";
import { getDemoIdentity } from "@/features/demo/identity";
import { designPreviewEnabled, getPreviewUser } from "@/lib/design-preview/data";

export async function getCurrentDemoUser() {
  if (process.env.DEMO_MODE !== "true") {
    throw new DomainError("UNAUTHORIZED", "Демо-режим не включён.");
  }

  const cookieStore = await cookies();
  const email = getDemoIdentity(cookieStore.get("demo_identity")?.value).email;
  if (designPreviewEnabled) return getPreviewUser(email);
  const { db } = getDatabase();
  const [user] = await db.select().from(users).where(and(eq(users.email, email), eq(users.isActive, true))).limit(1);

  if (!user) throw new DomainError("UNAUTHORIZED", "Демо-пользователь не найден или отключён.");
  if (user.role === "CLIENT" && user.companyId) {
    const [company] = await db.select({ isActive: companies.isActive }).from(companies).where(eq(companies.id, user.companyId)).limit(1);
    if (!company?.isActive) throw new DomainError("UNAUTHORIZED", "Учётная запись компании отключена.");
  }
  return user;
}
