"use server";

import { randomUUID } from "node:crypto";
import { and, count, eq, notInArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getDatabase } from "@/db";
import { attachments, auditLogs, companies, driverProfiles, orders, services, users, vehicles, warehouses } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { DomainError } from "@/lib/errors/domain-error";
import { requirePermission } from "@/lib/permissions";
import { designPreviewEnabled } from "@/lib/design-preview/data";
import { seedDemoData } from "@/db/seed/data";
import { removeFromStorage } from "@/features/files/storage";
import { z } from "zod";

const sections = ["users", "drivers", "companies", "vehicles", "warehouses", "services"] as const;
type Section = (typeof sections)[number];

export type AdminUserUpdateState = { status: "idle" | "success" | "error"; message: string };
export type DemoResetState = { status: "idle" | "success" | "error"; message: string };

const demoResetConfirmation = "ВОССТАНОВИТЬ ДЕМО";

export async function resetDemoDataAction(_previousState: DemoResetState, formData: FormData): Promise<DemoResetState> {
  try {
    const actor = await getCurrentDemoUser();
    requirePermission(actor, "admin:manage_users");
    if (process.env.DEMO_MODE !== "true") return { status: "error", message: "Сброс доступен только в демо-режиме." };
    if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production") return { status: "error", message: "Сброс демо-данных заблокирован в production." };
    if (designPreviewEnabled) return { status: "error", message: "В режиме просмотра дизайна изменения не сохраняются." };
    if (String(formData.get("confirmation") ?? "").trim() !== demoResetConfirmation) {
      return { status: "error", message: `Для подтверждения введите «${demoResetConfirmation}».` };
    }

    const { db } = getDatabase();
    const uploadedFiles = (await db.select({ storagePath: attachments.storagePath }).from(attachments))
      .map(({ storagePath }) => storagePath).filter((storagePath) => storagePath.startsWith("local/"));
    const counts = await seedDemoData({ reset: true });
    const cleanupResults = await Promise.allSettled(uploadedFiles.map(removeFromStorage));
    const failedCleanupCount = cleanupResults.filter((result) => result.status === "rejected").length;
    revalidatePath("/", "layout");
    const cleanupMessage = failedCleanupCount ? ` Не удалось удалить ${failedCleanupCount} локальных файлов.` : " Локальные загрузки очищены.";
    return { status: "success", message: `Исходный набор восстановлен: ${counts.orders} заявок, ${counts.users} пользователей и ${counts.companies} компаний.${cleanupMessage}` };
  } catch (error) {
    if (error instanceof DomainError) return { status: "error", message: error.message };
    return { status: "error", message: "Не удалось восстановить демо-данные. Если сбой возник во время сброса, транзакция сохранит прежнее содержимое базы." };
  }
}

const adminUserUpdateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Укажите имя пользователя.").max(180),
  email: z.string().trim().toLowerCase().email("Проверьте адрес email.").max(320),
  phone: z.string().trim().max(40).transform((value) => value || null),
  role: z.enum(["CLIENT", "MANAGER", "DRIVER", "WAREHOUSE", "ADMIN"]),
  companyId: z.string().uuid().nullable(),
});

