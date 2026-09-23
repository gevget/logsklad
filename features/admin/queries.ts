import "server-only";

import { and, count, desc, eq, notInArray } from "drizzle-orm";
import { z } from "zod";
import { orderStatusConfig } from "@/config/order-status";
import { getDatabase } from "@/db";
import { auditLogs, companies, driverProfiles, orders, services, users, vehicles, warehouses, type Company, type DriverProfile, type Order, type Service, type User, type Vehicle, type Warehouse } from "@/db/schema";
import { requirePermission } from "@/lib/permissions";
import { designPreviewEnabled, previewAvailableDriver, previewCompany, previewDriverProfile, previewOrders, previewServices, previewUsers, previewVehicles, previewWarehouses } from "@/lib/design-preview/data";

export type AdminDirectory = { headers: string[]; rows: { id: string; cells: string[]; active?: boolean; createdAt?: number }[] };
export type AdminUserDetail = {
  user: User;
  company: { id: string; displayName: string; legalName: string | null; inn: string | null; isActive: boolean } | null;
  companies: { id: string; displayName: string; isActive: boolean }[];
};
export type AdminCompanyDetail = {
  company: Company;
  users: { id: string; name: string; email: string; role: User["role"]; isActive: boolean }[];
  orders: Pick<Order, "id" | "number" | "title" | "status" | "updatedAt">[];
  orderCount: number;
};
export type AdminDriverDetail = {
  user: User;
  profile: DriverProfile | null;
  assignments: (Pick<Order, "id" | "number" | "title" | "status" | "plannedPickupAt" | "plannedDeliveryAt"> & { vehicleName: string | null; plateNumber: string | null })[];
};
export type AdminResourceSection = "vehicles" | "warehouses" | "services";
export type AdminResourceDetail =
  | { section: "vehicles"; resource: Vehicle }
  | { section: "warehouses"; resource: Warehouse }
  | { section: "services"; resource: Service };

export async function getAdminUserDetail(actor: User, userId: string): Promise<AdminUserDetail | null> {
  requirePermission(actor, "admin:manage_users");
  const parsedId = z.string().uuid().safeParse(userId);
  if (!parsedId.success) return null;

  if (designPreviewEnabled) {
    const previewUser = previewUsers.find((candidate) => candidate.id === parsedId.data);
    if (!previewUser) return null;
    return {
      user: previewUser,
      company: previewUser.companyId === previewCompany.id
        ? { id: previewCompany.id, displayName: previewCompany.displayName, legalName: previewCompany.legalName, inn: previewCompany.inn, isActive: previewCompany.isActive }
        : null,
      companies: [{ id: previewCompany.id, displayName: previewCompany.displayName, isActive: previewCompany.isActive }],
    };
  }

  const { db } = getDatabase();
  const [record, companyRows] = await Promise.all([
    db.select({
      user: users,
      company: {
        id: companies.id,
        displayName: companies.displayName,
        legalName: companies.legalName,
        inn: companies.inn,
        isActive: companies.isActive,
      },
    }).from(users).leftJoin(companies, eq(users.companyId, companies.id)).where(eq(users.id, parsedId.data)).limit(1),
    db.select({ id: companies.id, displayName: companies.displayName, isActive: companies.isActive })
      .from(companies).orderBy(companies.displayName).limit(300),
  ]);

  if (!record[0]) return null;
  return {
    user: record[0].user,
    company: record[0].company?.id ? record[0].company : null,
    companies: companyRows,
  };
}

export async function getAdminCompanyDetail(actor: User, companyId: string): Promise<AdminCompanyDetail | null> {
  requirePermission(actor, "admin:manage_directories");
  const parsedId = z.string().uuid().safeParse(companyId);
  if (!parsedId.success) return null;

  if (designPreviewEnabled) {
    if (previewCompany.id !== parsedId.data) return null;
    const companyUsers = previewUsers.filter((candidate) => candidate.companyId === previewCompany.id);
    const companyOrders = previewOrders.filter((order) => order.companyId === previewCompany.id).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return {
      company: previewCompany,
      users: companyUsers.map(({ id, name, email, role, isActive }) => ({ id, name, email, role, isActive })),
      orders: companyOrders.slice(0, 5).map(({ id, number, title, status, updatedAt }) => ({ id, number, title, status, updatedAt })),
      orderCount: companyOrders.length,
    };
  }

  const { db } = getDatabase();
  const [companyRows, companyUsers, companyOrders, orderCounts] = await Promise.all([
    db.select().from(companies).where(eq(companies.id, parsedId.data)).limit(1),
    db.select({ id: users.id, name: users.name, email: users.email, role: users.role, isActive: users.isActive })
      .from(users).where(eq(users.companyId, parsedId.data)).orderBy(users.name).limit(150),
    db.select({ id: orders.id, number: orders.number, title: orders.title, status: orders.status, updatedAt: orders.updatedAt })
      .from(orders).where(eq(orders.companyId, parsedId.data)).orderBy(desc(orders.updatedAt)).limit(5),
    db.select({ value: count() }).from(orders).where(eq(orders.companyId, parsedId.data)),
  ]);
  if (!companyRows[0]) return null;
  return { company: companyRows[0], users: companyUsers, orders: companyOrders, orderCount: orderCounts[0].value };
}

