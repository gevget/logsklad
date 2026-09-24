"use server";

import { revalidatePath } from "next/cache";
import { randomUUID } from "node:crypto";
import { and, desc, eq, inArray } from "drizzle-orm";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getDatabase } from "@/db";
import { attachments, auditLogs, cargoItems, comments, companies, driverProfiles, orderServices, orders, routePoints, services, statusHistory, suppliers, users, vehicles, warehouseOperations, warehouses } from "@/db/schema";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { requirePermission } from "@/lib/permissions";
import { transitionOrderStatus, type IntakeAttachmentInput } from "@/features/orders/services/order-status-machine";
import { getSafeStorageExtension, removeFromStorage, uploadToStorage } from "@/features/files/storage";
import { designPreviewEnabled } from "@/lib/design-preview/data";
import { warehouseOperationTypeValues } from "@/config/warehouse-operations";
import { insertNotifications } from "@/features/notifications/service";

const dateField = z.string().max(40).refine((value) => !value || !Number.isNaN(Date.parse(value))).default("");
const pickupDraftSchema = z.object({
  address: z.string().trim().max(500).default(""),
  contactName: z.string().trim().max(180).default(""),
  contactPhone: z.string().trim().max(40).default(""),
  plannedAt: dateField,
  notes: z.string().trim().max(1000).default(""),
});
const cargoDraftSchema = z.object({
  title: z.string().trim().max(240).default(""),
  category: z.string().trim().max(100).default("Оборудование"),
  places: z.coerce.number().int().min(1).max(10000).default(1),
  weightKg: z.coerce.number().min(0).max(1000000).default(0),
  lengthCm: z.coerce.number().min(0).max(100000).default(0),
  widthCm: z.coerce.number().min(0).max(100000).default(0),
  heightCm: z.coerce.number().min(0).max(100000).default(0),
  declaredValue: z.coerce.number().min(0).max(100000000).default(0),
  description: z.string().trim().max(2000).default(""),
});
const orderDraftSchema = z.object({
  companyId: z.string().uuid().nullable().default(null),
  type: z.enum(["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS", "WAREHOUSE_SERVICE"]),
  supplier: z.string().trim().max(220).default(""),
  supplierId: z.string().uuid().nullable().default(null),
  contactName: z.string().trim().max(180).default(""),
  contactPhone: z.string().trim().max(40).default(""),
  pickupAddress: z.string().trim().max(500).default(""),
  pickups: z.array(pickupDraftSchema).max(20).default([]),
  cargoItems: z.array(cargoDraftSchema).max(50).default([]),
  cargoTitle: z.string().trim().max(240).default(""),
  places: z.coerce.number().int().min(1).max(10000).default(1),
  weightKg: z.coerce.number().min(0).max(1000000).default(0),
  declaredValue: z.coerce.number().min(0).max(100000000).default(0),
  description: z.string().trim().max(2000).default(""),
  destinationAddress: z.string().trim().max(500).default(""),
  destinationContactName: z.string().trim().max(180).default(""),
  destinationContactPhone: z.string().trim().max(40).default(""),
  carrierName: z.string().trim().max(180).default(""),
  destinationCity: z.string().trim().max(120).default(""),
  payer: z.enum(["SENDER", "RECIPIENT", "THIRD_PARTY"]).default("SENDER"),
  documentTitle: z.string().trim().max(240).default(""),
  attachmentCategory: z.enum(["CARGO_PHOTO", "DOCUMENT", "INVOICE", "PROOF_OF_DELIVERY", "OTHER"]).default("DOCUMENT"),
  documentSetCount: z.coerce.number().int().min(0).max(1000).default(0),
  returnDocuments: z.boolean().default(false),
  insuranceRequired: z.boolean().default(false),
  serviceIds: z.array(z.string().uuid()).max(20).default([]),
  plannedPickupAt: dateField,
  plannedDeliveryAt: dateField,
});