export async function updateAdminUserAction(_previousState: AdminUserUpdateState, formData: FormData): Promise<AdminUserUpdateState> {
  try {
    const actor = await getCurrentDemoUser();
    requirePermission(actor, "admin:manage_users");
    if (designPreviewEnabled) return { status: "error", message: "В режиме просмотра дизайна изменения не сохраняются." };

    const parsed = adminUserUpdateSchema.safeParse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      role: String(formData.get("role") ?? ""),
      companyId: String(formData.get("companyId") ?? "") || null,
    });
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте заполненные поля." };

    const input = parsed.data;
    if (input.role === "CLIENT" && !input.companyId) return { status: "error", message: "Для заказчика выберите компанию." };
    const { db } = getDatabase();
    const [target] = await db.select().from(users).where(eq(users.id, input.id)).limit(1);
    if (!target) return { status: "error", message: "Пользователь не найден." };
    if (target.id === actor.id && input.role !== target.role) return { status: "error", message: "Нельзя менять собственную роль." };
    if (target.id === actor.id && input.email !== target.email) return { status: "error", message: "Нельзя менять email активной демо-учётной записи." };

    if (input.email !== target.email) {
      const [emailOwner] = await db.select({ id: users.id }).from(users).where(eq(users.email, input.email)).limit(1);
      if (emailOwner) return { status: "error", message: "Этот адрес email уже используется." };
    }

    const companyId = input.role === "CLIENT" ? input.companyId : null;
    if (companyId) {
      const [company] = await db.select({ isActive: companies.isActive }).from(companies).where(eq(companies.id, companyId)).limit(1);
      if (!company || (!company.isActive && companyId !== target.companyId)) return { status: "error", message: "Выберите действующую компанию." };
    }

    const now = new Date();
    let unchanged = false;
    await db.transaction(async (tx) => {
      await tx.select({ id: users.id }).from(users).where(and(eq(users.role, "ADMIN"), eq(users.isActive, true))).orderBy(users.id).for("update");
      const [lockedTarget] = await tx.select().from(users).where(eq(users.id, target.id)).for("update").limit(1);
      if (!lockedTarget) throw new DomainError("NOT_FOUND", "Пользователь не найден.");
      if (lockedTarget.role === "ADMIN" && lockedTarget.isActive && input.role !== "ADMIN") {
        const [{ value }] = await tx.select({ value: count() }).from(users).where(and(eq(users.role, "ADMIN"), eq(users.isActive, true)));
        if (value <= 1) throw new DomainError("VALIDATION_ERROR", "В системе должен остаться хотя бы один активный администратор.");
      }
      const changed = lockedTarget.name !== input.name || lockedTarget.email !== input.email || lockedTarget.phone !== input.phone
        || lockedTarget.role !== input.role || lockedTarget.companyId !== companyId;
      if (!changed) {
        unchanged = true;
        return;
      }
      await tx.update(users).set({ name: input.name, email: input.email, phone: input.phone, role: input.role, companyId, updatedAt: now }).where(eq(users.id, target.id));
      await tx.insert(auditLogs).values({
        id: randomUUID(), actorUserId: actor.id, entityType: "USER", entityId: target.id,
        action: lockedTarget.role !== input.role ? "USER_ROLE_CHANGED" : "USER_PROFILE_UPDATED",
        payload: {
          before: { name: lockedTarget.name, email: lockedTarget.email, phone: lockedTarget.phone, role: lockedTarget.role, companyId: lockedTarget.companyId },
          after: { name: input.name, email: input.email, phone: input.phone, role: input.role, companyId },
        },
        createdAt: now,
      });
    });

    if (unchanged) return { status: "success", message: "Изменений нет." };

    revalidatePath("/admin/users");
    revalidatePath(`/admin/users/${target.id}`);
    return { status: "success", message: "Изменения сохранены и записаны в журнал действий." };
  } catch (error) {
    if (error instanceof DomainError) return { status: "error", message: error.message };
    return { status: "error", message: "Не удалось сохранить изменения. Проверьте данные и попробуйте ещё раз." };
  }
}

export type AdminCompanyUpdateState = { status: "idle" | "success" | "error"; message: string; companyId?: string };

const adminCompanySchema = z.object({
  id: z.string().uuid().nullable(),
  displayName: z.string().trim().min(1, "Укажите название компании.").max(240),
  legalName: z.string().trim().max(300).transform((value) => value || null),
  inn: z.string().trim().regex(/^(?:\d{10}|\d{12})?$/, "ИНН должен содержать 10 или 12 цифр.").transform((value) => value || null),
  email: z.string().trim().toLowerCase().refine((value) => !value || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), "Проверьте адрес email.").transform((value) => value || null).pipe(z.string().max(320).nullable()),
  phone: z.string().trim().max(40).transform((value) => value || null),
});

