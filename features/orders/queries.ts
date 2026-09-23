import "server-only";

import { and, asc, count, desc, eq, inArray, isNotNull } from "drizzle-orm";
import { getDatabase } from "@/db";
import { attachments, cargoItems, comments, companies, driverProfiles, orderServices, orders, routePoints, services, statusHistory, suppliers, users, vehicles, warehouseOperations, type Attachment, type CargoItem, type Comment, type Order, type OrderService, type RoutePoint, type StatusHistory, type Supplier, type User, type WarehouseOperation } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { can } from "@/lib/permissions";
import { designPreviewEnabled, getPreviewOrderDetail, listPreviewOrders, previewAvailableDriver, previewDriverProfile, previewOrderDetails, previewServices, previewSuppliers, previewUsers, previewVehicles } from "@/lib/design-preview/data";

const activeStatuses = ["SUBMITTED", "REVIEW", "CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "ISSUE", "ON_HOLD"] as const;
const managerRouteStatuses = ["DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS"] as const;

export type ManagerActiveRoute = {
  order: Pick<Order, "id" | "number" | "title" | "status" | "plannedDeliveryAt">;
  companyName: string;
  driverName: string | null;
  vehicleName: string | null;
  points: Pick<RoutePoint, "id" | "orderId" | "sequence" | "type" | "label" | "addressText" | "plannedAt">[];
};

export type OrderDetails = {
  order: Order;
  companyName: string;
  clientName: string | null;
  driverName: string | null;
  vehicleName: string | null;
  vehiclePlateNumber: string | null;
  cargo: CargoItem[];
  points: RoutePoint[];
  history: StatusHistory[];
  comments: { comment: Comment; authorName: string }[];
  files: Attachment[];
  operations: { operation: WarehouseOperation; operatorName: string }[];
  serviceLines: { line: OrderService; serviceName: string; serviceUnit: string | null }[];
};

export type ClientSupplierOption = Pick<Supplier, "id" | "name" | "contactName" | "phone" | "addressText">;
export type OrderCreationCompanyOption = Pick<typeof companies.$inferSelect, "id" | "displayName">;

export async function getOrdersForUser(user: User, options: { statuses?: readonly Order["status"][]; limit?: number } = {}) {
  if (designPreviewEnabled) return listPreviewOrders(user, options.statuses).slice(0, options.limit ?? 100);
  const { db } = getDatabase();
  const conditions = [];
  if (user.role === "CLIENT") conditions.push(eq(orders.companyId, user.companyId!));
  if (user.role === "DRIVER") conditions.push(eq(orders.driverUserId, user.id));
  if (user.role === "WAREHOUSE") conditions.push(and(isNotNull(orders.warehouseId), inArray(orders.status, ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED", "ISSUE"] as const))!);
  if (options.statuses?.length) conditions.push(inArray(orders.status, options.statuses));

  const rows = await db.select({
    order: orders,
    companyName: companies.displayName,
    clientName: users.name,
  }).from(orders)
    .innerJoin(companies, eq(companies.id, orders.companyId))
    .leftJoin(users, eq(users.id, orders.createdByUserId))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(orders.updatedAt))
    .limit(options.limit ?? 100);
  return rows;
}

export async function getDriverDashboardJobs(user: User) {
  const statuses = ["DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "ISSUE", "ON_HOLD"] as const;
  const rows = await getOrdersForUser(user, { statuses, limit: 20 });
  const points = await getRoutePointsForOrders(rows.map(({ order }) => order.id));
  const pointsByOrder = new Map<string, RoutePoint[]>();
  for (const point of points) {
    const orderPoints = pointsByOrder.get(point.orderId) ?? [];
    orderPoints.push(point);
    pointsByOrder.set(point.orderId, orderPoints);
  }
  return rows.map((row) => ({ ...row, points: pointsByOrder.get(row.order.id) ?? [] }));
}

export async function getRoutePointsForOrders(orderIds: readonly string[]) {
  if (!orderIds.length) return [] as RoutePoint[];
  if (designPreviewEnabled) {
    const requestedIds = new Set(orderIds);
    return previewOrderDetails.filter(({ order }) => requestedIds.has(order.id)).flatMap(({ points }) => points);
  }
  const { db } = getDatabase();
  return db.select().from(routePoints).where(inArray(routePoints.orderId, [...orderIds])).orderBy(routePoints.orderId, routePoints.sequence);
}

export async function getOrderDetails(orderId: string, user?: User): Promise<OrderDetails | null> {
  const actor = user ?? await getCurrentDemoUser();
  if (designPreviewEnabled) {
    const detail = getPreviewOrderDetail(orderId);
    if (!detail) return null;
    if (!can(actor, "orders:view", detail.order)) return null;
    return {
      ...detail,
      driverName: detail.order.driverUserId ? previewUsers.find((user) => user.id === detail.order.driverUserId)?.name ?? null : null,
      vehicleName: detail.order.vehicleId ? previewVehicles.find((vehicle) => vehicle.id === detail.order.vehicleId)?.name ?? null : null,
      vehiclePlateNumber: detail.order.vehicleId ? previewVehicles.find((vehicle) => vehicle.id === detail.order.vehicleId)?.plateNumber ?? null : null,
      comments: actor.role === "CLIENT" || actor.role === "DRIVER"
        ? detail.comments.filter(({ comment }) => comment.scope === "CLIENT_VISIBLE")
        : detail.comments,
      operations: actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "WAREHOUSE" ? detail.operations : [],
      history: actor.role === "CLIENT" || actor.role === "DRIVER" ? detail.history.map((item) => ({ ...item, note: null })) : detail.history,
      files: detail.files.filter((file) => actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "WAREHOUSE" || file.visibility === "CLIENT"),
    };
  }
  const { db } = getDatabase();
  const [row] = await db.select({ order: orders, companyName: companies.displayName, clientName: users.name })
    .from(orders).innerJoin(companies, eq(companies.id, orders.companyId)).leftJoin(users, eq(users.id, orders.createdByUserId))
    .where(eq(orders.id, orderId)).limit(1);
  if (!row) return null;
  if (!can(actor, "orders:view", row.order)) return null;

  const commentScope = actor.role === "CLIENT" || actor.role === "DRIVER" ? eq(comments.scope, "CLIENT_VISIBLE") : undefined;
  const [cargo, points, history, commentRows, files, operations, serviceLines, driverRows, vehicleRows] = await Promise.all([
    db.select().from(cargoItems).where(eq(cargoItems.orderId, orderId)),
    db.select().from(routePoints).where(eq(routePoints.orderId, orderId)).orderBy(routePoints.sequence),
    db.select().from(statusHistory).where(eq(statusHistory.orderId, orderId)).orderBy(desc(statusHistory.createdAt)),
    db.select({ comment: comments, authorName: users.name }).from(comments).innerJoin(users, eq(users.id, comments.authorUserId))
      .where(commentScope ? and(eq(comments.orderId, orderId), commentScope) : eq(comments.orderId, orderId)).orderBy(comments.createdAt),
    db.select().from(attachments).where(eq(attachments.orderId, orderId)).orderBy(desc(attachments.createdAt)),
    db.select({ operation: warehouseOperations, operatorName: users.name }).from(warehouseOperations).innerJoin(users, eq(users.id, warehouseOperations.performedByUserId))
      .where(eq(warehouseOperations.orderId, orderId)).orderBy(desc(warehouseOperations.performedAt)),
    db.select({ line: orderServices, serviceName: services.name, serviceUnit: services.unit }).from(orderServices).innerJoin(services, eq(services.id, orderServices.serviceId)).where(eq(orderServices.orderId, orderId)),
    row.order.driverUserId
      ? db.select({ name: users.name }).from(users).where(eq(users.id, row.order.driverUserId)).limit(1)
      : Promise.resolve([] as { name: string }[]),
    row.order.vehicleId
      ? db.select({ name: vehicles.name, plateNumber: vehicles.plateNumber }).from(vehicles).where(eq(vehicles.id, row.order.vehicleId)).limit(1)
      : Promise.resolve([] as { name: string; plateNumber: string | null }[]),
  ]);
  const canSeeInternalFiles = actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "WAREHOUSE";
  const canSeeWarehouseOperations = actor.role === "MANAGER" || actor.role === "ADMIN" || actor.role === "WAREHOUSE";
  const canSeeOperationalHistoryNotes = actor.role !== "CLIENT" && actor.role !== "DRIVER";
  return {
    ...row, cargo, points,
    driverName: driverRows[0]?.name ?? null,
    vehicleName: vehicleRows[0]?.name ?? null,
    vehiclePlateNumber: vehicleRows[0]?.plateNumber ?? null,
    history: canSeeOperationalHistoryNotes ? history : history.map((item) => ({ ...item, note: null })),
    comments: commentRows,
    operations: canSeeWarehouseOperations ? operations : [],
    serviceLines,
    files: files.filter((file) => canSeeInternalFiles || file.visibility === "CLIENT"),
  };
}

export async function getDashboardData(user: User) {
  const rows = await getOrdersForUser(user, { limit: 100 });
  const visibleOrders = rows.map((row) => row.order);
  const activeRouteRows = user.role === "MANAGER"
    ? rows.filter(({ order }) => order.driverUserId && (managerRouteStatuses as readonly string[]).includes(order.status))
    : [];
  const currentMonth = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(new Date());
  const currentDay = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const { db } = designPreviewEnabled ? { db: null } : getDatabase();
  const [userCount, companyCount, availableDriverCount] = designPreviewEnabled
    ? [[{ value: 5 }], [{ value: 1 }], [{ value: 1 }]]
    : user.role === "ADMIN"
      ? await Promise.all([
        db!.select({ value: count() }).from(users),
        db!.select({ value: count() }).from(companies),
        db!.select({ value: count() }).from(users).innerJoin(driverProfiles, eq(driverProfiles.userId, users.id))
          .where(and(eq(users.role, "DRIVER"), eq(users.isActive, true), eq(driverProfiles.isAvailable, true))),
      ])
      : [[{ value: 0 }], [{ value: 0 }], [{ value: 0 }]];
  let activeRoutes: ManagerActiveRoute[] = [];
  if (activeRouteRows.length) {
    const [routeRows, driverRows, vehicleRows] = await Promise.all([
      getRoutePointsForOrders(activeRouteRows.map(({ order }) => order.id)),
      getDriverRoster(),
      getActiveVehicles(),
    ]);
    const pointsByOrder = new Map<string, RoutePoint[]>();
    for (const point of routeRows) {
      const orderPoints = pointsByOrder.get(point.orderId) ?? [];
      orderPoints.push(point);
      pointsByOrder.set(point.orderId, orderPoints);
    }
    const driversById = new Map(driverRows.map((driver) => [driver.id, driver.name]));
    const vehiclesById = new Map(vehicleRows.map((vehicle) => [vehicle.id, vehicle.name]));
    activeRoutes = activeRouteRows.map(({ order, companyName }) => ({
      order: {
        id: order.id,
        number: order.number,
        title: order.title,
        status: order.status,
        plannedDeliveryAt: order.plannedDeliveryAt,
      },
      companyName,
      driverName: order.driverUserId ? driversById.get(order.driverUserId) ?? null : null,
      vehicleName: order.vehicleId ? vehiclesById.get(order.vehicleId) ?? null : null,
      points: (pointsByOrder.get(order.id) ?? []).map(({ id, orderId, sequence, type, label, addressText, plannedAt }) => ({
        id, orderId, sequence, type, label, addressText, plannedAt,
      })),
    }));
  }
  return {
    active: visibleOrders.filter((order) => (activeStatuses as readonly string[]).includes(order.status)).length,
    inDelivery: visibleOrders.filter((order) => order.status === "DELIVERY_IN_PROGRESS").length,
    completed: visibleOrders.filter((order) => order.status === "COMPLETED" && order.completedAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit" }).format(order.completedAt) === currentMonth).length,
    incoming: visibleOrders.filter((order) => order.status === "SUBMITTED" || order.status === "REVIEW").length,
    attention: visibleOrders.filter((order) => order.status === "ISSUE" || order.status === "ON_HOLD").length,
    warehouse: visibleOrders.filter((order) => ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY"].includes(order.status)).length,
    warehouseProcessing: visibleOrders.filter((order) => order.status === "WAREHOUSE_PROCESSING").length,
    warehouseIssue: visibleOrders.filter((order) => order.status === "ISSUE").length,
    users: userCount[0]?.value ?? 0,
    companies: companyCount[0]?.value ?? 0,
    driversAvailable: availableDriverCount[0]?.value ?? 0,
    warehouseExpectedToday: visibleOrders.filter((order) => ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS"].includes(order.status) && order.plannedPickupAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(order.plannedPickupAt) === currentDay).length,
    warehouseArrived: visibleOrders.filter((order) => order.status === "PICKED_UP").length,
    warehouseReady: visibleOrders.filter((order) => order.status === "READY_FOR_DELIVERY").length,
    orders: (user.role === "WAREHOUSE" ? rows.filter(({ order }) => ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP"].includes(order.status)) : rows).slice(0, 6),
    activeRoutes,
  };
}

export async function getActiveDrivers() {
  if (designPreviewEnabled) return [{ id: previewAvailableDriver.id, name: previewAvailableDriver.name, phone: previewAvailableDriver.phone }];
  const { db } = getDatabase();
  return db.select({ id: users.id, name: users.name, phone: users.phone })
    .from(users).leftJoin(driverProfiles, eq(driverProfiles.userId, users.id))
    .where(and(eq(users.role, "DRIVER"), eq(users.isActive, true), isNotNull(driverProfiles.userId), eq(driverProfiles.isAvailable, true))).orderBy(users.name);
}

export async function getDriverRoster() {
  if (designPreviewEnabled) return [
    { id: previewUsers[2].id, name: previewUsers[2].name, email: previewUsers[2].email, phone: previewUsers[2].phone, license: previewDriverProfile.licenseNumber, isAvailable: previewDriverProfile.isAvailable },
    { id: previewAvailableDriver.id, name: previewAvailableDriver.name, email: previewAvailableDriver.email, phone: previewAvailableDriver.phone, license: null, isAvailable: true },
  ];
  const { db } = getDatabase();
  return db.select({ id: users.id, name: users.name, email: users.email, phone: users.phone, license: driverProfiles.licenseNumber, isAvailable: driverProfiles.isAvailable })
    .from(users).leftJoin(driverProfiles, eq(driverProfiles.userId, users.id))
    .where(and(eq(users.role, "DRIVER"), eq(users.isActive, true))).orderBy(users.name).limit(100);
}

export async function getActiveVehicles() {
  if (designPreviewEnabled) return previewVehicles.filter((vehicle) => vehicle.isActive).map(({ id, name, plateNumber, capacityKg }) => ({ id, name, plateNumber, capacityKg }));
  const { db } = getDatabase();
  return db.select({ id: vehicles.id, name: vehicles.name, plateNumber: vehicles.plateNumber, capacityKg: vehicles.capacityKg })
    .from(vehicles).where(eq(vehicles.isActive, true)).orderBy(vehicles.name);
}

export async function getActiveServices() {
  if (designPreviewEnabled) return previewServices.filter((service) => service.isActive).map(({ id, code, name, description, unit, basePrice }) => ({ id, code, name, description, unit, basePrice }));
  const { db } = getDatabase();
  return db.select({ id: services.id, code: services.code, name: services.name, description: services.description, unit: services.unit, basePrice: services.basePrice })
    .from(services).where(eq(services.isActive, true)).orderBy(services.name);
}

export async function getClientSuppliers(user: User): Promise<ClientSupplierOption[]> {
  if (user.role !== "CLIENT" || !user.companyId) return [];
  if (designPreviewEnabled) return previewSuppliers.filter((supplier) => supplier.companyId === user.companyId)
    .map(({ id, name, contactName, phone, addressText }) => ({ id, name, contactName, phone, addressText }));
  const { db } = getDatabase();
  const rows = await db.select({ id: suppliers.id, name: suppliers.name, contactName: suppliers.contactName, phone: suppliers.phone, addressText: suppliers.addressText })
    .from(suppliers).where(eq(suppliers.companyId, user.companyId)).orderBy(asc(suppliers.name)).limit(100);
  return [...new Map(rows.map((supplier) => [supplier.name.trim().toLocaleLowerCase("ru-RU"), supplier])).values()];
}

export async function getOrderCreationCompanies(user: User): Promise<OrderCreationCompanyOption[]> {
  if (user.role !== "MANAGER" && user.role !== "ADMIN") return [];
  if (designPreviewEnabled) return [{ id: previewUsers[0].companyId!, displayName: "СтальПром" }];
  const { db } = getDatabase();
  return db.select({ id: companies.id, displayName: companies.displayName }).from(companies)
    .where(eq(companies.isActive, true)).orderBy(asc(companies.displayName)).limit(300);
}

export function getSectionStatuses(role: User["role"], section?: string): readonly Order["status"][] | undefined {
  if (role === "MANAGER" && section === "incoming") return ["SUBMITTED", "REVIEW"];
  if (role === "MANAGER" && section === "warehouse") return ["PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY"];
  if (role === "DRIVER" && section === "jobs") return ["DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "ISSUE"];
  if (role === "DRIVER" && section === "history") return ["DELIVERED", "COMPLETED", "CANCELLED"];
  if (role === "WAREHOUSE" && section === "expected") return ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP"];
  if (role === "WAREHOUSE" && section === "intake") return ["PICKED_UP", "AT_WAREHOUSE"];
  if (role === "WAREHOUSE" && section === "processing") return ["WAREHOUSE_PROCESSING"];
  if (role === "WAREHOUSE" && section === "ready") return ["READY_FOR_DELIVERY"];
  if (role === "WAREHOUSE" && section === "history") return ["DELIVERED", "COMPLETED"];
  return undefined;
}
