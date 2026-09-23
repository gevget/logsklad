"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { getDatabase } from "@/db";
import { users } from "@/db/schema";
import { DomainError } from "@/lib/errors/domain-error";
import { getRoleIdentity, isDemoRole, type DemoRole } from "@/features/demo/identity";
import { designPreviewEnabled } from "@/lib/design-preview/data";

export async function setDemoIdentityAction(formData: FormData) {
  const role = formData.get("role");

  if (typeof role !== "string" || !isDemoRole(role)) {
    redirect("/client");
  }

  if (process.env.DEMO_MODE !== "true") throw new DomainError("FORBIDDEN", "Переключатель доступен только в демо-режиме.");
  const identity = getRoleIdentity(role);
  if (!designPreviewEnabled) {
    const { db } = getDatabase();
    const [user] = await db.select({ id: users.id }).from(users).where(and(eq(users.email, identity.email), eq(users.isActive, true))).limit(1);
    if (!user) throw new DomainError("NOT_FOUND", "Для этой роли не найден demo-пользователь.");
  }

  const cookieStore = await cookies();

  cookieStore.set("demo_identity", identity.email, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  const requestedDestination = formData.get("destination");
  const roleDestinations: Record<DemoRole, string> = {
    CLIENT: "/client/orders/new",
    MANAGER: "/manager/incoming",
    DRIVER: "/driver",
    WAREHOUSE: "/warehouse/intake",
    ADMIN: "/admin",
  };
  redirect(typeof requestedDestination === "string" && roleDestinations[role] === requestedDestination
    ? requestedDestination
    : identity.route);
}
