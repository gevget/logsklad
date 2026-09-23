"use client";

import { useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Boxes, Building2, Check, FileText, MapPin, Plus, Trash2, Truck } from "lucide-react";
import { createOrderAction } from "@/features/orders/actions";
import type { ClientSupplierOption, getActiveServices, OrderCreationCompanyOption } from "@/features/orders/queries";

type OrderType = "PICKUP_TO_WAREHOUSE" | "WAREHOUSE_INTAKE" | "DELIVERY_OWN_TRANSPORT" | "DELIVERY_TRANSPORT_COMPANY" | "COURIER_DOCUMENTS" | "WAREHOUSE_SERVICE";
type StepId = "company" | "type" | "sender" | "pickup" | "cargo" | "services" | "delivery" | "documents" | "review";
type PickupDraft = { id: string; address: string; contactName: string; contactPhone: string; plannedAt: string; notes: string };
type CargoDraft = { id: string; title: string; category: string; places: string; weightKg: string; lengthCm: string; widthCm: string; heightCm: string; declaredValue: string; description: string };
type Draft = {
  type: OrderType;
  targetCompanyId: string | null;
  supplier: string;
  supplierId: string | null;
  contactName: string;
  contactPhone: string;
  pickups: PickupDraft[];
  cargoItems: CargoDraft[];
  description: string;
  destinationAddress: string;
  destinationCity: string;
  destinationContactName: string;
  destinationContactPhone: string;
  carrierName: string;
  payer: string;
  documentTitle: string;
  attachmentCategory: string;
  documentSetCount: string;
  returnDocuments: boolean;
  insuranceRequired: boolean;
  serviceIds: string[];
  plannedDeliveryAt: string;
};

type ServiceOption = Awaited<ReturnType<typeof getActiveServices>>[number];

const types: { value: OrderType; title: string; description: string; icon: typeof Boxes }[] = [
  { value: "PICKUP_TO_WAREHOUSE", title: "Забрать и привезти на склад", description: "Заберём груз у поставщика и доставим на наш склад", icon: Boxes },
  { value: "WAREHOUSE_INTAKE", title: "Принять на склад", description: "Поставщик самостоятельно доставит груз на склад", icon: Building2 },
  { value: "DELIVERY_OWN_TRANSPORT", title: "Доставка нашим транспортом", description: "Заберём груз и доставим по адресу", icon: Truck },
  { value: "DELIVERY_TRANSPORT_COMPANY", title: "Транспортная компания", description: "Передадим груз перевозчику для отправки в другой город", icon: Truck },
  { value: "COURIER_DOCUMENTS", title: "Курьер и документы", description: "Передадим или заберём документы", icon: FileText },
  { value: "WAREHOUSE_SERVICE", title: "Услуги склада", description: "Приёмка, упаковка, маркировка и другие операции", icon: Building2 },
];

const stepLabels: Record<StepId, string> = {
  company: "Компания", type: "Тип заявки", sender: "Отправитель", pickup: "Забор", cargo: "Груз", services: "Склад и услуги", delivery: "Доставка", documents: "Документы", review: "Проверка",
};

const createPickup = (id: string): PickupDraft => ({ id, address: "", contactName: "", contactPhone: "", plannedAt: "", notes: "" });
const createCargo = (id: string): CargoDraft => ({ id, title: "", category: "Оборудование", places: "1", weightKg: "", lengthCm: "", widthCm: "", heightCm: "", declaredValue: "", description: "" });

