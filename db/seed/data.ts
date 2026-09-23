import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import { getDatabase } from "../index";
import {
  auditLogs,
  attachments,
  cargoItems,
  comments,
  companies,
  documents,
  driverProfiles,
  notifications,
  orderServices,
  orders,
  orderStatusEnum,
  routePoints,
  services,
  statusHistory,
  suppliers,
  users,
  vehicles,
  warehouseOperations,
  warehouses,
} from "../schema";
import { demoIdentities } from "../../features/demo/identity";

const stableId = (key: string) => {
  const chars = createHash("sha1").update(`logsklad-demo:${key}`).digest("hex").slice(0, 32).split("");
  chars[12] = "5";
  chars[16] = ((parseInt(chars[16], 16) & 0x3) | 0x8).toString(16);
  const value = chars.join("");
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`;
};
type OrderStatus = (typeof orderStatusEnum.enumValues)[number];

const companiesData = [
  { key: "stalprom", displayName: "СтальПром", legalName: "ООО «СтальПром»", inn: "7704123456", email: "logistics@stalprom-demo.ru", phone: "+7 495 120-18-24" },
  { key: "sever", displayName: "Север Инжиниринг", legalName: "ООО «Север Инжиниринг»", inn: "7812456789", email: "supply@sever-eng-demo.ru", phone: "+7 812 309-44-18" },
  { key: "techkomplekt", displayName: "ТехКомплект", legalName: "ООО «ТехКомплект»", inn: "5406789123", email: "orders@techkomplekt-demo.ru", phone: "+7 383 204-17-09" },
  { key: "monolit", displayName: "Монолит Снаб", legalName: "ООО «Монолит Снаб»", inn: "6670345612", email: "delivery@monolit-demo.ru", phone: "+7 343 288-65-12" },
  { key: "promline", displayName: "ПромЛайн", legalName: "ООО «ПромЛайн»", inn: "5258147093", email: "supply@promline-demo.ru", phone: "+7 831 231-92-40" },
] as const;

const userData = [
  ...demoIdentities.map((identity) => ({ key: identity.email, name: identity.name, email: identity.email, role: identity.role, companyIndex: identity.role === "CLIENT" ? 0 : null, phone: "+7 900 555-10-10" })),
  { key: "client:sever", name: "Мария Кузнецова", email: "maria.kuznetsova@sever-eng-demo.ru", role: "CLIENT" as const, companyIndex: 1, phone: "+7 921 410-22-18" },
  { key: "client:tech", name: "Дмитрий Соколов", email: "d.sokolov@techkomplekt-demo.ru", role: "CLIENT" as const, companyIndex: 2, phone: "+7 913 422-19-31" },
  { key: "client:monolit", name: "Ольга Васильева", email: "o.vasilieva@monolit-demo.ru", role: "CLIENT" as const, companyIndex: 3, phone: "+7 912 340-78-29" },
  { key: "client:promline", name: "Артём Власов", email: "artem.vlasov@promline-demo.ru", role: "CLIENT" as const, companyIndex: 4, phone: "+7 831 229-18-63" },
  { key: "manager:oleg", name: "Олег Романов", email: "oleg.romanov@logsklad-demo.ru", role: "MANAGER" as const, companyIndex: null, phone: "+7 916 308-14-57" },
  { key: "driver:elena", name: "Елена Павлова", email: "elena.pavlova@logsklad-demo.ru", role: "DRIVER" as const, companyIndex: null, phone: "+7 916 580-41-02" },
  { key: "driver:pavel", name: "Павел Егоров", email: "pavel.egorov@logsklad-demo.ru", role: "DRIVER" as const, companyIndex: null, phone: "+7 903 280-73-15" },
  { key: "driver:igor", name: "Игорь Беляев", email: "igor.belyaev@logsklad-demo.ru", role: "DRIVER" as const, companyIndex: null, phone: "+7 916 421-63-07" },
  { key: "warehouse:natalia", name: "Наталья Фомина", email: "natalia.fomina@logsklad-demo.ru", role: "WAREHOUSE" as const, companyIndex: null, phone: "+7 495 210-76-31" },
] as const;

const vehicleData = [
  { name: "Газель Next", vehicleType: "Фургон", plateNumber: "А482МР 799", capacityKg: 1500, volumeM3: 9.5 },
  { name: "Ford Transit", vehicleType: "Фургон", plateNumber: "К193ОС 198", capacityKg: 1200, volumeM3: 8.4 },
  { name: "ГАЗон Next", vehicleType: "Тент 5 т", plateNumber: "М751ХТ 750", capacityKg: 5000, volumeM3: 36 },
  { name: "КамАЗ Компас", vehicleType: "Тент 3 т", plateNumber: "О204АУ 799", capacityKg: 3000, volumeM3: 22 },
  { name: "Hyundai Porter", vehicleType: "Бортовой", plateNumber: "Е618КВ 197", capacityKg: 1000, volumeM3: 6.5 },
  { name: "Газель удлинённая", vehicleType: "Длинная база", plateNumber: "Т347НМ 790", capacityKg: 2000, volumeM3: 14 },
  { name: "МАЗ 4371", vehicleType: "Тент 5 т", plateNumber: "У902РС 50", capacityKg: 5000, volumeM3: 34 },
] as const;

const warehouseData = [
  { name: "Основной склад · Химки", addressText: "Московская область, Химки, Вашутинское шоссе, 18", phone: "+7 495 120-33-80", workingHours: "Пн–Сб, 08:00–20:00" },
  { name: "Южный терминал · Подольск", addressText: "Московская область, Подольск, Домодедовское шоссе, 12", phone: "+7 495 120-33-91", workingHours: "Пн–Пт, 08:00–19:00" },
] as const;

const supplierData = [
  ["МеталлТрейд", "Иван Петров", "+7 495 781-44-21", "Москва, ул. Промышленная, 7"],
  ["СеверСталь Комплект", "Виктория Лебедева", "+7 812 309-81-14", "Санкт-Петербург, Пискарёвский пр., 63"],
  ["ИнжСнаб Северо-Запад", "Андрей Климов", "+7 812 600-43-08", "Санкт-Петербург, ул. Маршала Новикова, 28"],
  ["ЭлектроКомплект НСК", "Павел Гордеев", "+7 383 255-06-90", "Новосибирск, ул. Станционная, 38"],
  ["ПромАрматура", "Елена Мартынова", "+7 383 212-47-19", "Новосибирск, Бердское шоссе, 61"],
  ["УралМодуль", "Сергей Фёдоров", "+7 343 345-92-32", "Екатеринбург, ул. Монтажников, 18"],
  ["Монолит Бетон", "Ирина Савина", "+7 343 287-60-35", "Екатеринбург, Елизаветинское шоссе, 4"],
  ["ВолгаПрофиль", "Роман Орехов", "+7 831 217-15-42", "Нижний Новгород, ул. Федосеенко, 57"],
  ["ТехноЛист", "Марина Белова", "+7 831 433-72-04", "Нижний Новгород, Московское шоссе, 85"],
  ["Инструмент-Сервис", "Александр Юдин", "+7 495 728-05-13", "Москва, Рязанский проспект, 10"],
  ["СтройСистемы", "Дарья Соколова", "+7 495 221-88-16", "Москва, ул. Академика Королёва, 13"],
  ["ЭнергоКомплект", "Михаил Зайцев", "+7 812 449-30-12", "Санкт-Петербург, ул. Кубинская, 75"],
] as const;

const serviceData = [
  ["STORAGE", "Хранение", "день", 900], ["LOADING", "Погрузка", "операция", 2800],
  ["UNLOADING", "Разгрузка", "операция", 3200], ["PACKAGING", "Упаковка", "операция", 2200],
  ["LABELING", "Маркировка", "операция", 1500], ["CUTTING", "Резка / обработка", "операция", 4800],
  ["PHOTO_REPORT", "Фотоотчёт", "услуга", 1100], ["INSURANCE", "Страхование", "услуга", 1900],
  ["FORWARDING", "Экспедирование", "услуга", 3600], ["DOCUMENT_DELIVERY", "Доставка документов", "услуга", 850],
] as const;

const orderData = [
  { type: "PICKUP_TO_WAREHOUSE", status: "COMPLETED", companyIndex: 0, title: "Профиль стальной для цеха №2", amount: 46900 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "DELIVERY_IN_PROGRESS", companyIndex: 1, title: "Насосная станция на объект Северный", amount: 28500 },
  { type: "DELIVERY_TRANSPORT_COMPANY", status: "DELIVERED", companyIndex: 2, title: "Шкафы автоматики в Казань", amount: 12800, carrierName: "Деловые Линии · демо", payer: "Получатель", destinationCity: "Казань" },
  { type: "COURIER_DOCUMENTS", status: "COMPLETED", companyIndex: 3, title: "Комплект исполнительной документации", amount: 4500, documentSetCount: 2, returnDocuments: true },
  { type: "WAREHOUSE_SERVICE", status: "WAREHOUSE_PROCESSING", companyIndex: 4, title: "Маркировка электротехнических комплектов", amount: 12500 },
  { type: "WAREHOUSE_INTAKE", status: "AT_WAREHOUSE", companyIndex: 0, title: "Приёмка листового металла", amount: 18600 },
  { type: "PICKUP_TO_WAREHOUSE", status: "READY_FOR_DELIVERY", companyIndex: 1, title: "Кабельные лотки · партия 07", amount: 31700 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "DRIVER_ASSIGNED", companyIndex: 2, title: "Компрессорное оборудование", amount: 83200 },
  { type: "PICKUP_TO_WAREHOUSE", status: "PICKUP_IN_PROGRESS", companyIndex: 3, title: "Труба профильная 40×40", amount: 21800 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "PICKED_UP", companyIndex: 4, title: "Комплект вентиляционных коробов", amount: 26400 },
  { type: "PICKUP_TO_WAREHOUSE", status: "AT_WAREHOUSE", companyIndex: 1, title: "Панели для монтажной бригады", amount: 15400 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "COMPLETED", companyIndex: 4, title: "Доставка приводов на производство", amount: 38500 },
  { type: "WAREHOUSE_SERVICE", status: "COMPLETED", companyIndex: 2, title: "Упаковка комплектующих для отгрузки", amount: 9600 },
  { type: "PICKUP_TO_WAREHOUSE", status: "SUBMITTED", companyIndex: 0, title: "Забор оцинкованного листа", amount: 0 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "SUBMITTED", companyIndex: 2, title: "Доставка щита управления", amount: 0 },
  { type: "DELIVERY_TRANSPORT_COMPANY", status: "REVIEW", companyIndex: 3, title: "Отправка соединительных муфт в Пермь", amount: 0 },
  { type: "PICKUP_TO_WAREHOUSE", status: "REVIEW", companyIndex: 4, title: "Поставка направляющих профилей", amount: 0 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "CONFIRMED", companyIndex: 1, title: "Доставка насосов на площадку №4", amount: 42800 },
  { type: "PICKUP_TO_WAREHOUSE", status: "CONFIRMED", companyIndex: 3, title: "Прокат арматурный · 3,2 т", amount: 36600 },
  { type: "PICKUP_TO_WAREHOUSE", status: "DRIVER_ASSIGNED", companyIndex: 0, title: "Поставка листа для лазерной резки", amount: 19200 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "DRIVER_ASSIGNED", companyIndex: 2, title: "Доставка электродвигателей", amount: 53700 },
  { type: "PICKUP_TO_WAREHOUSE", status: "DRAFT", companyIndex: 4, title: "Крепёж для строительного участка", amount: 0 },
  { type: "COURIER_DOCUMENTS", status: "DRAFT", companyIndex: 1, title: "Возврат подписанного акта", amount: 0, documentSetCount: 1, returnDocuments: true },
  { type: "PICKUP_TO_WAREHOUSE", status: "ISSUE", companyIndex: 0, title: "Несовпадение количества мест при заборе", amount: 22100 },
  { type: "DELIVERY_OWN_TRANSPORT", status: "ON_HOLD", companyIndex: 3, title: "Ожидание пропуска на объект", amount: 31400 },
  { type: "PICKUP_TO_WAREHOUSE", status: "CANCELLED", companyIndex: 2, title: "Отмена забора профиля", amount: 0 },
] as const;

const orderStatusPath = (type: (typeof orderData)[number]["type"]): OrderStatus[] => {
  if (type === "DELIVERY_TRANSPORT_COMPANY") {
    return ["DRAFT", "SUBMITTED", "REVIEW", "CONFIRMED", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED"];
  }
  if (type === "DELIVERY_OWN_TRANSPORT" || type === "COURIER_DOCUMENTS") {
    return ["DRAFT", "SUBMITTED", "REVIEW", "CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED"];
  }
  if (type === "WAREHOUSE_INTAKE" || type === "WAREHOUSE_SERVICE") {
    return ["DRAFT", "SUBMITTED", "REVIEW", "CONFIRMED", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "COMPLETED"];
  }
  return ["DRAFT", "SUBMITTED", "REVIEW", "CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED"];
};

const nameByKey = new Map<string, (typeof userData)[number]>(userData.map((user) => [user.key, user]));
const userId = (key: string) => stableId(`user:${key}`);
const companyId = (index: number) => stableId(`company:${companiesData[index].key}`);
const orderId = (index: number) => stableId(`order:${index + 1}`);
const serviceId = (code: string) => stableId(`service:${code}`);
const warehouseId = (index: number) => stableId(`warehouse:${index + 1}`);
const supplierId = (index: number) => stableId(`supplier:${index + 1}`);
const vehicleId = (index: number) => stableId(`vehicle:${index + 1}`);
const orderNumber = (index: number, year: number) => `TR-${year}-${String(124 + index).padStart(5, "0")}`;
const serviceCodesForOrder = (index: number) => index === 0
  ? ["UNLOADING", "PACKAGING", "LABELING", "PHOTO_REPORT"]
  : [serviceData[index % serviceData.length][0], serviceData[(index + 2) % serviceData.length][0]];

function addDays(date: Date, days: number, hour = 9) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  result.setUTCHours(hour, 0, 0, 0);
  return result;
}

function clientKeyForCompany(index: number) {
  return index === 0 ? "client@demo.local" : index === 1 ? "client:sever" : index === 2 ? "client:tech" : index === 3 ? "client:monolit" : "client:promline";
}

function routeFor(type: (typeof orderData)[number]["type"], index: number) {
  const pickupAddress = [
    "Москва, Варшавское шоссе, 125, корп. 3",
    "Санкт-Петербург, ул. Кубинская, 75",
    "Новосибирск, ул. Станционная, 38",
    "Екатеринбург, ул. Монтажников, 18",
    "Нижний Новгород, Московское шоссе, 85",
  ][index % 5];
  const deliveryAddress = [
    "Москва, ул. Промышленная, 7",
    "Санкт-Петербург, Пискарёвский пр., 63",
    "Новосибирск, Бердское шоссе, 61",
    "Екатеринбург, Елизаветинское шоссе, 4",
    "Нижний Новгород, ул. Федосеенко, 57",
  ][(index + 2) % 5];

  if (type === "PICKUP_TO_WAREHOUSE") {
    const points = [] as { type: "PICKUP" | "WAREHOUSE" | "DELIVERY" | "TERMINAL"; label: string; addressText: string; contactName: string; contactPhone: string }[];
    points.push({ type: "PICKUP", label: "Поставщик · забор 1", addressText: pickupAddress, contactName: supplierData[index % supplierData.length][1], contactPhone: supplierData[index % supplierData.length][2] });
    if (index === 0) points.push({ type: "PICKUP", label: "Поставщик · забор 2", addressText: "Москва, ул. Рябиновая, 41", contactName: "Сергей Лавров", contactPhone: "+7 495 414-20-55" });
    points.push({ type: "WAREHOUSE", label: "Основной склад · Химки", addressText: warehouseData[0].addressText, contactName: "Михаил Орлов", contactPhone: "+7 495 210-76-31" });
    points.push({ type: "DELIVERY", label: "Получатель", addressText: deliveryAddress, contactName: "Илья Савельев", contactPhone: "+7 916 340-18-45" });
    return points;
  }
  if (type === "WAREHOUSE_INTAKE" || type === "WAREHOUSE_SERVICE") {
    return [{ type: "WAREHOUSE" as const, label: "Основной склад · Химки", addressText: warehouseData[index % warehouseData.length].addressText, contactName: "Михаил Орлов", contactPhone: "+7 495 210-76-31" }];
  }
  if (type === "DELIVERY_TRANSPORT_COMPANY") {
    return [
      { type: "PICKUP" as const, label: "Отправитель", addressText: pickupAddress, contactName: "Ирина Белова", contactPhone: "+7 495 214-60-09" },
      { type: "TERMINAL" as const, label: "Терминал перевозчика", addressText: "Москва, терминал Северный, ул. Дорожная, 14", contactName: "Приёмка терминала", contactPhone: "+7 495 600-70-70" },
      { type: "DELIVERY" as const, label: "Получатель", addressText: deliveryAddress, contactName: "Александр Крылов", contactPhone: "+7 921 440-30-17" },
    ];
  }
  return [
    { type: "PICKUP" as const, label: type === "COURIER_DOCUMENTS" ? "Отправитель документов" : "Точка забора", addressText: pickupAddress, contactName: "Виктор Назаров", contactPhone: "+7 495 818-22-45" },
    { type: "DELIVERY" as const, label: type === "COURIER_DOCUMENTS" ? "Получатель документов" : "Получатель", addressText: deliveryAddress, contactName: "Анастасия Миронова", contactPhone: "+7 903 611-42-87" },
  ];
}

export async function seedDemoData(options: { reset?: boolean } = {}) {
  if (process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production" || process.env.DEMO_MODE !== "true") {
    throw new Error("Demo seeding is allowed only when DEMO_MODE=true outside production.");
  }

  const { db } = getDatabase();
  const anchor = process.env.SEED_ANCHOR_DATE ? new Date(`${process.env.SEED_ANCHOR_DATE}T09:00:00.000Z`) : new Date();
  if (Number.isNaN(anchor.getTime())) throw new Error("SEED_ANCHOR_DATE must be a valid YYYY-MM-DD date.");
  const seededOrderNumber = (index: number) => orderNumber(index, anchor.getUTCFullYear());

  const companyRows = companiesData.map((company) => ({
    id: companyId(companiesData.indexOf(company)),
    displayName: company.displayName,
    legalName: company.legalName,
    inn: company.inn,
    email: company.email,
    phone: company.phone,
    billingDetails: { bank: "АО «Демо Банк»", bik: "044525999", account: `40702810${String(companiesData.indexOf(company) + 1).padStart(12, "0")}` },
    isActive: true,
  }));
  const userRows = userData.map((user) => ({
    id: userId(user.key),
    companyId: user.companyIndex === null ? null : companyId(user.companyIndex),
    role: user.role,
    name: user.name,
    email: user.email,
    phone: user.phone,
    isActive: true,
  }));
  const vehicleRows = vehicleData.map((vehicle, index) => ({ id: vehicleId(index), ...vehicle, isActive: true }));
  const warehouseRows = warehouseData.map((warehouse, index) => ({ id: warehouseId(index), ...warehouse, isActive: true }));
  const supplierRows = supplierData.map((supplier, index) => ({
    id: supplierId(index),
    companyId: companyId(index % companiesData.length),
    name: supplier[0],
    contactName: supplier[1],
    phone: supplier[2],
    addressText: supplier[3],
    inn: `${7700000000 + index * 14731}`,
    email: `logistics${index + 1}@${["metaltrade", "severkomplekt", "ing-snab", "elkomplekt", "promarmatura", "uralmodul", "monolitbeton", "volgaprofil", "technolist", "toolservice", "stroysystem", "energokomplekt"][index]}.demo.local`,
  }));
  const serviceRows = serviceData.map(([code, name, unit, basePrice]) => ({ id: serviceId(code), code, name, unit, basePrice, isActive: true }));

  const orderRows = orderData.map((item, index) => {
    const id = orderId(index);
    const clientKey = clientKeyForCompany(item.companyIndex);
    const clientId = userId(clientKey);
    const managerId = userId(index % 2 === 0 ? "manager@demo.local" : "manager:oleg");
    const assigned = item.status !== "DRAFT" && item.status !== "SUBMITTED" && item.status !== "REVIEW" && item.status !== "CONFIRMED" && item.status !== "CANCELLED";
    const hasDriver = assigned && !["DELIVERY_TRANSPORT_COMPANY", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(item.type);
    const hasWarehouse = ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(item.type);
    const vehicleIdx = index % vehicleData.length;
    const currentServices = serviceData.filter((service) => serviceCodesForOrder(index).includes(service[0]));
    const servicesTotal = item.status === "DRAFT" || item.status === "SUBMITTED" || item.status === "REVIEW" ? 0 : currentServices.reduce((sum, service) => sum + service[3], 0);
    const subtotal = item.amount;
    const taxTotal = item.amount > 0 ? Math.round(item.amount * 0.2) : 0;
    const discountTotal = index % 5 === 0 && item.amount > 0 ? 1200 : 0;
    const insuranceTotal = index % 4 === 0 && item.amount > 0 ? 900 : 0;
    const total = subtotal + servicesTotal + taxTotal + insuranceTotal - discountTotal;
    const completedDaysAgo = item.status === "COMPLETED" ? 2 + index * 2 : null;
    return {
      id,
      number: seededOrderNumber(index),
      companyId: companyId(item.companyIndex),
      createdByUserId: clientId,
      managerUserId: managerId,
      driverUserId: hasDriver ? userId(["driver@demo.local", "driver:elena", "driver:pavel", "driver:igor"][index % 4]) : null,
      vehicleId: hasDriver ? vehicleId(vehicleIdx) : null,
      warehouseId: hasWarehouse ? warehouseId(index % warehouseData.length) : null,
      type: item.type,
      status: item.status,
      title: item.title,
      description: item.status === "ISSUE" ? "При сверке на точке забора обнаружено расхождение по количеству мест." : item.status === "ON_HOLD" ? "Ожидается пропуск для въезда на объект получателя." : null,
      clientReference: `ЗК-${String(4100 + index).padStart(5, "0")}`,
      externalCarrierName: "carrierName" in item ? item.carrierName : null,
      externalPayer: "payer" in item ? item.payer : null,
      transportDestinationCity: "destinationCity" in item ? item.destinationCity : null,
      documentSetCount: "documentSetCount" in item ? item.documentSetCount : null,
      returnDocuments: "returnDocuments" in item ? item.returnDocuments : false,
      subtotal,
      servicesTotal,
      insuranceTotal,
      discountTotal,
      taxTotal,
      total,
      currency: "RUB",
      plannedPickupAt: addDays(anchor, (index % 5) - 2, 9 + (index % 7)),
      plannedDeliveryAt: addDays(anchor, (index % 5) - 1, 14 + (index % 4)),
      completedAt: completedDaysAgo === null ? null : addDays(anchor, -completedDaysAgo, 17),
      createdAt: addDays(anchor, -Math.min(index + 1, 24), 8 + (index % 8)),
      updatedAt: addDays(anchor, -(index % 3), 11 + (index % 7)),
    };
  });

  const cargoRows = orderData.flatMap((item, index) => {
    const count = index % 3 === 0 || index === 0 ? 2 : 1;
    return Array.from({ length: count }, (_, itemIndex) => {
      const isDocument = item.type === "COURIER_DOCUMENTS";
      return {
        id: stableId(`cargo:${index + 1}:${itemIndex + 1}`),
        orderId: orderId(index),
        supplierId: supplierId((index + itemIndex) % supplierData.length),
        title: isDocument ? (itemIndex === 0 ? "Комплект документов" : "Подписанный экземпляр") : cargoTitle(index, itemIndex),
        category: isDocument ? "Документы" : ["Металлопрокат", "Оборудование", "Электрика", "Стройматериалы", "Комплектующие"][index % 5],
        description: isDocument ? "Папка формата А4, защита от влаги." : "Промышленный груз, подготовлен к перевозке.",
        quantity: itemIndex === 0 ? 1 : 2,
        unit: isDocument ? "комплект" : "партия",
        places: isDocument ? 1 : 2 + ((index + itemIndex) % 7),
        weightKg: isDocument ? 1.5 : 140 + ((index * 83 + itemIndex * 61) % 1800),
        lengthCm: isDocument ? 35 : 80 + ((index * 13) % 240),
        widthCm: isDocument ? 27 : 40 + ((index * 17) % 160),
        heightCm: isDocument ? 4 : 35 + ((index * 11) % 125),
        declaredValue: isDocument ? 5000 : 25000 + ((index * 7113) % 480000),
        specialRequirements: index % 6 === 0 && !isDocument ? "Не кантовать. Защитить углы упаковкой." : null,
      };
    });
  });

  const routeRows = orderData.flatMap((item, index) => routeFor(item.type, index).map((point, pointIndex) => ({
    id: stableId(`route:${index + 1}:${pointIndex + 1}`),
    orderId: orderId(index),
    sequence: pointIndex + 1,
    type: point.type,
    label: point.label,
    addressText: point.addressText,
    contactName: point.contactName,
    contactPhone: point.contactPhone,
    plannedAt: addDays(anchor, (index % 4) - 1, 8 + pointIndex * 3),
    arrivedAt: ["PICKED_UP", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", "DELIVERED", "COMPLETED"].includes(item.status) ? addDays(anchor, -1, 10 + pointIndex) : null,
    completedAt: ["DELIVERED", "COMPLETED"].includes(item.status) ? addDays(anchor, -1, 13 + pointIndex) : null,
    notes: point.type === "TERMINAL" ? "При передаче запросить квитанцию перевозчика." : null,
  })));

  const orderServiceRows = orderData.flatMap((item, index) => {
    const codes = serviceCodesForOrder(index);
    return codes.map((code, serviceIndex) => {
      const unitPrice = item.status === "DRAFT" || item.status === "SUBMITTED" || item.status === "REVIEW" ? 0 : serviceData.find((service) => service[0] === code)?.[3] ?? 0;
      const quantity = code === "STORAGE" ? 2 + index % 5 : 1;
      return {
        id: stableId(`order-service:${index + 1}:${serviceIndex + 1}`),
        orderId: orderId(index),
        serviceId: serviceId(code),
        quantity,
        unitPrice,
        totalPrice: unitPrice * quantity,
        isCompleted: ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERED", "COMPLETED"].includes(item.status) && serviceIndex === 0,
        notes: null,
      };
    });
  });

  const orderEvents = orderData.flatMap((item, index) => {
    const basePath = orderStatusPath(item.type);
    const currentIndex = basePath.indexOf(item.status);
    let path = currentIndex >= 0 ? basePath.slice(0, currentIndex + 1) : [...basePath.slice(0, item.status === "CANCELLED" ? 2 : 4), item.status];
    if (item.status === "ISSUE") path = [...basePath.slice(0, Math.max(2, basePath.indexOf("PICKED_UP"))), "ISSUE"];
    if (item.status === "ON_HOLD") path = [...basePath.slice(0, basePath.indexOf("DRIVER_ASSIGNED") + 1), "ON_HOLD"];
    return path.map((status, statusIndex) => {
      const previousStatus = statusIndex > 0 ? path[statusIndex - 1] : null;
      const actorKey = status === "DRAFT" || status === "SUBMITTED" ? clientKeyForCompany(item.companyIndex)
        : status === "PICKUP_IN_PROGRESS" || status === "PICKED_UP" || status === "DELIVERY_IN_PROGRESS" || status === "DELIVERED" ? ["driver@demo.local", "driver:elena", "driver:pavel", "driver:igor"][index % 4]
          : status === "AT_WAREHOUSE" || status === "WAREHOUSE_PROCESSING" || status === "READY_FOR_DELIVERY" ? (index % 2 === 0 ? "warehouse@demo.local" : "warehouse:natalia")
            : index % 2 === 0 ? "manager@demo.local" : "manager:oleg";
      const actor = nameByKey.get(actorKey);
      return {
        id: stableId(`status-history:${index + 1}:${statusIndex + 1}`),
        orderId: orderId(index),
        fromStatus: previousStatus,
        toStatus: status,
        changedByUserId: userId(actorKey),
        note: status === "ISSUE" ? "Расхождение по количеству мест: ожидалось 5, принято 4." : status === "ON_HOLD" ? "Ожидается пропуск на территорию объекта." : status === "COMPLETED" ? "Заявка закрыта после подтверждения доставки." : null,
        createdAt: addDays(anchor, -Math.max(1, path.length - statusIndex), 8 + ((index + statusIndex) % 10)),
        actorName: actor?.name ?? "Оператор",
      };
    });
  });

  const orderHistoryRows = orderEvents.map((event) => ({
    id: event.id,
    orderId: event.orderId,
    fromStatus: event.fromStatus,
    toStatus: event.toStatus,
    changedByUserId: event.changedByUserId,
    note: event.note,
    createdAt: event.createdAt,
  }));
  const auditRows = orderEvents.map((event) => ({
    id: stableId(`audit:${event.id}`),
    actorUserId: event.changedByUserId,
    entityType: "ORDER",
    entityId: event.orderId,
    action: `STATUS_${event.toStatus}`,
    payload: { from: event.fromStatus, to: event.toStatus, summary: `${event.actorName} изменил статус заявки` },
    createdAt: event.createdAt,
  }));

  const warehouseCandidateIndexes = orderData.flatMap((item, index) => ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(item.type) && index !== 6 ? [index] : []).slice(0, 16);
  const operationTypes = ["INTAKE", "UNLOADING", "WEIGHING", "PACKING", "LABELING", "STORAGE"];
  const operationRows = warehouseCandidateIndexes.flatMap((orderIndex, operationIndex) => {
    const count = operationIndex < 5 ? 2 : 1;
    return Array.from({ length: count }, (_, step) => {
      const operationType = operationTypes[(operationIndex + step) % operationTypes.length];
      const operatorKey = operationIndex % 2 === 0 ? "warehouse@demo.local" : "warehouse:natalia";
      return {
        id: stableId(`warehouse-operation:${orderIndex + 1}:${step + 1}`),
        orderId: orderId(orderIndex),
        warehouseId: warehouseId(orderIndex % warehouseData.length),
        performedByUserId: userId(operatorKey),
        operationType,
        quantity: operationType === "INTAKE" ? 3 + (orderIndex % 5) : null,
        weightKg: operationType === "WEIGHING" ? 550 + (orderIndex * 87) % 1900 : null,
        resultText: operationType === "INTAKE" ? "Груз принят, маркировка сверена." : operationType === "WEIGHING" ? "Фактический вес зафиксирован." : "Операция выполнена без замечаний.",
        notes: orderIndex === 23 ? "Принято 4 места вместо ожидаемых 5." : null,
        performedAt: addDays(anchor, -Math.max(1, operationIndex + 1), 9 + step * 3),
        createdAt: addDays(anchor, -Math.max(1, operationIndex + 1), 9 + step * 3),
      };
    });
  });

  const fileTypes = [
    { category: "CARGO_PHOTO", type: "supplier_document", title: "Фото груза при заборе", path: "demo/cargo-placeholder.svg", mime: "image/svg+xml", size: 38400, visibility: "CLIENT" },
    { category: "WAREHOUSE_PHOTO", type: "waybill", title: "Фото приёмки на складе", path: "demo/warehouse-placeholder.svg", mime: "image/svg+xml", size: 42100, visibility: "CLIENT" },
    { category: "DOCUMENT", type: "supplier_document", title: "Товарная накладная поставщика", path: "demo/waybill-placeholder.pdf", mime: "application/pdf", size: 2048, visibility: "CLIENT" },
    { category: "INVOICE", type: "invoice", title: "Счёт на оплату", path: "demo/waybill-placeholder.pdf", mime: "application/pdf", size: 2048, visibility: "CLIENT" },
    { category: "PROOF_OF_DELIVERY", type: "proof_of_delivery", title: "Подтверждение доставки", path: "demo/waybill-placeholder.pdf", mime: "application/pdf", size: 2048, visibility: "CLIENT" },
  ] as const;
  const attachmentOrderIndexes = Array.from({ length: 24 }, (_, index) => index === 0 ? 0 : (index * 7) % orderData.length);
  const attachmentRows = attachmentOrderIndexes.map((orderIndex, fileIndex) => {
    const file = fileTypes[fileIndex % fileTypes.length];
    const categoryByFile = file.category;
    const operatorKey = categoryByFile === "WAREHOUSE_PHOTO" ? "warehouse@demo.local" : categoryByFile === "PROOF_OF_DELIVERY" ? ["driver@demo.local", "driver:elena", "driver:pavel", "driver:igor"][orderIndex % 4] : clientKeyForCompany(orderData[orderIndex].companyIndex);
    const operation = operationRows.find((row) => row.orderId === orderId(orderIndex));
    return {
      id: stableId(`attachment:${fileIndex + 1}`),
      orderId: orderId(orderIndex),
      warehouseOperationId: categoryByFile === "WAREHOUSE_PHOTO" ? operation?.id ?? null : null,
      uploadedByUserId: userId(operatorKey),
      category: file.category,
      visibility: file.visibility,
      filename: `${seededOrderNumber(orderIndex)}-${String(fileIndex + 1).padStart(2, "0")}.${file.mime === "application/pdf" ? "pdf" : "svg"}`,
      storagePath: file.path,
      mimeType: file.mime,
      sizeBytes: file.size,
      createdAt: addDays(anchor, -Math.max(0, fileIndex % 25), 10 + fileIndex % 8),
    };
  });

  const documentRows = attachmentRows.filter((row) => ["DOCUMENT", "INVOICE", "PROOF_OF_DELIVERY"].includes(row.category)).map((attachment, documentIndex) => {
    const file = fileTypes.find((item) => item.category === attachment.category);
    return {
      id: stableId(`document:${documentIndex + 1}`),
      orderId: attachment.orderId,
      attachmentId: attachment.id,
      documentType: file?.type ?? "other",
      documentNumber: `ДМ-${String(2026).slice(2)}-${String(documentIndex + 81).padStart(4, "0")}`,
      issuedAt: attachment.createdAt,
      title: file?.title ?? "Документ к заявке",
      notes: "Демо-образец, не является юридическим документом.",
      createdAt: attachment.createdAt,
      updatedAt: attachment.createdAt,
    };
  });

  const commentRows = orderData.flatMap((item, index) => {
    if (index >= orderData.length) return [];
    const client = index % 3 === 0;
    const authorKey = client ? clientKeyForCompany(item.companyIndex) : index % 2 === 0 ? "manager@demo.local" : "manager:oleg";
    return [
      { id: stableId(`comment:${index + 1}:public`), orderId: orderId(index), authorUserId: userId(authorKey), scope: "CLIENT_VISIBLE" as const, body: index === 0 ? "Поставщик подтвердил готовность двух партий к забору." : "Данные по заявке обновлены. Следующий этап отражён в истории перевозки.", createdAt: addDays(anchor, -Math.max(0, index % 14), 12) },
      ...(index % 2 === 0 || index === 23 ? [{ id: stableId(`comment:${index + 1}:internal`), orderId: orderId(index), authorUserId: userId(index % 4 === 0 ? "manager@demo.local" : "manager:oleg"), scope: "INTERNAL" as const, body: index === 23 ? "Проверить расхождение: поставщик подтвердил пять мест, при заборе обнаружено четыре." : "Согласовать окно приёмки со складом и подтвердить контакт на точке.", createdAt: addDays(anchor, -Math.max(0, index % 9), 13) }] : []),
    ];
  });

  const notificationRows = orderData.flatMap((item, index) => {
    const stateText = statusLabel(item.status);
    const recipients = [userId(clientKeyForCompany(item.companyIndex)), userId(index % 2 === 0 ? "manager@demo.local" : "manager:oleg")];
    const driverKey = ["driver@demo.local", "driver:elena", "driver:pavel", "driver:igor"][index % 4];
    if (item.status === "DRIVER_ASSIGNED" || item.status === "PICKUP_IN_PROGRESS" || item.status === "PICKED_UP" || item.status === "DELIVERY_IN_PROGRESS") recipients.push(userId(driverKey));
    return recipients.map((recipientId, recipientIndex) => ({
      id: stableId(`notification:${index + 1}:${recipientIndex + 1}`),
      userId: recipientId,
      orderId: orderId(index),
      type: item.status === "ISSUE" ? "ORDER_ISSUE" : item.status === "DRIVER_ASSIGNED" ? "DRIVER_ASSIGNED" : "ORDER_STATUS",
      title: item.status === "DRIVER_ASSIGNED" && recipientIndex > 0 ? `Назначен рейс ${seededOrderNumber(index)}` : `Заявка ${seededOrderNumber(index)} · ${stateText}`,
      body: item.status === "ISSUE" ? "Расхождение по грузу требует внимания менеджера." : `${item.title}. Статус заявки обновлён.`,
      isRead: index % 4 !== 0,
      createdAt: addDays(anchor, -(index % 7), 15),
      readAt: index % 4 !== 0 ? addDays(anchor, -(index % 7), 15) : null,
    }));
  });

  await db.transaction(async (tx) => {
    if (options.reset) {
      await tx.execute(sql.raw("TRUNCATE TABLE audit_logs, notifications, status_history, comments, documents, attachments, warehouse_operations, order_services, route_points, cargo_items, orders, suppliers, services, warehouses, vehicles, driver_profiles, users, companies RESTART IDENTITY CASCADE"));
    }
    await tx.insert(companies).values(companyRows).onConflictDoNothing();
    await tx.insert(users).values(userRows).onConflictDoNothing();
    await tx.insert(driverProfiles).values(userData.filter((user) => user.role === "DRIVER").map((driver, index) => ({
      id: stableId(`driver-profile:${driver.key}`), userId: userId(driver.key), licenseNumber: `77 ${String(102340 + index * 137).slice(0, 6)}`, isAvailable: index !== 1, notes: index === 1 ? "На плановом обслуживании до конца смены." : null,
    }))).onConflictDoNothing();
    await tx.insert(vehicles).values(vehicleRows).onConflictDoNothing();
    await tx.insert(warehouses).values(warehouseRows).onConflictDoNothing();
    await tx.insert(suppliers).values(supplierRows).onConflictDoNothing();
    await tx.insert(services).values(serviceRows).onConflictDoNothing();
    await tx.insert(orders).values(orderRows).onConflictDoNothing();
    await tx.insert(cargoItems).values(cargoRows).onConflictDoNothing();
    await tx.insert(routePoints).values(routeRows).onConflictDoNothing();
    await tx.insert(orderServices).values(orderServiceRows).onConflictDoNothing();
    await tx.insert(warehouseOperations).values(operationRows).onConflictDoNothing();
    await tx.insert(attachments).values(attachmentRows).onConflictDoNothing();
    await tx.insert(documents).values(documentRows).onConflictDoNothing();
    await tx.insert(comments).values(commentRows).onConflictDoNothing();
    await tx.insert(statusHistory).values(orderHistoryRows).onConflictDoNothing();
    await tx.insert(notifications).values(notificationRows).onConflictDoNothing();
    await tx.insert(auditLogs).values(auditRows).onConflictDoNothing();
  });

  return {
    companies: companyRows.length,
    users: userRows.length,
    vehicles: vehicleRows.length,
    warehouses: warehouseRows.length,
    suppliers: supplierRows.length,
    services: serviceRows.length,
    orders: orderRows.length,
    cargoItems: cargoRows.length,
    routePoints: routeRows.length,
    warehouseOperations: operationRows.length,
    attachments: attachmentRows.length,
    documents: documentRows.length,
    statusHistory: orderHistoryRows.length,
    comments: commentRows.length,
    notifications: notificationRows.length,
  };
}

function cargoTitle(orderIndex: number, itemIndex: number) {
  const items = ["Лист стальной 3 мм", "Труба профильная 40×40", "Насосное оборудование", "Щит автоматики", "Кабельные лотки", "Арматура А500С", "Электродвигатель 11 кВт", "Панель вентиляционная", "Комплект крепежа М12", "Направляющий профиль"];
  return `${items[(orderIndex + itemIndex * 3) % items.length]}${itemIndex === 1 ? " · комплект" : ""}`;
}

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    DRAFT: "Черновик", SUBMITTED: "Отправлена", REVIEW: "На проверке", CONFIRMED: "Согласована",
    DRIVER_ASSIGNED: "Водитель назначен", PICKUP_IN_PROGRESS: "Водитель едет на забор", PICKED_UP: "Груз забран",
    AT_WAREHOUSE: "Принят на склад", WAREHOUSE_PROCESSING: "Обработка на складе", READY_FOR_DELIVERY: "Готов к отправке",
    DELIVERY_IN_PROGRESS: "В доставке", DELIVERED: "Доставлен", COMPLETED: "Завершена", ON_HOLD: "Приостановлена",
    ISSUE: "Требует внимания", CANCELLED: "Отменена",
  };
  return labels[status] ?? status;
}