export async function getAdminDriverDetail(actor: User, driverId: string): Promise<AdminDriverDetail | null> {
  requirePermission(actor, "admin:manage_users");
  const parsedId = z.string().uuid().safeParse(driverId);
  if (!parsedId.success) return null;

  if (designPreviewEnabled) {
    const driver = [previewUsers[2], previewAvailableDriver].find((candidate) => candidate.id === parsedId.data);
    if (!driver) return null;
    const profile = driver.id === previewDriverProfile.userId ? previewDriverProfile : null;
    const assignments = previewOrders.filter((order) => order.driverUserId === driver.id && !["COMPLETED", "CANCELLED"].includes(order.status));
    return {
      user: driver,
      profile,
      assignments: assignments.map(({ id, number, title, status, plannedPickupAt, plannedDeliveryAt, vehicleId }) => ({
        id, number, title, status, plannedPickupAt, plannedDeliveryAt,
        vehicleName: previewVehicles.find((vehicle) => vehicle.id === vehicleId)?.name ?? null,
        plateNumber: previewVehicles.find((vehicle) => vehicle.id === vehicleId)?.plateNumber ?? null,
      })),
    };
  }

  const { db } = getDatabase();
  const [driverRows, profileRows, assignmentRows] = await Promise.all([
    db.select().from(users).where(and(eq(users.id, parsedId.data), eq(users.role, "DRIVER"))).limit(1),
    db.select().from(driverProfiles).where(eq(driverProfiles.userId, parsedId.data)).limit(1),
    db.select({
      id: orders.id, number: orders.number, title: orders.title, status: orders.status, plannedPickupAt: orders.plannedPickupAt, plannedDeliveryAt: orders.plannedDeliveryAt,
      vehicleName: vehicles.name,
      plateNumber: vehicles.plateNumber,
    }).from(orders).leftJoin(vehicles, eq(orders.vehicleId, vehicles.id))
      .where(and(eq(orders.driverUserId, parsedId.data), notInArray(orders.status, ["COMPLETED", "CANCELLED"])))
      .orderBy(orders.plannedPickupAt).limit(20),
  ]);
  if (!driverRows[0]) return null;
  return {
    user: driverRows[0],
    profile: profileRows[0] ?? null,
    assignments: assignmentRows,
  };
}

export async function getAdminResourceDetail(actor: User, section: AdminResourceSection, resourceId: string): Promise<AdminResourceDetail | null> {
  requirePermission(actor, "admin:manage_directories");
  const parsedId = z.string().uuid().safeParse(resourceId);
  if (!parsedId.success) return null;

  if (designPreviewEnabled) {
    if (section === "vehicles") {
      const resource = previewVehicles.find((item) => item.id === parsedId.data);
      return resource ? { section, resource } : null;
    }
    if (section === "warehouses") {
      const resource = previewWarehouses.find((item) => item.id === parsedId.data);
      return resource ? { section, resource } : null;
    }
    const resource = previewServices.find((item) => item.id === parsedId.data);
    return resource ? { section, resource } : null;
  }

  const { db } = getDatabase();
  if (section === "vehicles") {
    const [resource] = await db.select().from(vehicles).where(eq(vehicles.id, parsedId.data)).limit(1);
    return resource ? { section, resource } : null;
  }
  if (section === "warehouses") {
    const [resource] = await db.select().from(warehouses).where(eq(warehouses.id, parsedId.data)).limit(1);
    return resource ? { section, resource } : null;
  }
  const [resource] = await db.select().from(services).where(eq(services.id, parsedId.data)).limit(1);
  return resource ? { section, resource } : null;
}