function stepsFor(type: OrderType, targetCompanyRequired: boolean): StepId[] {
  const steps: StepId[] = ["type"];
  if (targetCompanyRequired) steps.unshift("company");
  if (!["DELIVERY_OWN_TRANSPORT", "COURIER_DOCUMENTS", "WAREHOUSE_SERVICE"].includes(type)) steps.push("sender");
  if (["PICKUP_TO_WAREHOUSE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(type)) steps.push("pickup");
  if (type !== "COURIER_DOCUMENTS") steps.push("cargo");
  if (["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(type)) steps.push("services");
  if (type === "DELIVERY_TRANSPORT_COMPANY") steps.push("services");
  if (["DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(type)) steps.push("delivery");
  steps.push("documents", "review");
  return steps;
}

export function OrderWizard({ services, suppliers, companyOptions = [], targetCompanyRequired = false, preview = false }: { services: ServiceOption[]; suppliers: ClientSupplierOption[]; companyOptions?: OrderCreationCompanyOption[]; targetCompanyRequired?: boolean; preview?: boolean }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [draft, setDraft] = useState<Draft>(() => ({
    type: "PICKUP_TO_WAREHOUSE", targetCompanyId: null, supplier: "", supplierId: null, contactName: "", contactPhone: "", pickups: [createPickup("pickup-initial")], cargoItems: [createCargo("cargo-initial")],
    description: "", destinationAddress: "", destinationCity: "", destinationContactName: "", destinationContactPhone: "",
    carrierName: "", payer: "SENDER", documentTitle: "", attachmentCategory: "DOCUMENT", documentSetCount: "1", returnDocuments: false,
    insuranceRequired: false, serviceIds: [], plannedDeliveryAt: "",
  }));
  const [activeStep, setActiveStep] = useState<StepId>(() => targetCompanyRequired ? "company" : "type");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const [stepError, setStepError] = useState("");
  const steps = stepsFor(draft.type, targetCompanyRequired);
  const stepIndex = Math.max(0, steps.indexOf(activeStep));
  const visibleStep = steps[stepIndex];
  const insuranceService = services.find((service) => service.code === "INSURANCE" || service.name.toLowerCase().includes("страх"));
  const serviceCodesForType = draft.type === "DELIVERY_TRANSPORT_COMPANY"
    ? ["PACKAGING", "FORWARDING"]
    : ["STORAGE", "LOADING", "UNLOADING", "PACKAGING", "LABELING", "CUTTING", "PHOTO_REPORT"];
  const selectableServices = services.filter((service) => service.id !== insuranceService?.id && serviceCodesForType.includes(service.code));
  const selectedServiceRows = services.filter((service) => draft.serviceIds.includes(service.id));
  const servicesTotal = selectedServiceRows.reduce((sum, service) => sum + (service.basePrice ?? 0), 0);
  const typeLabel = types.find((item) => item.value === draft.type)?.title ?? "Заявка";
  const warehouseName = "Склад LogSklad · Химки";
  const warehouseAddress = "Московская область, Химки, Вашутинское шоссе, 18";
  const pickupPoints = draft.pickups.filter((pickup) => pickup.address.trim());
  const usesWarehouse = ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(draft.type);
  const destinationSummary = draft.destinationCity || draft.destinationAddress || (usesWarehouse ? warehouseName : "");
  const routeSummary = [
    ...pickupPoints.map((pickup) => pickup.address),
    ...(draft.type === "WAREHOUSE_INTAKE" && !pickupPoints.length && draft.supplier ? [draft.supplier] : []),
    ...(destinationSummary ? [destinationSummary] : []),
  ];
  const cargoSummary = draft.cargoItems.filter((cargo) => cargo.title.trim()).map((cargo) => {
    const details = [`${cargo.places || 1} мест`];
    if (cargo.weightKg) details.push(`${cargo.weightKg} кг`);
    if (cargo.declaredValue) details.push(`оценка ${formatMoney(Number(cargo.declaredValue))}`);
    return `${cargo.title} · ${details.join(" · ")}`;
  });
  const contactSummary = [
    draft.contactName || draft.contactPhone ? `Отправитель: ${[draft.contactName, draft.contactPhone].filter(Boolean).join(", ")}` : "",
    ...pickupPoints.map((pickup) => pickup.contactName || pickup.contactPhone ? `Забор: ${[pickup.contactName, pickup.contactPhone].filter(Boolean).join(", ")}` : ""),
    draft.destinationContactName || draft.destinationContactPhone ? `Получатель: ${[draft.destinationContactName, draft.destinationContactPhone].filter(Boolean).join(", ")}` : "",
  ].filter(Boolean);
  const scheduleSummary = [
    ...pickupPoints.filter((pickup) => pickup.plannedAt).map((pickup) => `Забор: ${formatDateTime(pickup.plannedAt)}`),
    draft.plannedDeliveryAt ? `${draft.type === "WAREHOUSE_INTAKE" ? "Приёмка" : "Доставка"}: ${formatDateTime(draft.plannedDeliveryAt)}` : "",
  ].filter(Boolean);

  const update = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateTargetCompany = (targetCompanyId: string | null) => setDraft((current) => current.targetCompanyId === targetCompanyId ? current : ({
    ...current, targetCompanyId, supplier: "", supplierId: null, contactName: "", contactPhone: "",
    pickups: current.pickups.map((pickup) => ({ ...pickup, address: "", contactName: "", contactPhone: "" })),
  }));
  const updateSupplier = (value: string) => {
    const selectedSupplier = suppliers.find((supplier) => supplier.name.trim().toLocaleLowerCase("ru-RU") === value.trim().toLocaleLowerCase("ru-RU"));
    setDraft((current) => {
      const previousSupplier = suppliers.find((supplier) => supplier.id === current.supplierId);
      const clearedPreviousValues = previousSupplier ? {
        ...current,
        contactName: current.contactName === previousSupplier.contactName ? "" : current.contactName,
        contactPhone: current.contactPhone === previousSupplier.phone ? "" : current.contactPhone,
        pickups: ["PICKUP_TO_WAREHOUSE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(current.type) ? current.pickups.map((pickup, index) => index === 0 ? {
          ...pickup,
          address: pickup.address === previousSupplier.addressText ? "" : pickup.address,
          contactName: pickup.contactName === previousSupplier.contactName ? "" : pickup.contactName,
          contactPhone: pickup.contactPhone === previousSupplier.phone ? "" : pickup.contactPhone,
        } : pickup) : current.pickups,
      } : current;
      if (!selectedSupplier) return { ...clearedPreviousValues, supplier: value, supplierId: null };
      return {
        ...clearedPreviousValues,
        supplier: selectedSupplier.name,
        supplierId: selectedSupplier.id,
        contactName: selectedSupplier.contactName ?? clearedPreviousValues.contactName,
        contactPhone: selectedSupplier.phone ?? clearedPreviousValues.contactPhone,
        pickups: ["PICKUP_TO_WAREHOUSE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"].includes(current.type) ? clearedPreviousValues.pickups.map((pickup, index) => index === 0 ? {
          ...pickup,
          address: selectedSupplier.addressText ?? pickup.address,
          contactName: selectedSupplier.contactName ?? pickup.contactName,
          contactPhone: selectedSupplier.phone ?? pickup.contactPhone,
        } : pickup) : clearedPreviousValues.pickups,
      };
    });
  };
  const updatePickup = (id: string, key: keyof Omit<PickupDraft, "id">, value: string) => setDraft((current) => ({ ...current, pickups: current.pickups.map((pickup) => pickup.id === id ? { ...pickup, [key]: value } : pickup) }));
  const updateCargo = (id: string, key: keyof Omit<CargoDraft, "id">, value: string) => setDraft((current) => ({ ...current, cargoItems: current.cargoItems.map((cargo) => cargo.id === id ? { ...cargo, [key]: value } : cargo) }));
  const toggleService = (id: string, checked: boolean) => {
    setStepError("");
    setDraft((current) => ({ ...current, serviceIds: checked ? [...new Set([...current.serviceIds, id])] : current.serviceIds.filter((serviceId) => serviceId !== id) }));
  };
  const toggleInsurance = (checked: boolean) => setDraft((current) => ({
    ...current,
    insuranceRequired: checked,
    serviceIds: insuranceService ? checked ? [...new Set([...current.serviceIds, insuranceService.id])] : current.serviceIds.filter((id) => id !== insuranceService.id) : current.serviceIds,
  }));
  const changeType = (type: OrderType) => {
    setStepError("");
    setDraft((current) => {
      if (current.type === type) return current;
      const pickupTypes = ["PICKUP_TO_WAREHOUSE", "DELIVERY_OWN_TRANSPORT", "DELIVERY_TRANSPORT_COMPANY", "COURIER_DOCUMENTS"];
      const nextNeedsPickup = pickupTypes.includes(type);
      const currentNeedsPickup = pickupTypes.includes(current.type);
      const nextNeedsSender = !["DELIVERY_OWN_TRANSPORT", "COURIER_DOCUMENTS", "WAREHOUSE_SERVICE"].includes(type);
      const selectedSupplier = nextNeedsSender ? suppliers.find((supplier) => supplier.id === current.supplierId) : undefined;
      const emptyPickup = createPickup(crypto.randomUUID());
      const pickups = !nextNeedsPickup ? [emptyPickup] : currentNeedsPickup ? current.pickups : [{
        ...emptyPickup,
        address: selectedSupplier?.addressText ?? "",
        contactName: selectedSupplier?.contactName ?? "",
        contactPhone: selectedSupplier?.phone ?? "",
      }];
      return {
        ...current,
        type,
        serviceIds: [],
        insuranceRequired: false,
        supplier: nextNeedsSender ? current.supplier : "",
        supplierId: nextNeedsSender ? current.supplierId : null,
        contactName: nextNeedsSender ? current.contactName : "",
        contactPhone: nextNeedsSender ? current.contactPhone : "",
        pickups,
      };
    });
    setActiveStep("type");
  };

  const nextStep = () => {
    setStepError("");
    if (visibleStep === "services" && draft.type === "WAREHOUSE_SERVICE" && !draft.serviceIds.length) {
      setStepError("Выберите хотя бы одну складскую операцию.");
      formRef.current?.querySelector<HTMLInputElement>(".service-picker input")?.focus();
      return;
    }
    const form = formRef.current;
    const invalid = form?.querySelector<HTMLElement>("[data-wizard-step]:not([hidden]) input:required:invalid, [data-wizard-step]:not([hidden]) textarea:required:invalid, [data-wizard-step]:not([hidden]) select:required:invalid");
    if (invalid instanceof HTMLInputElement || invalid instanceof HTMLTextAreaElement || invalid instanceof HTMLSelectElement) {
      invalid.reportValidity();
      invalid.focus();
      return;
    }
    setActiveStep(steps[Math.min(stepIndex + 1, steps.length - 1)]);
  };

  return <form ref={formRef} action={createOrderAction} className="wizard-layout" onSubmit={(event) => { if (visibleStep !== "review" || preview) event.preventDefault(); }}>
    <input type="hidden" name="payload" value={JSON.stringify({
      ...draft,
      companyId: draft.targetCompanyId,
      supplier: draft.supplier,
      contactName: draft.pickups[0]?.contactName || draft.contactName,
      contactPhone: draft.pickups[0]?.contactPhone || draft.contactPhone,
      pickupAddress: draft.pickups[0]?.address ?? "",
      plannedPickupAt: draft.pickups[0]?.plannedAt ?? "",
      cargoTitle: draft.cargoItems[0]?.title ?? draft.documentTitle,
      places: draft.cargoItems.reduce((total, cargo) => total + (Number(cargo.places) || 0), 0),
      weightKg: draft.cargoItems.reduce((total, cargo) => total + (Number(cargo.weightKg) || 0), 0),
      declaredValue: draft.cargoItems.reduce((total, cargo) => total + (Number(cargo.declaredValue) || 0), 0),
    })} />
    <input className="visually-hidden-file" id="order-attachments" type="file" name="attachments" aria-label="Вложения к заявке" hidden={visibleStep !== "documents"} accept="image/jpeg,image/png,image/webp,application/pdf" multiple onChange={(event) => setAttachmentNames(Array.from(event.target.files ?? []).map((file) => file.name))} />

    <div className="wizard-main panel">
      <div className="wizard-progress" aria-label={`Этап ${stepIndex + 1} из ${steps.length}`}>
        <div className="wizard-step-list" aria-hidden="true" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
          {steps.map((step, index) => <div className={`wizard-step ${index === stepIndex ? "current" : ""} ${index < stepIndex ? "done" : ""}`} key={step}><span>{index < stepIndex ? <Check size={12} /> : String(index + 1).padStart(2, "0")}</span><small>{getStepLabel(step, draft.type)}</small></div>)}
        </div>
        <div className="wizard-progress-meta"><span>Шаг {stepIndex + 1} из {steps.length} · {getStepLabel(visibleStep, draft.type)}</span><div className="wizard-progress-track"><span style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }} /></div></div>
      </div>

      {visibleStep === "company" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">КОМПАНИЯ-ЗАКАЗЧИК</span><h2>От чьего имени создать заявку?</h2><p className="muted-copy">Выберите компанию, которой будет принадлежать перевозка.</p><div className="wizard-fields"><label className="wizard-field full-field"><span>Компания</span><select value={draft.targetCompanyId ?? ""} onChange={(event) => updateTargetCompany(event.target.value || null)} required><option value="">Выберите компанию</option>{companyOptions.map((company) => <option key={company.id} value={company.id}>{company.displayName}</option>)}</select></label>{!companyOptions.length ? <p className="wizard-field-hint">Нет активных компаний для создания заявки.</p> : null}</div></div> : null}

      {visibleStep === "type" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">НАЧНЁМ С ТИПА ЗАЯВКИ</span><h2>Что нужно организовать?</h2><p className="muted-copy">Дальше покажем только подходящие поля и шаги.</p><div className="order-type-grid">{types.map(({ value, title, description, icon: Icon }) => <button type="button" className={`order-type-card ${draft.type === value ? "selected" : ""}`} onClick={() => changeType(value)} key={value} aria-pressed={draft.type === value}><span className="order-type-icon"><Icon size={18} /></span><strong>{title}</strong><small>{description}</small></button>)}</div></div> : null}

      {visibleStep === "sender" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">ОТПРАВИТЕЛЬ</span><h2>Кто передаёт груз?</h2><p className="muted-copy">Укажите поставщика и основной контакт для согласования забора.</p><div className="wizard-fields"><label className="wizard-field full-field"><span>Поставщик / отправитель</span><input list="client-suppliers" value={draft.supplier} onChange={(event) => updateSupplier(event.target.value)} placeholder="Выберите или укажите нового поставщика" required /><datalist id="client-suppliers">{suppliers.map((supplier) => <option key={supplier.id} value={supplier.name} label={[supplier.contactName, supplier.phone].filter(Boolean).join(" · ")} />)}</datalist><small className="wizard-field-hint">Выберите поставщика из списка или введите новое название. Данные контакта и адреса подставятся автоматически — их можно уточнить в форме.</small></label>{textField("Контактное лицо", draft.contactName, (value) => update("contactName", value), "Имя и фамилия")}{textField("Телефон отправителя", draft.contactPhone, (value) => update("contactPhone", value), "+7 900 000-00-00", { type: "tel" })}{draft.type === "WAREHOUSE_INTAKE" ? textField("Ожидаемая дата и время приёмки", draft.plannedDeliveryAt, (value) => update("plannedDeliveryAt", value), "", { type: "datetime-local", required: true }) : null}</div></div> : null}

      {visibleStep === "pickup" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">ТОЧКИ ЗАБОРА</span><h2>{draft.type === "COURIER_DOCUMENTS" ? "Откуда забрать документы?" : draft.type === "DELIVERY_OWN_TRANSPORT" ? "Откуда забрать груз?" : "Где находится груз?"}</h2><p className="muted-copy">Можно указать несколько адресов и контактов для одного маршрута.</p><div className="pickup-list">{draft.pickups.map((pickup, index) => <article className="wizard-item-card" key={pickup.id}><div className="wizard-item-heading"><div><span className="wizard-item-index">ТОЧКА {String(index + 1).padStart(2, "0")}</span><strong>{pickup.address || "Новый адрес забора"}</strong></div>{draft.pickups.length > 1 ? <button className="icon-button" type="button" onClick={() => update("pickups", draft.pickups.filter((item) => item.id !== pickup.id))} aria-label={`Удалить точку забора ${index + 1}`}><Trash2 size={15} /></button> : null}</div><div className="wizard-fields">{textField("Адрес", pickup.address, (value) => updatePickup(pickup.id, "address", value), "Город, улица, дом", { required: index === 0 })}{textField("Контактное лицо", pickup.contactName, (value) => updatePickup(pickup.id, "contactName", value), "Имя и фамилия")}{textField("Телефон", pickup.contactPhone, (value) => updatePickup(pickup.id, "contactPhone", value), "+7 900 000-00-00", { type: "tel" })}{textField("Дата и время забора", pickup.plannedAt, (value) => updatePickup(pickup.id, "plannedAt", value), "", { type: "datetime-local" })}<label className="wizard-field full-field"><span>Комментарий к точке</span><textarea value={pickup.notes} onChange={(event) => updatePickup(pickup.id, "notes", event.target.value)} placeholder="Пропуск, режим работы, особенности погрузки" rows={2} /></label></div></article>)}</div><button className="button button-secondary wizard-add-button" type="button" onClick={() => update("pickups", [...draft.pickups, createPickup(crypto.randomUUID())])}><Plus size={15} /> Добавить адрес забора</button></div> : null}

      {visibleStep === "cargo" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">СОСТАВ ГРУЗА</span><h2>Что перевозим?</h2><p className="muted-copy">Добавьте одну или несколько позиций. Размеры помогут подобрать транспорт.</p><div className="cargo-draft-list">{draft.cargoItems.map((cargo, index) => <article className="wizard-item-card" key={cargo.id}><div className="wizard-item-heading"><div><span className="wizard-item-index">ПОЗИЦИЯ {String(index + 1).padStart(2, "0")}</span><strong>{cargo.title || "Новый груз"}</strong></div>{draft.cargoItems.length > 1 ? <button className="icon-button" type="button" onClick={() => update("cargoItems", draft.cargoItems.filter((item) => item.id !== cargo.id))} aria-label={`Удалить позицию ${index + 1}`}><Trash2 size={15} /></button> : null}</div><div className="wizard-fields">{textField("Название груза", cargo.title, (value) => updateCargo(cargo.id, "title", value), "Например, комплектующие", { required: index === 0 })}<label className="wizard-field"><span>Категория</span><select value={cargo.category} onChange={(event) => updateCargo(cargo.id, "category", event.target.value)}><option>Оборудование</option><option>Материалы</option><option>Комплектующие</option><option>Документы</option><option>Другое</option></select></label>{numberField("Количество мест", cargo.places, (value) => updateCargo(cargo.id, "places", value), "1", "1", "10000")}{numberField("Вес, кг", cargo.weightKg, (value) => updateCargo(cargo.id, "weightKg", value), "Например, 250", "0", "1000000", "0.1")}<div className="wizard-dimensions">{numberField("Длина, см", cargo.lengthCm, (value) => updateCargo(cargo.id, "lengthCm", value), "120", "0", "100000", "0.1")}{numberField("Ширина, см", cargo.widthCm, (value) => updateCargo(cargo.id, "widthCm", value), "80", "0", "100000", "0.1")}{numberField("Высота, см", cargo.heightCm, (value) => updateCargo(cargo.id, "heightCm", value), "95", "0", "100000", "0.1")}</div>{numberField("Объявленная стоимость, ₽", cargo.declaredValue, (value) => updateCargo(cargo.id, "declaredValue", value), "Для расчёта страхования", "0", "100000000", "1")}<label className="wizard-field full-field"><span>Особенности и требования</span><textarea value={cargo.description} onChange={(event) => updateCargo(cargo.id, "description", event.target.value)} placeholder="Упаковка, хрупкость, ограничения" rows={2} /></label></div></article>)}</div><button className="button button-secondary wizard-add-button" type="button" onClick={() => update("cargoItems", [...draft.cargoItems, createCargo(crypto.randomUUID())])}><Plus size={15} /> Добавить груз</button></div> : null}

      {visibleStep === "services" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">{draft.type === "DELIVERY_TRANSPORT_COMPANY" ? "ПОДГОТОВКА ОТПРАВКИ" : "СКЛАД И УСЛУГИ"}</span><h2>{draft.type === "WAREHOUSE_SERVICE" ? "Какие операции нужны?" : draft.type === "DELIVERY_TRANSPORT_COMPANY" ? "Как подготовить отправку?" : "Что сделать на складе?"}</h2><p className="muted-copy">Стоимость услуг менеджер подтвердит после проверки заявки.</p>{usesWarehouse ? <div className="warehouse-preview"><span className="warehouse-preview-icon"><MapPin size={17} /></span><div><strong>{warehouseName}</strong><small>{warehouseAddress}</small></div><Check size={16} /></div> : null}<fieldset className="service-picker"><legend>{draft.type === "WAREHOUSE_SERVICE" ? "Выберите операции" : draft.type === "DELIVERY_TRANSPORT_COMPANY" ? "Дополнительная подготовка" : "Дополнительные услуги"}</legend>{selectableServices.map((service) => <label className={`service-option ${draft.serviceIds.includes(service.id) ? "selected" : ""}`} key={service.id}><input type="checkbox" checked={draft.serviceIds.includes(service.id)} onChange={(event) => toggleService(service.id, event.target.checked)} /><span><strong>{service.name}</strong><small>{service.unit || "услуга"}{service.basePrice ? ` · ${formatMoney(service.basePrice)}` : ""}</small></span></label>)}{!selectableServices.length ? <p className="muted-copy">Менеджер добавит услуги после проверки заявки.</p> : null}{stepError ? <p className="wizard-error" role="alert">{stepError}</p> : null}</fieldset>{draft.serviceIds.length ? <div className="service-total-preview"><span>Предварительная стоимость услуг</span><strong>{formatMoney(servicesTotal)}</strong></div> : null}</div> : null}

      {visibleStep === "delivery" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">ПОЛУЧАТЕЛЬ И ДОСТАВКА</span><h2>{draft.type === "COURIER_DOCUMENTS" ? "Кому передать документы?" : "Куда доставить груз?"}</h2><p className="muted-copy">Укажите точный адрес, контакт получателя и желаемый срок.</p><div className="wizard-fields">{draft.type === "DELIVERY_TRANSPORT_COMPANY" ? <>{textField("Транспортная компания", draft.carrierName, (value) => update("carrierName", value), "Название перевозчика", { required: true })}{textField("Город назначения", draft.destinationCity, (value) => update("destinationCity", value), "Казань", { required: true })}<label className="wizard-field"><span>Кто оплачивает перевозку</span><select value={draft.payer} onChange={(event) => update("payer", event.target.value)}><option value="SENDER">Отправитель</option><option value="RECIPIENT">Получатель</option><option value="THIRD_PARTY">Третья сторона</option></select></label></> : textField("Адрес доставки", draft.destinationAddress, (value) => update("destinationAddress", value), "Город, улица, дом", { required: true })}{textField(draft.type === "COURIER_DOCUMENTS" ? "Получатель" : "Контакт получателя", draft.destinationContactName, (value) => update("destinationContactName", value), "Имя и фамилия", { required: true })}{textField("Телефон получателя", draft.destinationContactPhone, (value) => update("destinationContactPhone", value), "+7 900 000-00-00", { type: "tel", required: true })}{textField("Желаемая дата и время", draft.plannedDeliveryAt, (value) => update("plannedDeliveryAt", value), "", { type: "datetime-local" })}{draft.type === "COURIER_DOCUMENTS" ? textField("Название документов", draft.documentTitle, (value) => update("documentTitle", value), "Например, договор поставки", { required: true }) : null}</div></div> : null}

      {visibleStep === "documents" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">ДОКУМЕНТЫ И СТРАХОВАНИЕ</span><h2>Добавьте важные материалы</h2><p className="muted-copy">Менеджер увидит документы вместе с заявкой и подтвердит условия.</p><label htmlFor="order-attachments" className="wizard-file-picker"><span className="file-picker-icon"><Plus size={17} /></span><span><strong>Прикрепить файл</strong><small>JPG, PNG, WebP или PDF · до 10 МБ на файл</small></span></label>{attachmentNames.length ? <div className="selected-files">{attachmentNames.map((name, index) => <span className="selected-file" key={`${name}-${index}`}><FileText size={14} />{name}</span>)}</div> : null}<div className="wizard-fields documents-fields">{attachmentNames.length ? <label className="wizard-field"><span>Тип файлов</span><select value={draft.attachmentCategory} onChange={(event) => update("attachmentCategory", event.target.value)}><option value="DOCUMENT">Документ</option><option value="INVOICE">Счёт</option><option value="CARGO_PHOTO">Фото груза</option><option value="OTHER">Другое</option></select></label> : null}{draft.type === "COURIER_DOCUMENTS" ? numberField("Количество комплектов", draft.documentSetCount, (value) => update("documentSetCount", value), "1", "1", "1000", undefined, true) : null}{draft.type === "COURIER_DOCUMENTS" ? <label className="wizard-check full-field"><input type="checkbox" checked={draft.returnDocuments} onChange={(event) => update("returnDocuments", event.target.checked)} /><span>Нужен возврат подписанных документов</span></label> : null}{insuranceService && draft.cargoItems.some((cargo) => Number(cargo.declaredValue) > 0) ? <label className="wizard-check full-field"><input type="checkbox" checked={draft.insuranceRequired} onChange={(event) => toggleInsurance(event.target.checked)} /><span>Добавить услугу страхования груза</span></label> : null}<label className="wizard-field full-field"><span>Комментарий менеджеру</span><textarea value={draft.description} onChange={(event) => update("description", event.target.value)} placeholder="Дополнительные условия или важные детали" rows={3} /></label></div></div> : null}

      {visibleStep === "review" ? <div className="wizard-content" data-wizard-step><span className="eyebrow">ПЕРЕД ОТПРАВКОЙ</span><h2>Проверьте заявку</h2><p className="muted-copy">Если нужно, вернитесь к любому блоку и исправьте данные.</p><dl className="review-list">{targetCompanyRequired ? <div><dt>Компания</dt><dd>{companyOptions.find((company) => company.id === draft.targetCompanyId)?.displayName || "Не выбрана"}</dd></div> : null}<div><dt>Тип заявки</dt><dd>{typeLabel}</dd></div>{draft.supplier ? <div><dt>Отправитель</dt><dd>{draft.supplier}</dd></div> : null}{routeSummary.length ? <div><dt>{draft.type === "WAREHOUSE_SERVICE" ? "Место услуги" : "Маршрут"}</dt><dd>{routeSummary.join(" → ")}</dd></div> : null}{usesWarehouse ? <div><dt>Адрес склада</dt><dd>{warehouseAddress}</dd></div> : null}{contactSummary.length ? <div><dt>Контакты</dt><dd>{contactSummary.join(" · ")}</dd></div> : null}{scheduleSummary.length ? <div><dt>Плановое время</dt><dd>{scheduleSummary.join(" · ")}</dd></div> : null}{draft.type !== "COURIER_DOCUMENTS" && cargoSummary.length ? <div><dt>Груз</dt><dd>{cargoSummary.join("; ")}</dd></div> : null}{draft.type === "COURIER_DOCUMENTS" ? <div><dt>К отправке</dt><dd>{draft.documentTitle || "Документы"} · {draft.documentSetCount} компл.{draft.returnDocuments ? " · нужен возврат подписанных" : ""}</dd></div> : null}{draft.type === "DELIVERY_TRANSPORT_COMPANY" ? <div><dt>Перевозчик</dt><dd>{draft.carrierName || "Не выбран"} · оплачивает {draft.payer === "RECIPIENT" ? "получатель" : draft.payer === "THIRD_PARTY" ? "третья сторона" : "отправитель"}</dd></div> : null}<div><dt>Услуги</dt><dd>{draft.serviceIds.length ? selectedServiceRows.map((service) => service.name).join(", ") : "Не выбраны"}</dd></div>{draft.type !== "COURIER_DOCUMENTS" && !cargoSummary.length ? <div><dt>Груз</dt><dd>Не добавлен</dd></div> : null}<div><dt>Файлы</dt><dd>{attachmentNames.length ? attachmentNames.join(", ") : "Не приложены"}</dd></div>{draft.description ? <div><dt>Комментарий</dt><dd>{draft.description}</dd></div> : null}</dl><div className="review-edit-actions">{steps.filter((step) => step !== "review").map((step) => <button type="button" className="text-button" onClick={() => setActiveStep(step)} key={step}>Изменить: {getStepLabel(step, draft.type).toLowerCase()}</button>)}</div></div> : null}

      <div className="wizard-footer">{stepIndex > 0 ? <button className="button button-secondary" type="button" onClick={() => setActiveStep(steps[stepIndex - 1])}><ArrowLeft size={15} /> Назад</button> : <span className="muted-copy">{targetCompanyRequired ? "Заявка сохранится для выбранной компании." : "Условия и стоимость подтвердит менеджер."}</span>}{visibleStep !== "review" ? <button className="button button-primary" type="button" onClick={nextStep}>Далее <ArrowRight size={15} /></button> : <div className="wizard-submit">{preview ? <span className="muted-copy">В режиме просмотра заявки не сохраняются.</span> : <><button className="button button-secondary" name="intent" value="draft">Сохранить черновик</button><button className="button button-primary" name="intent" value="submit">Отправить менеджеру <ArrowRight size={15} /></button></>}</div>}</div>
    </div>

    <aside className="panel wizard-aside"><span className="eyebrow">ЗАЯВКА LOGSKLAD</span><h3>Всё по делу и в одном месте</h3><p>{targetCompanyRequired ? "Выберите компанию и оформите заявку от её имени. Она появится в общей очереди." : "Покажем только важные поля. Менеджер подтвердит детали, условия и стоимость."}</p><div className="wizard-aside-note"><span className="aside-dot" />{draft.cargoItems.filter((cargo) => cargo.title).length > 1 ? `${draft.cargoItems.filter((cargo) => cargo.title).length} грузовые позиции` : "Можно добавить несколько грузов и адресов"}</div></aside>
  </form>;
}

function textField(label: string, value: string, onChange: (value: string) => void, placeholder: string, options: { type?: string; required?: boolean } = {}) {
  return <label className="wizard-field" key={label}><span>{label}</span><input type={options.type ?? "text"} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} required={options.required} /></label>;
}

function numberField(label: string, value: string, onChange: (value: string) => void, placeholder: string, min: string, max: string, step?: string, required = false) {
  return <label className="wizard-field" key={label}><span>{label}</span><input type="number" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} min={min} max={max} step={step ?? "1"} required={required} /></label>;
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 }).format(value);
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function getStepLabel(step: StepId, type: OrderType) {
  if (step === "services" && type === "DELIVERY_TRANSPORT_COMPANY") return "Подготовка отправки";
  return stepLabels[step];
}