export async function upsertAdminCompanyAction(_previousState: AdminCompanyUpdateState, formData: FormData): Promise<AdminCompanyUpdateState> {
  try {
    const actor = await getCurrentDemoUser();
    requirePermission(actor, "admin:manage_directories");
    if (designPreviewEnabled) return { status: "error", message: "В режиме просмотра дизайна изменения не сохраняются." };

    const parsed = adminCompanySchema.safeParse({
      id: String(formData.get("id") ?? "") || null,
      displayName: String(formData.get("displayName") ?? ""),
      legalName: String(formData.get("legalName") ?? ""),
      inn: String(formData.get("inn") ?? ""),
      email: String(formData.get("email") ?? ""),
      phone: String(formData.get("phone") ?? ""),
    });
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте заполненные поля." };

    const input = parsed.data;
    const { db } = getDatabase();
    const [existing] = input.id ? await db.select().from(companies).where(eq(companies.id, input.id)).limit(1) : [undefined];
    if (input.id && !existing) return { status: "error", message: "Компания не найдена." };
    const now = new Date();
    const id = input.id ?? randomUUID();
    const after = { displayName: input.displayName, legalName: input.legalName, inn: input.inn, email: input.email, phone: input.phone };
    const before = existing ? { displayName: existing.displayName, legalName: existing.legalName, inn: existing.inn, email: existing.email, phone: existing.phone } : null;
    const changed = !before || Object.keys(after).some((key) => after[key as keyof typeof after] !== before[key as keyof typeof before]);
    if (!changed) return { status: "success", message: "Изменений нет.", companyId: id };

    await db.transaction(async (tx) => {
      if (existing) {
        await tx.update(companies).set({ ...after, updatedAt: now }).where(eq(companies.id, id));
      } else {
        await tx.insert(companies).values({ id, ...after, billingDetails: null, isActive: true, createdAt: now, updatedAt: now });
      }
      await tx.insert(auditLogs).values({
        id: randomUUID(), actorUserId: actor.id, entityType: "COMPANY", entityId: id,
        action: existing ? "COMPANY_UPDATED" : "COMPANY_CREATED",
        payload: { before, after }, createdAt: now,
      });
    });

    revalidatePath("/admin/companies");
    revalidatePath(`/admin/companies/${id}`);
    revalidatePath("/admin/users");
    return { status: "success", message: existing ? "Изменения компании сохранены." : "Компания создана.", companyId: id };
  } catch (error) {
    if (error instanceof DomainError) return { status: "error", message: error.message };
    return { status: "error", message: "Не удалось сохранить компанию. Проверьте данные и попробуйте ещё раз." };
  }
}

const adminDriverSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Укажите имя водителя.").max(180),
  phone: z.string().trim().max(40).transform((value) => value || null),
  licenseNumber: z.string().trim().max(80).transform((value) => value || null),
  notes: z.string().trim().max(1000).transform((value) => value || null),
  isAvailable: z.enum(["true", "false"]).transform((value) => value === "true"),
});