export async function getAdminDirectory(user: User, section: string): Promise<AdminDirectory> {
  requirePermission(user, section === "audit" ? "admin:view_audit" : "admin:manage_directories");
  if (designPreviewEnabled) {
    if (section === "users") return { headers: ["Имя", "Email", "Роль", "Телефон", "Статус"], rows: previewUsers.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.email, roleLabel(row.role), row.phone ?? "—", row.isActive ? "Активен" : "Отключён"] })) };
    if (section === "companies") return { headers: ["Компания", "ИНН", "Контакт", "Телефон", "Статус"], rows: [{ id: previewCompany.id, active: previewCompany.isActive, cells: [previewCompany.displayName, previewCompany.inn ?? "—", previewCompany.email ?? "—", previewCompany.phone ?? "—", "Активна"] }] };
    if (section === "drivers") return { headers: ["Водитель", "Телефон", "Email", "Удостоверение", "Доступность"], rows: [previewUsers[2], previewAvailableDriver].map((row, index) => ({ id: row.id, active: row.isActive, cells: [row.name, row.phone ?? "—", row.email, index === 0 ? previewDriverProfile.licenseNumber ?? "—" : "—", index === 0 ? "Назначен на рейс" : "Доступен"] })) };
    if (section === "vehicles") return { headers: ["Транспорт", "Тип", "Номер", "Грузоподъёмность", "Статус"], rows: previewVehicles.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.vehicleType ?? "—", row.plateNumber ?? "—", row.capacityKg ? `${row.capacityKg} кг` : "—", row.isActive ? "Активен" : "Отключён"] })) };
    if (section === "warehouses") return { headers: ["Склад", "Адрес", "Телефон", "Часы работы", "Статус"], rows: previewWarehouses.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.addressText, row.phone ?? "—", row.workingHours ?? "—", row.isActive ? "Активен" : "Отключён"] })) };
    if (section === "services") return { headers: ["Услуга", "Код", "Единица", "Базовая цена", "Статус"], rows: previewServices.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.code, row.unit ?? "—", row.basePrice === null ? "—" : new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(row.basePrice), row.isActive ? "Активна" : "Отключена"] })) };
    if (section === "audit") return { headers: ["Действие", "Объект", "Пользователь", "Время", "Подробности"], rows: [
      { id: "c1000000-0000-4000-8000-000000000001", createdAt: new Date("2026-09-22T08:50:00.000Z").getTime(), cells: [auditActionLabel("STATUS_CHANGED"), auditEntityLabel("ORDER"), "Анна Смирнова", "22 сент. 2026, 11:50", "Заявка · На проверке → Согласована"] },
      { id: "c1000000-0000-4000-8000-000000000002", createdAt: new Date("2026-09-22T07:15:00.000Z").getTime(), cells: [auditActionLabel("ORDER_CREATED"), auditEntityLabel("ORDER"), "Алексей Морозов", "22 сент. 2026, 10:15", "Создана заявка TR-2609-00128"] },
    ] };
    return { headers: [], rows: [] };
  }
  const { db } = getDatabase();
  if (section === "users") {
    const rows = await db.select({ id: users.id, name: users.name, email: users.email, role: users.role, phone: users.phone, active: users.isActive }).from(users).orderBy(users.name).limit(150);
    return { headers: ["Имя", "Email", "Роль", "Телефон", "Статус"], rows: rows.map((row) => ({ id: row.id, active: row.active, cells: [row.name, row.email, roleLabel(row.role), row.phone ?? "—", row.active ? "Активен" : "Отключён"] })) };
  }
  if (section === "companies") {
    const rows = await db.select().from(companies).orderBy(companies.displayName).limit(150);
    return { headers: ["Компания", "ИНН", "Контакт", "Телефон", "Статус"], rows: rows.map((row) => ({ id: row.id, active: row.isActive, cells: [row.displayName, row.inn ?? "—", row.email ?? "—", row.phone ?? "—", row.isActive ? "Активна" : "Отключена"] })) };
  }
  if (section === "drivers") {
    const rows = await db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, license: driverProfiles.licenseNumber, available: driverProfiles.isAvailable, active: users.isActive }).from(users).leftJoin(driverProfiles, eq(driverProfiles.userId, users.id)).where(eq(users.role, "DRIVER")).orderBy(users.name).limit(150);
    return { headers: ["Водитель", "Телефон", "Email", "Удостоверение", "Доступность"], rows: rows.map((row) => ({ id: row.id, active: row.active, cells: [row.name, row.phone ?? "—", row.email, row.license ?? "—", row.available ? "Доступен" : "Занят"] })) };
  }
  if (section === "vehicles") {
    const rows = await db.select().from(vehicles).orderBy(vehicles.name).limit(150);
    return { headers: ["Транспорт", "Тип", "Номер", "Грузоподъёмность", "Статус"], rows: rows.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.vehicleType ?? "—", row.plateNumber ?? "—", row.capacityKg ? `${row.capacityKg} кг` : "—", row.isActive ? "Активен" : "Отключён"] })) };
  }
  if (section === "warehouses") {
    const rows = await db.select().from(warehouses).orderBy(warehouses.name).limit(150);
    return { headers: ["Склад", "Адрес", "Телефон", "Часы работы", "Статус"], rows: rows.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.addressText, row.phone ?? "—", row.workingHours ?? "—", row.isActive ? "Активен" : "Отключён"] })) };
  }
  if (section === "services") {
    const rows = await db.select().from(services).orderBy(services.name).limit(150);
    return { headers: ["Услуга", "Код", "Единица", "Базовая цена", "Статус"], rows: rows.map((row) => ({ id: row.id, active: row.isActive, cells: [row.name, row.code, row.unit ?? "—", row.basePrice === null ? "—" : new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(row.basePrice), row.isActive ? "Активна" : "Отключена"] })) };
  }
  if (section === "audit") {
    const rows = await db.select({ id: auditLogs.id, action: auditLogs.action, entityType: auditLogs.entityType, createdAt: auditLogs.createdAt, actor: users.name, payload: auditLogs.payload }).from(auditLogs).leftJoin(users, eq(users.id, auditLogs.actorUserId)).orderBy(desc(auditLogs.createdAt)).limit(150);
    return { headers: ["Действие", "Объект", "Пользователь", "Время", "Подробности"], rows: rows.map((row) => ({ id: row.id, createdAt: row.createdAt.getTime(), cells: [auditActionLabel(row.action), auditEntityLabel(row.entityType), row.actor ?? "Система", new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(row.createdAt), auditSummary(row.payload)] })) };
  }
  return { headers: [], rows: [] };
}