export async function createOrderAction(formData: FormData) {
  if (designPreviewEnabled) throw new Error("Предпросмотр доступен только для просмотра. Создание заявок отключено.");
  const actor = await getCurrentDemoUser();
  requirePermission(actor, "orders:create");
  if (actor.role === "CLIENT" && !actor.companyId) throw new Error("Учётная запись заказчика не привязана к компании.");
  let rawPayload: unknown;
  try {
    rawPayload = JSON.parse(String(formData.get("payload") ?? "{}"));
  } catch {
    throw new Error("Не удалось прочитать данные заявки. Обновите страницу и попробуйте ещё раз.");
  }
  const parsed = orderDraftSchema.safeParse(rawPayload);
  if (!parsed.success) throw new Error("Проверьте обязательные поля заявки.");
  const input = parsed.data;
  const { db } = getDatabase();
  const targetCompanyId = actor.role === "CLIENT" ? actor.companyId : input.companyId;
  if (!targetCompanyId) throw new Error("Выберите компанию, для которой создаётся заявка.");
  const [targetCompany] = await db.select({ id: companies.id }).from(companies)
    .where(and(eq(companies.id, targetCompanyId), eq(companies.isActive, true))).limit(1);
  if (!targetCompany) throw new Error("Выбранная компания не найдена или отключена.");
  const needsPickup = ["PICKUP_TO_WAREHOUSE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(input.type);
  const pickups = needsPickup ? input.pickups.filter((pickup) => pickup.address) : [];
  if (needsPickup && pickups.length === 0 && input.pickupAddress) pickups.push({
    address: input.pickupAddress, contactName: input.contactName, contactPhone: input.contactPhone,
    plannedAt: input.plannedPickupAt, notes: "",
  });
  const cargoItemsInput = input.cargoItems.filter((cargo) => cargo.title);
  if (cargoItemsInput.length === 0 && input.cargoTitle && input.type !== "COURIER_DOCUMENTS") cargoItemsInput.push({
    title: input.cargoTitle, category: "Оборудование", places: input.places, weightKg: input.weightKg,
    lengthCm: 0, widthCm: 0, heightCm: 0, declaredValue: input.declaredValue, description: "",
  });
  const selectedServices = input.serviceIds.length
    ? await db.select().from(services).where(and(eq(services.isActive, true), inArray(services.id, input.serviceIds)))
    : [];
  if (selectedServices.length !== input.serviceIds.length) throw new Error("Одна из выбранных услуг больше недоступна. Обновите форму и выберите услуги заново.");
  const warehouseServiceCodes = ["STORAGE", "LOADING", "UNLOADING", "PACKAGING", "LABELING", "CUTTING", "PHOTO_REPORT"];
  const serviceCodesForType = input.type === "DELIVERY_TRANSPORT_COMPANY"
    ? ["PACKAGING", "FORWARDING"]
    : ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(input.type) ? warehouseServiceCodes : [];
  if (selectedServices.some((service) => service.code === "INSURANCE" ? !input.insuranceRequired : !serviceCodesForType.includes(service.code))) {
    throw new Error("Выбранная услуга не подходит для этого типа заявки.");
  }
  if (input.insuranceRequired && (input.declaredValue <= 0 || !selectedServices.some((service) => service.code === "INSURANCE"))) {
    throw new Error("Для страхования укажите объявленную стоимость и добавьте услугу страхования.");
  }
  if (input.type === "WAREHOUSE_SERVICE" && !selectedServices.some((service) => warehouseServiceCodes.includes(service.code))) {
    throw new Error("Выберите хотя бы одну складскую операцию.");
  }
  const warehouseServiceNames = selectedServices.filter((service) => service.code !== "INSURANCE").map((service) => service.name);
  const warehouseServiceTitle = warehouseServiceNames.length > 2
    ? `${warehouseServiceNames.slice(0, 2).join(", ")} и ещё ${warehouseServiceNames.length - 2}`
    : warehouseServiceNames.join(", ");
  const orderTitle = input.type === "COURIER_DOCUMENTS" ? input.documentTitle
    : input.type === "WAREHOUSE_SERVICE" ? warehouseServiceTitle.slice(0, 240)
      : cargoItemsInput[0]?.title;
  if (!orderTitle) throw new Error(input.type === "COURIER_DOCUMENTS" ? "Укажите название документов." : "Добавьте хотя бы одну позицию груза.");
  if (needsPickup && pickups.length === 0) throw new Error("Добавьте хотя бы один адрес забора.");
  if (["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "DELIVERY_TRANSPORT_COMPANY"].includes(input.type) && !input.supplier) throw new Error("Укажите отправителя или поставщика.");
  if (input.type === "WAREHOUSE_INTAKE" && !input.plannedDeliveryAt) throw new Error("Укажите дату и время приёмки на складе.");
  if (["DELIVERY_OWN_TRANSPORT", "COURIER_DOCUMENTS"].includes(input.type) && !input.destinationAddress) throw new Error("Укажите адрес доставки.");
  if (input.type === "DELIVERY_TRANSPORT_COMPANY" && (!input.carrierName || !input.destinationCity)) throw new Error("Укажите транспортную компанию и город назначения.");
  if (["DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(input.type)
    && (!input.destinationContactName || !input.destinationContactPhone)) throw new Error("Укажите контакт и телефон получателя.");
  if (input.type === "COURIER_DOCUMENTS" && input.documentSetCount < 1) throw new Error("Укажите количество комплектов документов.");

  const categoryValue = input.attachmentCategory;
  const files = formData.getAll("attachments").filter((value): value is File => value instanceof File && value.size > 0);
  if (files.length > 10) throw new Error("Можно прикрепить не более 10 файлов к одной заявке.");
  if (files.length && !["CARGO_PHOTO", "DOCUMENT", "INVOICE", "OTHER"].includes(categoryValue)) {
    throw new Error("Для вложения к новой заявке выберите документ, счёт, фото груза или другой файл.");
  }

  const intent = formData.get("intent") === "submit" ? "SUBMITTED" : "DRAFT";
  const servicesTotal = selectedServices.reduce((sum, service) => sum + (service.basePrice ?? 0), 0);
  const id = randomUUID();
  const now = new Date();
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow" }).format(now).replaceAll("-", "");
  const orderNumber = `TR-${day}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const uploadedPaths: string[] = [];
  try {
    const uploadedFiles: { id: string; file: File; filename: string; storagePath: string }[] = [];
    for (const file of files) {
      const attachmentId = randomUUID();
      const filename = file.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 220) || "attachment";
      const extension = getSafeStorageExtension(filename);
      const storagePath = await uploadToStorage(`${id}/${attachmentId}.${extension}`, file);
      uploadedPaths.push(storagePath);
      uploadedFiles.push({ id: attachmentId, file, filename, storagePath });
    }

    await db.transaction(async (tx) => {
      const firstPickup = pickups[0];
      let supplierId = input.supplierId;
        if (supplierId) {
        const [existingSupplier] = await tx.select({ id: suppliers.id, name: suppliers.name }).from(suppliers)
          .where(and(eq(suppliers.id, supplierId), eq(suppliers.companyId, targetCompanyId))).limit(1);
        if (!existingSupplier || existingSupplier.name.trim().toLocaleLowerCase("ru-RU") !== input.supplier.trim().toLocaleLowerCase("ru-RU")) {
          throw new Error("Выбранный поставщик не найден в справочнике вашей компании.");
        }
        supplierId = existingSupplier.id;
      } else if (input.supplier) {
        supplierId = randomUUID();
        await tx.insert(suppliers).values({ id: supplierId, companyId: targetCompanyId, name: input.supplier, contactName: firstPickup?.contactName || input.contactName || null, phone: firstPickup?.contactPhone || input.contactPhone || null, addressText: firstPickup?.address || null });
      }
      const [warehouse] = await tx.select().from(warehouses).where(eq(warehouses.isActive, true)).limit(1);
      const warehouseType = ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(input.type);
      const destination = input.type === "DELIVERY_TRANSPORT_COMPANY" ? input.destinationCity : warehouseType ? warehouse?.addressText ?? "Склад LogSklad" : input.destinationAddress;
      const plannedPickupAt = firstPickup?.plannedAt || input.plannedPickupAt;
      await tx.insert(orders).values({
        id, number: orderNumber, companyId: targetCompanyId, createdByUserId: actor.id, managerUserId: actor.role === "MANAGER" ? actor.id : null, type: input.type,
        status: intent, title: orderTitle, description: input.description || null,
        externalCarrierName: input.carrierName || null, externalPayer: input.payer, transportDestinationCity: input.destinationCity || null,
        documentSetCount: input.documentSetCount || null, returnDocuments: input.returnDocuments,
        plannedPickupAt: plannedPickupAt ? new Date(plannedPickupAt) : null,
        plannedDeliveryAt: input.plannedDeliveryAt ? new Date(input.plannedDeliveryAt) : null,
        warehouseId: warehouseType ? warehouse?.id ?? null : null, total: servicesTotal, subtotal: 0, servicesTotal,
        createdAt: now, updatedAt: now,
      });
      if (pickups.length) await tx.insert(routePoints).values(pickups.map((pickup, index) => ({
        id: randomUUID(), orderId: id, sequence: index + 1, type: "PICKUP" as const,
        label: input.supplier || (input.type === "COURIER_DOCUMENTS" ? "Забор документов" : `Забор груза ${index + 1}`),
        addressText: pickup.address, contactName: pickup.contactName || null, contactPhone: pickup.contactPhone || null,
        plannedAt: pickup.plannedAt ? new Date(pickup.plannedAt) : null, notes: pickup.notes || null,
      })));
      if (destination) await tx.insert(routePoints).values({
        id: randomUUID(), orderId: id, sequence: pickups.length + 1,
        type: warehouseType ? "WAREHOUSE" : input.type === "DELIVERY_TRANSPORT_COMPANY" ? "TERMINAL" : "DELIVERY",
        label: warehouseType ? "Склад" : input.type === "DELIVERY_TRANSPORT_COMPANY" ? input.carrierName : "Доставка",
        addressText: destination, contactName: input.destinationContactName || null, contactPhone: input.destinationContactPhone || null,
        plannedAt: input.plannedDeliveryAt ? new Date(input.plannedDeliveryAt) : null,
      });
      if (cargoItemsInput.length) await tx.insert(cargoItems).values(cargoItemsInput.map((cargo) => ({
        id: randomUUID(), orderId: id, supplierId, title: cargo.title, category: cargo.category || null,
        description: cargo.description || null, specialRequirements: cargo.description || null,
        places: cargo.places, quantity: cargo.places, unit: "мест", weightKg: cargo.weightKg || null,
        lengthCm: cargo.lengthCm || null, widthCm: cargo.widthCm || null, heightCm: cargo.heightCm || null,
        declaredValue: cargo.declaredValue || null,
      })));
      if (selectedServices.length) await tx.insert(orderServices).values(selectedServices.map((service) => ({
        id: randomUUID(), orderId: id, serviceId: service.id, quantity: 1, unitPrice: service.basePrice ?? 0,
        totalPrice: service.basePrice ?? 0, isCompleted: false,
      })));
      if (uploadedFiles.length) await tx.insert(attachments).values(uploadedFiles.map(({ id: attachmentId, file, filename, storagePath }) => ({
        id: attachmentId, orderId: id, uploadedByUserId: actor.id, category: categoryValue,
        visibility: "CLIENT" as const, filename, storagePath, mimeType: file.type, sizeBytes: file.size, createdAt: now,
      })));
      await tx.insert(statusHistory).values({ id: randomUUID(), orderId: id, fromStatus: null, toStatus: intent, changedByUserId: actor.id, note: intent === "SUBMITTED" ? "Заявка отправлена клиентом" : "Создан черновик заявки", createdAt: now });
      await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: id, action: intent === "SUBMITTED" ? "ORDER_SUBMITTED" : "ORDER_CREATED", payload: { number: orderNumber, type: input.type, pickupCount: pickups.length, cargoCount: cargoItemsInput.length, attachmentCount: uploadedFiles.length }, createdAt: now });
      if (intent === "SUBMITTED") {
        const managers = await tx.select({ id: users.id }).from(users).where(and(eq(users.role, "MANAGER"), eq(users.isActive, true)));
        const otherManagers = managers.filter(({ id: userId }) => userId !== actor.id);
        if (otherManagers.length) await insertNotifications(tx, otherManagers.map(({ id: userId }) => ({ id: randomUUID(), userId, orderId: id, type: "ORDER_SUBMITTED", title: `Новая заявка ${orderNumber}`, body: `${orderTitle} ожидает проверки.`, isRead: false, createdAt: now })));
      }
    });
  } catch (error) {
    await Promise.allSettled(uploadedPaths.map((path) => removeFromStorage(path)));
    throw error;
  }
  revalidatePath("/client");
  redirect(`/client/orders/${id}`);
}

export async function changeOrderStatusAction(formData: FormData) {
  const orderId = String(formData.get("orderId") ?? "");
  await transitionOrderStatus({
    orderId,
    nextStatus: formData.get("nextStatus"),
    note: formData.get("note") || undefined,
    driverUserId: formData.get("driverUserId") || undefined,
    vehicleId: formData.get("vehicleId") || undefined,
    quantity: formData.get("actualPlaces") ?? undefined,
    weightKg: formData.get("actualWeightKg") ?? undefined,
  });
  revalidatePath("/client");
  revalidatePath("/manager");
  revalidatePath("/driver");
  revalidatePath("/warehouse");
  const rolePath = `/${(await getCurrentDemoUser()).role.toLowerCase()}`;
  revalidatePath(`${rolePath}/orders/${orderId}`);
  if (rolePath === "/driver") revalidatePath(`/driver/jobs/${orderId}`);
}

export async function recordWarehouseIntakeAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  if (actor.role !== "WAREHOUSE" && actor.role !== "ADMIN") throw new Error("Приёмку может подтвердить сотрудник склада.");
  if (designPreviewEnabled) throw new Error("В режиме просмотра дизайна изменения не сохраняются.");
  const inputSchema = z.object({
    orderId: z.string().uuid(),
    actualPlaces: z.coerce.number().int().min(0).max(10000),
    actualWeightKg: z.coerce.number().min(0).max(1000000),
    note: z.string().trim().max(1000).default(""),
  });
  const parsed = inputSchema.safeParse({
    orderId: formData.get("orderId"),
    actualPlaces: formData.get("actualPlaces"),
    actualWeightKg: formData.get("actualWeightKg"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) throw new Error("Проверьте количество мест, вес и комментарий приёмки.");

  const photoValue = formData.get("photo");
  if (photoValue !== null && !(photoValue instanceof File)) throw new Error("Выберите корректное фото приёмки.");
  const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;
  if (photo && !photo.type.startsWith("image/")) throw new Error("Для фото приёмки выберите изображение JPG, PNG или WebP.");
  const { db } = getDatabase();
  const [order] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1);
  if (!order) throw new Error("Заявка не найдена.");
  requirePermission(actor, "warehouse:operate", order);

  let storagePath: string | null = null;
  let intakeAttachment: IntakeAttachmentInput | undefined;
  if (photo) {
    const id = randomUUID();
    const filename = photo.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 220) || "intake-photo";
    const extension = getSafeStorageExtension(filename);
    storagePath = await uploadToStorage(`${order.id}/${id}.${extension}`, photo);
    intakeAttachment = { id, filename, storagePath, mimeType: photo.type, sizeBytes: photo.size };
  }

  try {
    await transitionOrderStatus({
      orderId: parsed.data.orderId, nextStatus: "AT_WAREHOUSE", note: parsed.data.note,
      quantity: parsed.data.actualPlaces, weightKg: parsed.data.actualWeightKg,
    }, intakeAttachment);
  } catch (error) {
    if (storagePath) await removeFromStorage(storagePath).catch(() => undefined);
    throw error;
  }

  revalidatePath("/client");
  revalidatePath("/manager");
  revalidatePath("/warehouse");
  revalidatePath(`/client/orders/${parsed.data.orderId}`);
  revalidatePath(`/manager/orders/${parsed.data.orderId}`);
  revalidatePath(`/warehouse/orders/${parsed.data.orderId}`);
}

export async function assignOutboundDeliveryAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const inputSchema = z.object({
    orderId: z.string().uuid(),
    driverUserId: z.string().uuid(),
    vehicleId: z.string().uuid(),
  });
  const parsed = inputSchema.safeParse({
    orderId: formData.get("orderId"),
    driverUserId: formData.get("driverUserId"),
    vehicleId: formData.get("vehicleId"),
  });
  if (!parsed.success) throw new Error("Выберите водителя и транспорт для исходящей доставки.");
  if (actor.role !== "MANAGER" && actor.role !== "ADMIN") throw new Error("Назначить исходящую доставку может менеджер.");

  const { db } = getDatabase();
  await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for("update").limit(1);
    if (!order) throw new Error("Заявка не найдена.");
    requirePermission(actor, "orders:assign_driver", order);
    if (order.status !== "READY_FOR_DELIVERY" || !order.warehouseId || !["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE"].includes(order.type)) {
      throw new Error("Исходящий рейс можно назначить, когда склад подготовил груз к выдаче.");
    }
    const [release] = await tx.select({ id: warehouseOperations.id }).from(warehouseOperations)
      .where(and(eq(warehouseOperations.orderId, order.id), eq(warehouseOperations.operationType, "RELEASE"))).limit(1);
    if (release) throw new Error("После складской выдачи менять назначение исходящей доставки нельзя.");

    const [driver] = await tx.select({ id: users.id, name: users.name, isAvailable: driverProfiles.isAvailable })
      .from(users).innerJoin(driverProfiles, eq(driverProfiles.userId, users.id))
      .where(and(eq(users.id, parsed.data.driverUserId), eq(users.role, "DRIVER"), eq(users.isActive, true)))
      .for("update").limit(1);
    if (!driver || (driver.id !== order.driverUserId && !driver.isAvailable)) {
      throw new Error("Выберите активного и доступного водителя.");
    }
    const [vehicle] = await tx.select({ id: vehicles.id, name: vehicles.name, plateNumber: vehicles.plateNumber }).from(vehicles)
      .where(and(eq(vehicles.id, parsed.data.vehicleId), eq(vehicles.isActive, true))).limit(1);
    if (!vehicle) throw new Error("Выберите активный автомобиль.");

    const now = new Date();
    const assignmentChanged = order.driverUserId !== driver.id || order.vehicleId !== vehicle.id;
    const vehicleLabel = `${vehicle.name}${vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}`;
    if (order.driverUserId && order.driverUserId !== driver.id) {
      await tx.update(driverProfiles).set({ isAvailable: true, updatedAt: now }).where(eq(driverProfiles.userId, order.driverUserId));
    }
    await tx.update(driverProfiles).set({ isAvailable: false, updatedAt: now }).where(eq(driverProfiles.userId, driver.id));
    await tx.update(orders).set({ driverUserId: driver.id, vehicleId: vehicle.id, updatedAt: now }).where(eq(orders.id, order.id));
    await tx.insert(auditLogs).values({
      id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: order.id,
      action: "OUTBOUND_DELIVERY_ASSIGNED",
      payload: { driverUserId: driver.id, vehicleId: vehicle.id, previousDriverUserId: order.driverUserId, previousVehicleId: order.vehicleId },
      createdAt: now,
    });
    if (assignmentChanged) {
      const notificationRows = [
        ...(order.driverUserId && order.driverUserId !== driver.id ? [{
          id: randomUUID(), userId: order.driverUserId, orderId: order.id, type: "OUTBOUND_ASSIGNMENT_CHANGED",
          title: `Назначение по заявке ${order.number} изменено`,
          body: "Исходящий рейс передан другому водителю.", isRead: false, createdAt: now,
        }] : []),
        {
          id: randomUUID(), userId: driver.id, orderId: order.id,
          type: order.driverUserId === driver.id ? "OUTBOUND_ASSIGNMENT_UPDATED" : "OUTBOUND_DRIVER_ASSIGNED",
          title: order.driverUserId === driver.id ? `Транспорт по заявке ${order.number} обновлён` : `Назначена доставка ${order.number}`,
          body: `Автомобиль: ${vehicleLabel}. Груз готов к выдаче со склада.`, isRead: false, createdAt: now,
        },
      ];
      const warehouseUsers = await tx.select({ id: users.id }).from(users)
        .where(and(eq(users.role, "WAREHOUSE"), eq(users.isActive, true)));
      notificationRows.push(...warehouseUsers.map(({ id: userId }) => ({
        id: randomUUID(), userId, orderId: order.id, type: "OUTBOUND_PLAN_UPDATED",
        title: `Заявка ${order.number} · назначен исходящий рейс`,
        body: `Водитель: ${driver.name}. Автомобиль: ${vehicleLabel}. Можно оформлять выдачу.`, isRead: false, createdAt: now,
      })));
      await insertNotifications(tx, notificationRows);
    }
  });

  revalidatePath("/manager");
  revalidatePath("/driver");
  revalidatePath("/warehouse");
  revalidatePath(`/manager/orders/${parsed.data.orderId}`);
  revalidatePath(`/driver/orders/${parsed.data.orderId}`);
  revalidatePath(`/driver/jobs/${parsed.data.orderId}`);
  revalidatePath(`/warehouse/orders/${parsed.data.orderId}`);
}

export async function addOrderCommentAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const orderId = String(formData.get("orderId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const requestedScope = formData.get("scope") === "INTERNAL" ? "INTERNAL" : "CLIENT_VISIBLE";
  if (!body || body.length > 2000) throw new Error("Комментарий должен содержать от 1 до 2000 символов.");
  const { db } = getDatabase();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Заявка не найдена.");
  requirePermission(actor, "orders:view", order);
  requirePermission(actor, requestedScope === "INTERNAL" ? "comments:create_internal" : "comments:create_client_visible", order);
  const now = new Date();
  const commentId = randomUUID();
  await db.transaction(async (tx) => {
    await tx.insert(comments).values({ id: commentId, orderId, authorUserId: actor.id, scope: requestedScope, body, createdAt: now, updatedAt: now });
    await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: orderId, action: "COMMENT_ADDED", payload: { commentId, scope: requestedScope }, createdAt: now });
  });
  revalidatePath(`/${actor.role.toLowerCase()}/orders/${orderId}`);
  if (actor.role === "DRIVER") revalidatePath(`/driver/jobs/${orderId}`);
}

export async function updateOrderPricingAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const orderId = String(formData.get("orderId") ?? "");
  const pricingSchema = z.object({
    subtotal: z.coerce.number().min(0).max(100000000),
    servicesTotal: z.coerce.number().min(0).max(100000000),
    insuranceTotal: z.coerce.number().min(0).max(100000000),
    discountTotal: z.coerce.number().min(0).max(100000000),
    taxTotal: z.coerce.number().min(0).max(100000000),
  });
  const parsed = pricingSchema.safeParse(Object.fromEntries(["subtotal", "servicesTotal", "insuranceTotal", "discountTotal", "taxTotal"].map((key) => [key, formData.get(key) ?? 0])));
  if (!parsed.success) throw new Error("Проверьте суммы: значение должно быть от 0 до 100 000 000.");
  const { db } = getDatabase();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Заявка не найдена.");
  requirePermission(actor, "orders:edit_price", order);
  const prices = parsed.data;
  const total = Math.max(0, prices.subtotal + prices.servicesTotal + prices.insuranceTotal - prices.discountTotal + prices.taxTotal);
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ ...prices, total, updatedAt: now }).where(eq(orders.id, orderId));
    await tx.insert(auditLogs).values({ id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: orderId, action: "PRICING_UPDATED", payload: { ...prices, total }, createdAt: now });
  });
  revalidatePath(`/${actor.role.toLowerCase()}/orders/${orderId}`);
  revalidatePath("/client/orders");
}

export async function toggleOrderServiceAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const orderId = String(formData.get("orderId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");
  const completed = formData.get("completed") === "true";
  const { db } = getDatabase();
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!order) throw new Error("Заявка не найдена.");
  requirePermission(actor, "warehouse:operate", order);
  if (order.status !== "WAREHOUSE_PROCESSING") throw new Error("Отметить выполнение услуги можно только во время обработки на складе.");
  const [line] = await db.select({ id: orderServices.id }).from(orderServices)
    .where(and(eq(orderServices.orderId, orderId), eq(orderServices.serviceId, serviceId))).limit(1);
  if (!line) throw new Error("Услуга не найдена в этой заявке.");
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(orderServices).set({ isCompleted: completed, updatedAt: now }).where(eq(orderServices.id, line.id));
    await tx.insert(auditLogs).values({
      id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: orderId,
      action: completed ? "ORDER_SERVICE_COMPLETED" : "ORDER_SERVICE_REOPENED",
      payload: { serviceId, completed }, createdAt: now,
    });
  });
  revalidatePath(`/${actor.role.toLowerCase()}/orders/${orderId}`);
}

export async function recordWarehouseReleaseAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const inputSchema = z.object({
    orderId: z.string().uuid(),
    recipientName: z.string().trim().min(1).max(180),
    destinationAddress: z.string().trim().min(1).max(500),
    destinationContactPhone: z.string().trim().max(40).default(""),
    quantity: z.coerce.number().int().min(0).max(1000000),
    note: z.string().trim().max(1000).default(""),
  });
  const parsed = inputSchema.safeParse({
    orderId: formData.get("orderId"),
    recipientName: formData.get("recipientName"),
    destinationAddress: formData.get("destinationAddress"),
    destinationContactPhone: formData.get("destinationContactPhone") ?? "",
    quantity: formData.get("quantity"),
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) throw new Error("Укажите получателя и проверьте количество мест.");
  if (actor.role !== "WAREHOUSE" && actor.role !== "ADMIN") throw new Error("Оформить выдачу может сотрудник склада.");

  const photoValue = formData.get("photo");
  if (photoValue !== null && !(photoValue instanceof File)) throw new Error("Выберите корректный файл подтверждения.");
  const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;
  if (photo && !photo.type.startsWith("image/")) throw new Error("Для подтверждения складской выдачи выберите фото JPG, PNG или WebP.");
  const { db } = getDatabase();
  const [initialOrder] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1);
  if (!initialOrder) throw new Error("Заявка не найдена.");
  requirePermission(actor, "warehouse:operate", initialOrder);
  if (initialOrder.status !== "READY_FOR_DELIVERY" || !initialOrder.warehouseId || !initialOrder.driverUserId || !initialOrder.vehicleId || !["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE"].includes(initialOrder.type)) {
    throw new Error("Сначала менеджер должен назначить водителя и автомобиль для исходящей доставки.");
  }

  const operationId = randomUUID();
  const attachmentId = photo ? randomUUID() : null;
  const originalName = photo?.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 220) || null;
  const extension = originalName ? getSafeStorageExtension(originalName) : "bin";
  let storagePath = photo && attachmentId ? `${parsed.data.orderId}/${attachmentId}.${extension}` : null;
  if (photo && storagePath) storagePath = await uploadToStorage(storagePath, photo);

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for("update").limit(1);
      if (!order) throw new Error("Заявка не найдена.");
      requirePermission(actor, "warehouse:operate", order);
      if (order.status !== "READY_FOR_DELIVERY" || !order.warehouseId || !order.driverUserId || !order.vehicleId || !["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE"].includes(order.type)) {
        throw new Error("Выдачу можно оформить после назначения исходящей доставки.");
      }
      const [existingRelease] = await tx.select({ id: warehouseOperations.id }).from(warehouseOperations)
        .where(and(eq(warehouseOperations.orderId, order.id), eq(warehouseOperations.operationType, "RELEASE"))).limit(1);
      if (existingRelease) throw new Error("Выдача по этой заявке уже оформлена.");

      const [lastRoutePoint] = await tx.select({ sequence: routePoints.sequence }).from(routePoints)
        .where(eq(routePoints.orderId, order.id)).orderBy(desc(routePoints.sequence)).limit(1);
      await tx.insert(routePoints).values({
        id: randomUUID(), orderId: order.id, sequence: (lastRoutePoint?.sequence ?? 0) + 1,
        type: "DELIVERY", label: parsed.data.recipientName, addressText: parsed.data.destinationAddress,
        contactName: parsed.data.recipientName, contactPhone: parsed.data.destinationContactPhone || null,
        plannedAt: order.plannedDeliveryAt, notes: parsed.data.note || null,
      });

      const [[driver], [vehicle], [intake]] = await Promise.all([
        tx.select({ name: users.name, isActive: users.isActive, role: users.role }).from(users).where(eq(users.id, order.driverUserId)).limit(1),
        tx.select({ name: vehicles.name, plateNumber: vehicles.plateNumber, isActive: vehicles.isActive }).from(vehicles).where(eq(vehicles.id, order.vehicleId)).limit(1),
        tx.select({ weightKg: warehouseOperations.weightKg }).from(warehouseOperations)
          .where(and(eq(warehouseOperations.orderId, order.id), eq(warehouseOperations.operationType, "INTAKE")))
          .orderBy(desc(warehouseOperations.performedAt)).limit(1),
      ]);
      if (!driver?.isActive || driver.role !== "DRIVER" || !vehicle?.isActive) throw new Error("Менеджер должен подтвердить активного водителя и автомобиль перед выдачей.");

      const now = new Date();
      const vehicleLabel = `${vehicle.name}${vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}`;
      const notes = [
        `Получатель: ${parsed.data.recipientName}`,
        `Адрес доставки: ${parsed.data.destinationAddress}`,
        parsed.data.destinationContactPhone ? `Телефон получателя: ${parsed.data.destinationContactPhone}` : null,
        `Водитель: ${driver.name}`,
        `Автомобиль: ${vehicleLabel}`,
        parsed.data.note ? `Комментарий: ${parsed.data.note}` : null,
      ].filter(Boolean).join("\n");
      await tx.insert(warehouseOperations).values({
        id: operationId, orderId: order.id, warehouseId: order.warehouseId, performedByUserId: actor.id,
        operationType: "RELEASE", quantity: parsed.data.quantity, weightKg: intake?.weightKg ?? null,
        resultText: `Выдано ${parsed.data.quantity.toLocaleString("ru-RU")} мест · ${parsed.data.recipientName}`,
        notes, performedAt: now, createdAt: now,
      });
      if (photo && attachmentId && storagePath && originalName) {
        await tx.insert(attachments).values({
          id: attachmentId, orderId: order.id, warehouseOperationId: operationId, uploadedByUserId: actor.id,
          category: "WAREHOUSE_PHOTO", visibility: "CLIENT", filename: originalName, storagePath,
          mimeType: photo.type, sizeBytes: photo.size, createdAt: now,
        });
      }
      await tx.insert(auditLogs).values({
        id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: order.id,
        action: "WAREHOUSE_RELEASE_RECORDED",
        payload: { operationId, recipientName: parsed.data.recipientName, destinationAddress: parsed.data.destinationAddress, quantity: parsed.data.quantity, driverUserId: order.driverUserId, vehicleId: order.vehicleId, attachmentId },
        createdAt: now,
      });
      await insertNotifications(tx, [{
        id: randomUUID(), userId: order.driverUserId!, orderId: order.id, type: "OUTBOUND_ROUTE_READY",
        title: `Заявка ${order.number} · адрес доставки добавлен`,
        body: `Адрес доставки: ${parsed.data.destinationAddress}. Выдано ${parsed.data.quantity.toLocaleString("ru-RU")} мест.`,
        isRead: false, createdAt: now,
      }]);
    });
  } catch (error) {
    if (storagePath) await removeFromStorage(storagePath).catch(() => undefined);
    throw error;
  }

  revalidatePath("/warehouse");
  revalidatePath("/manager");
  revalidatePath("/client");
  revalidatePath(`/warehouse/orders/${parsed.data.orderId}`);
  revalidatePath(`/manager/orders/${parsed.data.orderId}`);
  revalidatePath(`/client/orders/${parsed.data.orderId}`);
  revalidatePath(`/driver/jobs/${parsed.data.orderId}`);
}

export async function recordWarehouseOperationAction(formData: FormData) {
  const actor = await getCurrentDemoUser();
  const inputSchema = z.object({
    orderId: z.string().uuid(),
    operationType: z.enum(warehouseOperationTypeValues),
    resultText: z.string().trim().min(1).max(1000),
    quantity: z.coerce.number().int().min(0).max(1000000).optional(),
    weightKg: z.coerce.number().min(0).max(1000000).optional(),
    note: z.string().trim().max(1000).default(""),
  });
  const parsed = inputSchema.safeParse({
    orderId: formData.get("orderId"),
    operationType: formData.get("operationType"),
    resultText: formData.get("resultText"),
    quantity: formData.get("quantity") || undefined,
    weightKg: formData.get("weightKg") || undefined,
    note: formData.get("note") ?? "",
  });
  if (!parsed.success) throw new Error("Выберите операцию и укажите её результат.");
  if (actor.role !== "WAREHOUSE" && actor.role !== "ADMIN") throw new Error("Операции обработки может фиксировать сотрудник склада.");

  const photoValue = formData.get("photo");
  if (photoValue !== null && !(photoValue instanceof File)) throw new Error("Выберите корректный файл операции.");
  const photo = photoValue instanceof File && photoValue.size > 0 ? photoValue : null;
  if (photo && !photo.type.startsWith("image/")) throw new Error("Для фото операции выберите изображение JPG, PNG или WebP.");
  const { db } = getDatabase();
  const [initialOrder] = await db.select().from(orders).where(eq(orders.id, parsed.data.orderId)).limit(1);
  if (!initialOrder) throw new Error("Заявка не найдена.");
  requirePermission(actor, "warehouse:operate", initialOrder);
  if (initialOrder.status !== "WAREHOUSE_PROCESSING" || !initialOrder.warehouseId) {
    throw new Error("Складскую операцию можно записать только во время обработки груза.");
  }

  const operationId = randomUUID();
  const attachmentId = photo ? randomUUID() : null;
  const originalName = photo?.name.replace(/[\\/\u0000-\u001f]/g, "_").slice(0, 220) || null;
  const extension = originalName ? getSafeStorageExtension(originalName) : "bin";
  let storagePath = photo && attachmentId ? `${parsed.data.orderId}/${attachmentId}.${extension}` : null;
  if (photo && storagePath) storagePath = await uploadToStorage(storagePath, photo);

  try {
    await db.transaction(async (tx) => {
      const [order] = await tx.select().from(orders).where(eq(orders.id, parsed.data.orderId)).for("update").limit(1);
      if (!order) throw new Error("Заявка не найдена.");
      requirePermission(actor, "warehouse:operate", order);
      if (order.status !== "WAREHOUSE_PROCESSING" || !order.warehouseId) {
        throw new Error("Складская операция доступна только во время обработки груза.");
      }

      const now = new Date();
      await tx.insert(warehouseOperations).values({
        id: operationId, orderId: order.id, warehouseId: order.warehouseId, performedByUserId: actor.id,
        operationType: parsed.data.operationType, quantity: parsed.data.quantity ?? null, weightKg: parsed.data.weightKg ?? null,
        resultText: parsed.data.resultText, notes: parsed.data.note || null, performedAt: now, createdAt: now,
      });
      if (photo && attachmentId && storagePath && originalName) {
        await tx.insert(attachments).values({
          id: attachmentId, orderId: order.id, warehouseOperationId: operationId, uploadedByUserId: actor.id,
          category: "WAREHOUSE_PHOTO", visibility: "CLIENT", filename: originalName, storagePath,
          mimeType: photo.type, sizeBytes: photo.size, createdAt: now,
        });
      }
      await tx.insert(auditLogs).values({
        id: randomUUID(), actorUserId: actor.id, entityType: "ORDER", entityId: order.id,
        action: "WAREHOUSE_OPERATION_RECORDED",
        payload: { operationId, operationType: parsed.data.operationType, quantity: parsed.data.quantity ?? null, weightKg: parsed.data.weightKg ?? null, attachmentId },
        createdAt: now,
      });
    });
  } catch (error) {
    if (storagePath) await removeFromStorage(storagePath).catch(() => undefined);
    throw error;
  }

  revalidatePath("/warehouse");
  revalidatePath("/manager");
  revalidatePath("/client");
  revalidatePath(`/warehouse/orders/${parsed.data.orderId}`);
  revalidatePath(`/manager/orders/${parsed.data.orderId}`);
  revalidatePath(`/client/orders/${parsed.data.orderId}`);
}