export async function updateAdminDriverAction(_previousState: AdminUserUpdateState, formData: FormData): Promise<AdminUserUpdateState> {
  try {
    const actor = await getCurrentDemoUser();
    requirePermission(actor, "admin:manage_users");
    if (designPreviewEnabled) return { status: "error", message: "В режиме просмотра дизайна изменения не сохраняются." };

    const parsed = adminDriverSchema.safeParse({
      id: String(formData.get("id") ?? ""),
      name: String(formData.get("name") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      licenseNumber: String(formData.get("licenseNumber") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      isAvailable: String(formData.get("isAvailable") ?? ""),
    });
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте заполненные поля." };
    const input = parsed.data;
    const { db } = getDatabase();
    const [target, profiles] = await Promise.all([
      db.select().from(users).where(and(eq(users.id, input.id), eq(users.role, "DRIVER"))).limit(1),
      db.select().from(driverProfiles).where(eq(driverProfiles.userId, input.id)).limit(1),
    ]);
    if (!target[0]) return { status: "error", message: "Водитель не найден." };
    const currentProfile = profiles[0] ?? null;

    if (input.isAvailable) {
      const [{ value }] = await db.select({ value: count() }).from(orders)
        .where(and(eq(orders.driverUserId, input.id), notInArray(orders.status, ["COMPLETED", "CANCELLED"])));
      if (value > 0) return { status: "error", message: "У водителя есть активные назначения — сначала завершите их." };
    }

    const before = {
      name: target[0].name, phone: target[0].phone,
      licenseNumber: currentProfile?.licenseNumber ?? null, notes: currentProfile?.notes ?? null,
      isAvailable: currentProfile?.isAvailable ?? true,
    };
    const after = { name: input.name, phone: input.phone, licenseNumber: input.licenseNumber, notes: input.notes, isAvailable: input.isAvailable };
    const changed = Object.keys(after).some((key) => after[key as keyof typeof after] !== before[key as keyof typeof before]);
    if (!changed) return { status: "success", message: "Изменений нет." };
    const now = new Date();

    await db.transaction(async (tx) => {
      if (target[0].name !== input.name || target[0].phone !== input.phone) {
        await tx.update(users).set({ name: input.name, phone: input.phone, updatedAt: now }).where(eq(users.id, input.id));
      }
      await tx.insert(driverProfiles).values({
        id: currentProfile?.id ?? randomUUID(), userId: input.id, licenseNumber: input.licenseNumber, notes: input.notes,
        isAvailable: input.isAvailable, createdAt: currentProfile?.createdAt ?? now, updatedAt: now,
      }).onConflictDoUpdate({
        target: driverProfiles.userId,
        set: { licenseNumber: input.licenseNumber, notes: input.notes, isAvailable: input.isAvailable, updatedAt: now },
      });
      await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "USER", entityId: input.id, action: "DRIVER_PROFILE_UPDATED", payload: { before, after }, createdAt: now });
    });

    revalidatePath("/admin/drivers");
    revalidatePath(`/admin/drivers/${input.id}`);
    revalidatePath("/manager/drivers");
    revalidatePath("/manager/planning");
    return { status: "success", message: "Профиль водителя сохранён." };
  } catch (error) {
    if (error instanceof DomainError) return { status: "error", message: error.message };
    return { status: "error", message: "Не удалось сохранить профиль. Проверьте данные и попробуйте ещё раз." };
  }
}

export type AdminResourceUpdateState = { status: "idle" | "success" | "error"; message: string };

const resourceIdSchema = z.string().uuid().nullable();
const optionalIntegerText = z.string().trim().regex(/^\d*$/, "Введите целое число.").transform((value) => value ? Number(value) : null).pipe(z.number().int().nonnegative().max(10000000).nullable());
const optionalDecimalText = z.string().trim().regex(/^\d*(?:[.,]\d{1,2})?$/, "Введите число с точностью до двух знаков.").transform((value) => value ? Number(value.replace(",", ".")) : null).pipe(z.number().nonnegative().max(1000000).nullable());
const adminResourceSchema = z.discriminatedUnion("section", [
  z.object({ section: z.literal("vehicles"), id: resourceIdSchema, name: z.string().trim().min(1, "Укажите название транспорта.").max(160), vehicleType: z.string().trim().max(80).transform((value) => value || null), plateNumber: z.string().trim().toUpperCase().max(20).transform((value) => value || null), capacityKg: optionalIntegerText, volumeM3: optionalDecimalText }),
  z.object({ section: z.literal("warehouses"), id: resourceIdSchema, name: z.string().trim().min(1, "Укажите название склада.").max(180), addressText: z.string().trim().min(1, "Укажите адрес склада.").max(4000), phone: z.string().trim().max(40).transform((value) => value || null), workingHours: z.string().trim().max(120).transform((value) => value || null) }),
  z.object({ section: z.literal("services"), id: resourceIdSchema, code: z.string().trim().toUpperCase().regex(/^[A-Z0-9_-]{2,40}$/, "Используйте 2–40 латинских букв, цифр, дефисов или подчёркиваний."), name: z.string().trim().min(1, "Укажите название услуги.").max(160), description: z.string().trim().max(4000).transform((value) => value || null), unit: z.string().trim().max(40).transform((value) => value || null), basePrice: optionalDecimalText }),
]);