function roleLabel(role: string) {
  return ({ CLIENT: "Заказчик", MANAGER: "Менеджер", DRIVER: "Водитель", WAREHOUSE: "Склад", ADMIN: "Администратор" } as Record<string, string>)[role] ?? role;
}

function auditSummary(payload: Record<string, unknown> | null) {
  if (!payload) return "—";
  const before = payload.before && typeof payload.before === "object" ? payload.before as Record<string, unknown> : null;
  const after = payload.after && typeof payload.after === "object" ? payload.after as Record<string, unknown> : null;
  if (before?.role && after?.role) return `Роль · ${roleLabel(String(before.role))} → ${roleLabel(String(after.role))}`;
  if (payload.from && payload.to) return `Статус · ${statusLabel(String(payload.from))} → ${statusLabel(String(payload.to))}`;
  if (payload.number) return `Заявка ${String(payload.number)}`;
  if (payload.active !== undefined && payload.section) return `${directoryLabel(String(payload.section))} · ${payload.active ? "включён" : "отключён"}`;
  if (before && after) return "Обновлены данные записи";
  if (payload.filename) return String(payload.filename);
  return "Данные операции";
}

function auditActionLabel(action: string) {
  return ({
    STATUS_CHANGED: "Изменён статус",
    ORDER_CREATED: "Создана заявка",
    ORDER_SUBMITTED: "Заявка отправлена",
    OUTBOUND_DELIVERY_ASSIGNED: "Назначен исходящий рейс",
    WAREHOUSE_RELEASE_RECORDED: "Оформлена выдача со склада",
    WAREHOUSE_OPERATION_RECORDED: "Записана складская операция",
    COMMENT_ADDED: "Добавлен комментарий",
    PRICING_UPDATED: "Обновлена стоимость",
    ATTACHMENT_UPLOADED: "Загружен файл",
    USER_ROLE_CHANGED: "Изменена роль пользователя",
    USER_PROFILE_UPDATED: "Обновлён профиль пользователя",
    DRIVER_PROFILE_UPDATED: "Обновлён профиль водителя",
    COMPANY_CREATED: "Создана компания",
    COMPANY_UPDATED: "Обновлена компания",
    VEHICLE_CREATED: "Добавлен транспорт",
    VEHICLE_UPDATED: "Обновлён транспорт",
    WAREHOUSE_CREATED: "Добавлен склад",
    WAREHOUSE_UPDATED: "Обновлён склад",
    SERVICE_CREATED: "Добавлена услуга",
    SERVICE_UPDATED: "Обновлена услуга",
    ENABLED: "Запись включена",
    DISABLED: "Запись отключена",
  } as Record<string, string>)[action] ?? action.replaceAll("_", " ").toLocaleLowerCase("ru-RU");
}

function auditEntityLabel(entityType: string) {
  return ({ ORDER: "Заявка", USER: "Пользователь", COMPANY: "Компания", VEHICLE: "Транспорт", WAREHOUSE: "Склад", SERVICE: "Услуга" } as Record<string, string>)[entityType] ?? entityType;
}

function directoryLabel(section: string) {
  return ({ users: "Пользователь", drivers: "Водитель", companies: "Компания", vehicles: "Транспорт", warehouses: "Склад", services: "Услуга" } as Record<string, string>)[section] ?? section;
}

function statusLabel(status: string) {
  return orderStatusConfig[status as keyof typeof orderStatusConfig]?.label ?? status;
}
