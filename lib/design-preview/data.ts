import { demoIdentities, type DemoRole } from "@/features/demo/identity";
import type { Attachment, CargoItem, Comment, Company, DriverProfile, Order, OrderService, RoutePoint, Service, StatusHistory, Supplier, User, Vehicle, WarehouseOperation } from "@/db/schema";

export const designPreviewEnabled = process.env.DESIGN_PREVIEW === "true";

const companyId = "a1000000-0000-4000-8000-000000000001";
const warehouseId = "a2000000-0000-4000-8000-000000000001";
const fixedNow = new Date("2026-09-22T09:00:00.000Z");
const date = (value: string) => new Date(value);

export type PreviewOrderDetails = {
  order: Order;
  companyName: string;
  clientName: string | null;
  cargo: CargoItem[];
  points: RoutePoint[];
  history: StatusHistory[];
  comments: { comment: Comment; authorName: string }[];
  files: Attachment[];
  operations: { operation: WarehouseOperation; operatorName: string }[];
  serviceLines: { line: OrderService; serviceName: string; serviceUnit: string | null }[];
};

const roleCompany = (role: DemoRole) => role === "CLIENT" ? companyId : null;
export const previewUsers: User[] = demoIdentities.map((identity, index) => ({
  id: `a0000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  companyId: roleCompany(identity.role), role: identity.role, name: identity.name, email: identity.email,
  phone: "+7 900 555-10-10", avatarUrl: null, isActive: true, createdAt: fixedNow, updatedAt: fixedNow,
}));
export const previewAvailableDriver: User = {
  ...previewUsers[2], id: "a0000000-0000-4000-8000-000000000006", name: "Дмитрий Крылов",
  email: "driver2@demo.local", phone: "+7 916 404-22-18",
};

export const previewSuppliers: Supplier[] = [
  { id: "a5000000-0000-4000-8000-000000000001", companyId, name: "МеталлТрейд", inn: null, contactName: "Иван Петров", phone: "+7 495 781-44-21", email: null, addressText: "Москва, ул. Промышленная, 7", notes: null, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a5000000-0000-4000-8000-000000000002", companyId, name: "СеверСталь Комплект", inn: null, contactName: "Виктория Лебедева", phone: "+7 812 309-81-14", email: null, addressText: "Санкт-Петербург, Пискарёвский пр., 63", notes: null, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a5000000-0000-4000-8000-000000000003", companyId, name: "ИнжСнаб Северо-Запад", inn: null, contactName: "Андрей Климов", phone: "+7 812 600-43-08", email: null, addressText: "Санкт-Петербург, ул. Маршала Новикова, 28", notes: null, createdAt: fixedNow, updatedAt: fixedNow },
];

const baseOrder = (id: string, number: string, status: Order["status"], fields: Partial<Order> = {}): Order => ({
  id, number, companyId, createdByUserId: previewUsers[0].id, managerUserId: previewUsers[1].id,
  driverUserId: null, vehicleId: null, warehouseId, type: "PICKUP_TO_WAREHOUSE", status,
  title: "Профиль стальной для цеха №2", description: "Партия оцинкованного профиля. Нужна аккуратная погрузка.",
  clientReference: null, externalCarrierName: null, externalPayer: null, transportDestinationCity: null,
  documentSetCount: null, returnDocuments: false, subtotal: 34800, servicesTotal: 6100, insuranceTotal: 1200,
  discountTotal: 0, taxTotal: 0, total: 42100, currency: "RUB",
  plannedPickupAt: date("2026-09-23T07:00:00.000Z"), plannedDeliveryAt: date("2026-09-23T14:00:00.000Z"),
  completedAt: null, createdAt: date("2026-09-20T09:00:00.000Z"), updatedAt: date("2026-09-22T08:20:00.000Z"),
  ...fields,
} as unknown as Order);

export const previewOrders: Order[] = [
  baseOrder("b1000000-0000-4000-8000-000000000001", "TR-2609-00124", "COMPLETED", { driverUserId: previewUsers[2].id, vehicleId: "a3000000-0000-4000-8000-000000000001", completedAt: date("2026-09-19T15:30:00.000Z"), plannedPickupAt: date("2026-09-18T08:00:00.000Z"), plannedDeliveryAt: date("2026-09-19T14:00:00.000Z"), updatedAt: date("2026-09-19T15:30:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000002", "TR-2609-00128", "SUBMITTED", { title: "Насосная станция на объект Северный", description: "Потребуется погрузчик на площадке.", plannedPickupAt: date("2026-09-23T07:00:00.000Z"), plannedDeliveryAt: date("2026-09-23T14:00:00.000Z"), createdAt: date("2026-09-22T07:15:00.000Z"), updatedAt: date("2026-09-22T08:20:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000003", "TR-2609-00127", "DRIVER_ASSIGNED", { title: "Комплект автоматики для склада", driverUserId: previewUsers[2].id, vehicleId: "a3000000-0000-4000-8000-000000000001", plannedPickupAt: date("2026-09-22T10:00:00.000Z"), plannedDeliveryAt: date("2026-09-22T16:00:00.000Z"), updatedAt: date("2026-09-22T07:00:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000004", "TR-2609-00126", "WAREHOUSE_PROCESSING", { type: "WAREHOUSE_SERVICE", title: "Маркировка кабельных сборок", plannedPickupAt: null, plannedDeliveryAt: null, updatedAt: date("2026-09-21T13:00:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000005", "TR-2609-00125", "DELIVERY_IN_PROGRESS", { type: "DELIVERY_OWN_TRANSPORT", title: "Поставка крепежа на объект", driverUserId: previewUsers[2].id, vehicleId: "a3000000-0000-4000-8000-000000000001", updatedAt: date("2026-09-22T06:45:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000006", "TR-2609-00129", "ISSUE", { driverUserId: previewUsers[2].id, title: "Листовой металл · требуется уточнение", description: "Нужно согласовать временное окно разгрузки.", updatedAt: date("2026-09-22T08:50:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000007", "TR-2609-00130", "CONFIRMED", { title: "Насосная станция для объекта Северный", plannedPickupAt: date("2026-09-23T10:30:00.000Z"), plannedDeliveryAt: date("2026-09-23T16:00:00.000Z"), updatedAt: date("2026-09-23T08:15:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000008", "TR-2609-00131", "PICKED_UP", { title: "Кабельные лотки · партия 3", driverUserId: previewUsers[2].id, vehicleId: "a3000000-0000-4000-8000-000000000001", plannedPickupAt: date("2026-09-23T07:30:00.000Z"), plannedDeliveryAt: date("2026-09-23T12:30:00.000Z"), updatedAt: date("2026-09-23T08:40:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000009", "TR-2609-00132", "AT_WAREHOUSE", { type: "WAREHOUSE_INTAKE", title: "Электрощитовое оборудование", plannedPickupAt: date("2026-09-23T08:00:00.000Z"), plannedDeliveryAt: null, updatedAt: date("2026-09-23T09:05:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000010", "TR-2609-00133", "READY_FOR_DELIVERY", { title: "Промышленная арматура", driverUserId: previewUsers[2].id, vehicleId: "a3000000-0000-4000-8000-000000000001", plannedPickupAt: date("2026-09-22T08:00:00.000Z"), plannedDeliveryAt: date("2026-09-23T14:00:00.000Z"), updatedAt: date("2026-09-23T08:50:00.000Z") }),
  baseOrder("b1000000-0000-4000-8000-000000000011", "TR-2609-00134", "REVIEW", { title: "Модуль управления производственной линией", plannedPickupAt: null, plannedDeliveryAt: null, updatedAt: date("2026-09-23T07:50:00.000Z") }),
];

const baseCargo = (orderId: string, title: string, places: number, weightKg: number) => ({
  id: `c${orderId.slice(1)}`, orderId, supplierId: null, title, category: "Оборудование", description: "Упаковано на паллетах", quantity: places, unit: "мест", places, weightKg, lengthCm: 120, widthCm: 80, heightCm: 95, declaredValue: 850000, specialRequirements: null, createdAt: fixedNow, updatedAt: fixedNow,
});

function previewRoutePoints(order: Order, index: number): RoutePoint[] {
  const warehouseOrder = ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(order.type);
  const pickupCompleted = ["PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "COMPLETED"].includes(order.status);
  const destinationCompleted = warehouseOrder
    ? ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "COMPLETED"].includes(order.status)
    : ["DELIVERED", "COMPLETED"].includes(order.status);
  const points: RoutePoint[] = [];
  if (order.type !== "WAREHOUSE_INTAKE" && order.type !== "WAREHOUSE_SERVICE") points.push({
    id: `d${index}100000-0000-4000-8000-000000000001`, orderId: order.id, sequence: 1, type: "PICKUP",
    label: "Поставщик · МеталлТрейд", addressText: "Москва, ул. Промышленная, 18", contactName: "Иван Петров", contactPhone: "+7 916 220-45-19",
    plannedAt: order.plannedPickupAt, arrivedAt: null, completedAt: pickupCompleted ? order.updatedAt : null,
    notes: null, createdAt: fixedNow, updatedAt: fixedNow,
  });
  points.push({
    id: `d${index}200000-0000-4000-8000-000000000002`, orderId: order.id, sequence: points.length + 1,
    type: warehouseOrder ? "WAREHOUSE" : order.type === "DELIVERY_TRANSPORT_COMPANY" ? "TERMINAL" : "DELIVERY",
    label: warehouseOrder ? "Склад LogSklad · Химки" : order.type === "DELIVERY_TRANSPORT_COMPANY" ? "Терминал перевозчика" : "Объект заказчика",
    addressText: warehouseOrder ? "Московская область, Химки, Вашутинское шоссе, 18" : "Москва, Ленинградское шоссе, 236",
    contactName: warehouseOrder ? null : "Мария Волкова", contactPhone: warehouseOrder ? null : "+7 916 870-33-41",
    plannedAt: order.type === "WAREHOUSE_INTAKE" ? order.plannedPickupAt : order.plannedDeliveryAt, arrivedAt: null, completedAt: destinationCompleted ? order.updatedAt : null,
    notes: null, createdAt: fixedNow, updatedAt: fixedNow,
  });
  return points;
}

function previewWarehouseOperations(order: Order, index: number): { operation: WarehouseOperation; operatorName: string }[] {
  const operationType = order.status === "AT_WAREHOUSE" ? "INTAKE"
    : order.status === "WAREHOUSE_PROCESSING" ? order.type === "WAREHOUSE_SERVICE" ? "LABELING" : "PROCESSING"
      : order.status === "READY_FOR_DELIVERY" ? "READY_FOR_DELIVERY"
        : order.type === "WAREHOUSE_SERVICE" && order.status === "COMPLETED" ? "SERVICE_COMPLETE" : null;
  if (!operationType) return [];
  const resultText = operationType === "INTAKE" ? "Груз принят, количество мест и вес сверены"
    : operationType === "LABELING" ? "Маркировка завершена, фотоотчёт добавлен"
      : operationType === "PROCESSING" ? "Упаковка завершена, груз готов к выдаче"
        : "Обработка завершена, заказ готов к следующему этапу";
  return [{ operation: {
    id: `9000000${index}-0000-4000-8000-000000000001`, orderId: order.id, warehouseId,
    performedByUserId: previewUsers[3].id, operationType, quantity: 2, weightKg: 240,
    resultText, notes: null, performedAt: order.updatedAt, createdAt: order.updatedAt,
  } as WarehouseOperation, operatorName: "Михаил Орлов" }];
}

export const previewOrderDetails: PreviewOrderDetails[] = previewOrders.map((order, index) => ({
  order, companyName: "СтальПром", clientName: "Алексей Морозов",
  cargo: [baseCargo(order.id, order.title || "Груз", index === 0 ? 4 : 2, index === 0 ? 680 : 240) as CargoItem],
  points: previewRoutePoints(order, index),
  history: [
    { id: `e${index}100000-0000-4000-8000-000000000001`, orderId: order.id, fromStatus: null, toStatus: "SUBMITTED", changedByUserId: previewUsers[0].id, note: "Заявка отправлена заказчиком", createdAt: date("2026-09-20T09:00:00.000Z") },
    { id: `e${index}200000-0000-4000-8000-000000000002`, orderId: order.id, fromStatus: order.status === "ISSUE" ? "DELIVERY_IN_PROGRESS" : "REVIEW", toStatus: order.status === "COMPLETED" ? "COMPLETED" : order.status, changedByUserId: previewUsers[1].id, note: order.status === "ISSUE" ? "Согласуем время разгрузки" : "Обновлён этап заявки", createdAt: order.updatedAt },
  ] as StatusHistory[],
  comments: [{ comment: { id: `f${index}100000-0000-4000-8000-000000000001`, orderId: order.id, authorUserId: previewUsers[1].id, scope: "CLIENT_VISIBLE", body: "Приняли заявку в работу. Уточним время передачи груза.", createdAt: date("2026-09-22T08:30:00.000Z"), updatedAt: fixedNow }, authorName: "Анна Смирнова" } as { comment: Comment; authorName: string }],
  operations: previewWarehouseOperations(order, index),
  serviceLines: [{ line: { id: `a000000${index}-0000-4000-8000-000000000001`, orderId: order.id, serviceId: "a4000000-0000-4000-8000-000000000001", quantity: 1, unitPrice: 2200, totalPrice: 2200, isCompleted: order.status === "READY_FOR_DELIVERY" || order.status === "COMPLETED", notes: null, createdAt: fixedNow, updatedAt: fixedNow }, serviceName: "Фотоотчёт", serviceUnit: "услуга" } as { line: OrderService; serviceName: string; serviceUnit: string | null }],
  files: [{ id: `8000000${index}-0000-4000-8000-000000000001`, orderId: order.id, warehouseOperationId: null, uploadedByUserId: previewUsers[0].id, category: "CARGO_PHOTO", visibility: "CLIENT", filename: `${order.number}-cargo.svg`, storagePath: "demo/cargo-placeholder.svg", mimeType: "image/svg+xml", sizeBytes: 38400, createdAt: date("2026-09-22T08:10:00.000Z") } as Attachment],
}));

export const previewCompany: Company = {
  id: companyId, displayName: "СтальПром", legalName: "ООО «СтальПром»", inn: "7712345678",
  email: "logistics@stalprom.example", phone: "+7 495 120-45-67", billingDetails: null,
  isActive: true, createdAt: fixedNow, updatedAt: fixedNow,
};

export const previewDriverProfile: DriverProfile = {
  id: "a5000000-0000-4000-8000-000000000001", userId: previewUsers[2].id,
  licenseNumber: "77 12 345678", notes: "Допуск на складской комплекс", isAvailable: false,
  createdAt: fixedNow, updatedAt: fixedNow,
};

export const previewVehicles: Vehicle[] = [{
  id: "a3000000-0000-4000-8000-000000000001", name: "Газель Next · фургон", vehicleType: "Фургон",
  plateNumber: "А123ВС 799", capacityKg: 1500, volumeM3: 12, isActive: true, createdAt: fixedNow, updatedAt: fixedNow,
}];

export const previewServices: Service[] = [
  { id: "a4000000-0000-4000-8000-000000000001", code: "PHOTO_REPORT", name: "Фотоотчёт", description: "Фото груза при приёмке и выдаче", unit: "услуга", basePrice: 2200, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000002", code: "PACKAGING", name: "Упаковка", description: "Подготовка груза к перевозке или хранению", unit: "операция", basePrice: 2200, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000003", code: "STORAGE", name: "Хранение", description: "Размещение груза на складе", unit: "день", basePrice: 900, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000004", code: "LOADING", name: "Погрузка", description: "Погрузка груза на транспорт", unit: "операция", basePrice: 2800, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000005", code: "UNLOADING", name: "Разгрузка", description: "Разгрузка груза на складе или объекте", unit: "операция", basePrice: 3200, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000006", code: "LABELING", name: "Маркировка", description: "Маркировка грузовых мест", unit: "операция", basePrice: 1500, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000007", code: "CUTTING", name: "Резка / обработка", description: "Обработка груза на складе", unit: "операция", basePrice: 4800, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000008", code: "INSURANCE", name: "Страхование", description: "Страхование груза по согласованию", unit: "услуга", basePrice: 1900, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000009", code: "FORWARDING", name: "Экспедирование", description: "Сопровождение перевозки", unit: "услуга", basePrice: 3600, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
  { id: "a4000000-0000-4000-8000-000000000010", code: "DOCUMENT_DELIVERY", name: "Доставка документов", description: "Доставка и возврат документов", unit: "услуга", basePrice: 850, isActive: true, createdAt: fixedNow, updatedAt: fixedNow },
];

export const previewWarehouses = [{
  id: warehouseId, name: "Склад LogSklad · Химки", addressText: "Московская область, Химки, Вашутинское шоссе, 18",
  phone: "+7 495 120-45-00", workingHours: "Ежедневно, 08:00–20:00", isActive: true, createdAt: fixedNow, updatedAt: fixedNow,
}];

export function getPreviewUser(email?: string) {
  return previewUsers.find((user) => user.email === email) ?? previewUsers[0];
}

export function getPreviewIdentity(role: DemoRole) {
  return demoIdentities.find((identity) => identity.role === role) ?? demoIdentities[0];
}

export function listPreviewOrders(user: User, statuses?: readonly Order["status"][]) {
  const visible = previewOrders.filter((order) => {
    const roleVisible = user.role === "ADMIN" || user.role === "MANAGER"
      || (user.role === "CLIENT" && user.companyId === order.companyId)
      || (user.role === "DRIVER" && user.id === order.driverUserId)
      || (user.role === "WAREHOUSE" && Boolean(order.warehouseId) && ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED", "CANCELLED", "ISSUE"].includes(order.status));
    return roleVisible && (!statuses?.length || statuses.includes(order.status));
  }).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  return visible.map((order) => ({ order, companyName: "СтальПром", clientName: "Алексей Морозов" }));
}

export function getPreviewOrderDetail(orderId: string) {
  return previewOrderDetails.find((item) => item.order.id === orderId) ?? null;
}