export async function upsertAdminResourceAction(_previousState: AdminResourceUpdateState, formData: FormData): Promise<AdminResourceUpdateState> {
  try {
    const actor = await getCurrentDemoUser();
    requirePermission(actor, "admin:manage_directories");
    if (designPreviewEnabled) return { status: "error", message: "В режиме просмотра дизайна изменения не сохраняются." };

    const section = String(formData.get("section") ?? "");
    const parsed = adminResourceSchema.safeParse({
      section,
      id: String(formData.get("id") ?? "") || null,
      name: String(formData.get("name") ?? ""),
      vehicleType: String(formData.get("vehicleType") ?? ""),
      plateNumber: String(formData.get("plateNumber") ?? ""),
      capacityKg: String(formData.get("capacityKg") ?? ""),
      volumeM3: String(formData.get("volumeM3") ?? ""),
      addressText: String(formData.get("addressText") ?? ""),
      phone: String(formData.get("phone") ?? ""),
      workingHours: String(formData.get("workingHours") ?? ""),
      code: String(formData.get("code") ?? ""),
      description: String(formData.get("description") ?? ""),
      unit: String(formData.get("unit") ?? ""),
      basePrice: String(formData.get("basePrice") ?? ""),
    });
    if (!parsed.success) return { status: "error", message: parsed.error.issues[0]?.message ?? "Проверьте заполненные поля." };
    const input = parsed.data;
    const { db } = getDatabase();
    const now = new Date();
    const id = input.id ?? randomUUID();

    if (input.section === "vehicles") {
      const [existing] = input.id ? await db.select().from(vehicles).where(eq(vehicles.id, input.id)).limit(1) : [undefined];
      if (input.id && !existing) return { status: "error", message: "Транспорт не найден." };
      if (input.plateNumber) {
        const [plateOwner] = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.plateNumber, input.plateNumber)).limit(1);
        if (plateOwner && plateOwner.id !== id) return { status: "error", message: "Этот регистрационный номер уже используется." };
      }
      const after = { name: input.name, vehicleType: input.vehicleType, plateNumber: input.plateNumber, capacityKg: input.capacityKg, volumeM3: input.volumeM3 };
      if (existing && !hasChanges(existing, after)) return { status: "success", message: "Изменений нет." };
      await db.transaction(async (tx) => {
        if (existing) await tx.update(vehicles).set({ ...after, updatedAt: now }).where(eq(vehicles.id, id));
        else await tx.insert(vehicles).values({ id, ...after, isActive: true, createdAt: now, updatedAt: now });
        await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "VEHICLE", entityId: id, action: existing ? "VEHICLE_UPDATED" : "VEHICLE_CREATED", payload: { before: existing ?? null, after }, createdAt: now });
      });
    } else if (input.section === "warehouses") {
      const [existing] = input.id ? await db.select().from(warehouses).where(eq(warehouses.id, input.id)).limit(1) : [undefined];
      if (input.id && !existing) return { status: "error", message: "Склад не найден." };
      const after = { name: input.name, addressText: input.addressText, phone: input.phone, workingHours: input.workingHours };
      if (existing && !hasChanges(existing, after)) return { status: "success", message: "Изменений нет." };
      await db.transaction(async (tx) => {
        if (existing) await tx.update(warehouses).set({ ...after, updatedAt: now }).where(eq(warehouses.id, id));
        else await tx.insert(warehouses).values({ id, ...after, isActive: true, createdAt: now, updatedAt: now });
        await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "WAREHOUSE", entityId: id, action: existing ? "WAREHOUSE_UPDATED" : "WAREHOUSE_CREATED", payload: { before: existing ?? null, after }, createdAt: now });
      });
    } else {
      const [existing] = input.id ? await db.select().from(services).where(eq(services.id, input.id)).limit(1) : [undefined];
      if (input.id && !existing) return { status: "error", message: "Услуга не найдена." };
      const [codeOwner] = await db.select({ id: services.id }).from(services).where(eq(services.code, input.code)).limit(1);
      if (codeOwner && codeOwner.id !== id) return { status: "error", message: "Такой код услуги уже существует." };
      const after = { code: input.code, name: input.name, description: input.description, unit: input.unit, basePrice: input.basePrice };
      if (existing && !hasChanges(existing, after)) return { status: "success", message: "Изменений нет." };
      await db.transaction(async (tx) => {
        if (existing) await tx.update(services).set({ ...after, updatedAt: now }).where(eq(services.id, id));
        else await tx.insert(services).values({ id, ...after, isActive: true, createdAt: now, updatedAt: now });
        await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "SERVICE", entityId: id, action: existing ? "SERVICE_UPDATED" : "SERVICE_CREATED", payload: { before: existing ?? null, after }, createdAt: now });
      });
    }

    revalidatePath(`/admin/${input.section}`);
    revalidatePath(`/admin/${input.section}/${id}`);
    if (input.section === "vehicles") revalidatePath("/manager/planning");
    if (input.section === "services") revalidatePath("/client/orders/new");
    return { status: "success", message: "Изменения сохранены и записаны в журнал действий." };
  } catch (error) {
    if (error instanceof DomainError) return { status: "error", message: error.message };
    return { status: "error", message: "Не удалось сохранить запись. Проверьте данные и попробуйте ещё раз." };
  }
}

export async function toggleDirectoryActiveAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const sectionValue = String(formData.get("section") ?? "");
  if (!sections.includes(sectionValue as Section)) throw new Error("Неизвестный справочник.");
  const section = sectionValue as Section;
  requirePermission(actor, section === "users" || section === "drivers" ? "admin:manage_users" : "admin:manage_directories");
  const id = String(formData.get("id") ?? "");
  const active = formData.get("active") === "true";
  const { db } = getDatabase();

  if (section === "users" || section === "drivers") {
    await db.transaction(async (tx) => {
      await tx.select({ id: users.id }).from(users).where(and(eq(users.role, "ADMIN"), eq(users.isActive, true))).orderBy(users.id).for("update");
      const [target] = await tx.select({ id: users.id, role: users.role, isActive: users.isActive }).from(users).where(eq(users.id, id)).for("update").limit(1);
      if (!target || (section === "drivers" && target.role !== "DRIVER")) throw new Error(section === "drivers" ? "Водитель не найден." : "Пользователь не найден.");
      if (target.id === actor.id && !active) throw new Error("Нельзя отключить собственную демо-учётную запись.");
      if (target.role === "ADMIN" && !active && target.isActive) {
        const [{ value }] = await tx.select({ value: count() }).from(users).where(and(eq(users.role, "ADMIN"), eq(users.isActive, true)));
        if (value <= 1) throw new Error("В системе должен остаться хотя бы один активный администратор.");
      }
      if (target.isActive !== active) {
        await tx.update(users).set({ isActive: active, updatedAt: new Date() }).where(eq(users.id, id));
        await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: section.toUpperCase(), entityId: id, action: active ? "ENABLED" : "DISABLED", payload: { section, active }, createdAt: new Date() });
      }
    });
    revalidatePath(`/admin/${section}`);
    revalidatePath(`/admin/${section}/${id}`);
    return;
  } else if (section === "companies") await db.update(companies).set({ isActive: active, updatedAt: new Date() }).where(eq(companies.id, id));
  else if (section === "vehicles") await db.update(vehicles).set({ isActive: active, updatedAt: new Date() }).where(eq(vehicles.id, id));
  else if (section === "warehouses") await db.update(warehouses).set({ isActive: active, updatedAt: new Date() }).where(eq(warehouses.id, id));
  else await db.update(services).set({ isActive: active, updatedAt: new Date() }).where(eq(services.id, id));

  await db.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: section.toUpperCase(), entityId: id, action: active ? "ENABLED" : "DISABLED", payload: { section, active }, createdAt: new Date() });
  revalidatePath(`/admin/${section}`);
  if (["drivers", "companies", "vehicles", "warehouses", "services"].includes(section)) revalidatePath(`/admin/${section}/${id}`);
  if (section === "vehicles") revalidatePath("/manager/planning");
  if (section === "services") revalidatePath("/client/orders/new");
}

function hasChanges(before: Record<string, unknown>, after: Record<string, unknown>) {
  return Object.keys(after).some((key) => before[key] !== after[key]);
}
