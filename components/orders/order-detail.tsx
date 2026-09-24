import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Boxes, CheckCircle2, Circle, FileText, MapPin, Package, Route, Wallet } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import { warehouseOperationTypeLabels } from "@/config/warehouse-operations";
import type { getActiveDrivers, getActiveVehicles, getOrderDetails } from "@/features/orders/queries";
import type { DemoRole } from "@/features/demo/identity";
import { getAllowedTransitions } from "@/features/orders/services/order-status-machine";
import { assignOutboundDeliveryAction, changeOrderStatusAction } from "@/features/orders/actions";
import { addOrderCommentAction } from "@/features/orders/actions";
import { uploadOrderAttachmentAction } from "@/features/files/actions";
import { toggleOrderServiceAction, updateOrderPricingAction } from "@/features/orders/actions";
import { WarehouseIntakeForm, WarehouseReleaseForm } from "@/components/warehouse/warehouse-intake-form";
import { WarehouseOperationForm } from "@/components/warehouse/warehouse-operation-form";
import type { Order, OrderStatus } from "@/db/schema";

type Detail = NonNullable<Awaited<ReturnType<typeof getOrderDetails>>>;
type ClientMilestone = { label: string; statuses: OrderStatus[] };

const milestone = (label: string, ...statuses: OrderStatus[]): ClientMilestone => ({ label, statuses });
const requestStatuses: OrderStatus[] = ["DRAFT", "SUBMITTED", "REVIEW"];
const pickupStatuses: OrderStatus[] = ["CONFIRMED", "DRIVER_ASSIGNED", "PICKUP_IN_PROGRESS", "PICKED_UP"];
const warehouseStatuses: OrderStatus[] = ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING"];
const finalStatuses: OrderStatus[] = ["DELIVERED", "COMPLETED"];

const clientMilestonePlans: Record<Order["type"], ClientMilestone[]> = {
  PICKUP_TO_WAREHOUSE: [
    milestone("Заявка", ...requestStatuses), milestone("Забор", ...pickupStatuses),
    milestone("Склад", ...warehouseStatuses), milestone("Доставка", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", ...finalStatuses),
  ],
  WAREHOUSE_INTAKE: [
    milestone("Заявка", ...requestStatuses), milestone("Приёмка", ...pickupStatuses, "AT_WAREHOUSE"),
    milestone("Обработка", "WAREHOUSE_PROCESSING"), milestone("Готово", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", ...finalStatuses),
  ],
  WAREHOUSE_SERVICE: [
    milestone("Заявка", ...requestStatuses), milestone("Приёмка", ...pickupStatuses, "AT_WAREHOUSE"),
    milestone("Обработка", "WAREHOUSE_PROCESSING"), milestone("Готово", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS", ...finalStatuses),
  ],
  DELIVERY_OWN_TRANSPORT: [
    milestone("Заявка", ...requestStatuses), milestone("Забор", ...pickupStatuses),
    milestone("Доставка", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS"), milestone("Готово", ...finalStatuses),
  ],
  DELIVERY_TRANSPORT_COMPANY: [
    milestone("Заявка", ...requestStatuses), milestone("Забор", ...pickupStatuses),
    milestone("Передача", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY"), milestone("В пути", "DELIVERY_IN_PROGRESS"), milestone("Готово", ...finalStatuses),
  ],
  COURIER_DOCUMENTS: [
    milestone("Заявка", ...requestStatuses), milestone("Забор", ...pickupStatuses),
    milestone("Доставка", "AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "DELIVERY_IN_PROGRESS"), milestone("Готово", ...finalStatuses),
  ],
};

const orderTypeLabels: Record<Order["type"], string> = {
  PICKUP_TO_WAREHOUSE: "Забрать и привезти на склад",
  WAREHOUSE_INTAKE: "Принять на склад",
  DELIVERY_OWN_TRANSPORT: "Доставка нашим транспортом",
  DELIVERY_TRANSPORT_COMPANY: "Транспортная компания",
  COURIER_DOCUMENTS: "Курьер и документы",
  WAREHOUSE_SERVICE: "Услуги склада",
};

function getClientProgress(order: Order, history: Detail["history"]) {
  const plan = clientMilestonePlans[order.type];
  const paused = order.status === "ISSUE" || order.status === "ON_HOLD";
  const cancelled = order.status === "CANCELLED";
  const completed = order.status === "DELIVERED" || order.status === "COMPLETED";
  const underlyingStatus = paused || cancelled
    ? history.find((item) => item.toStatus === order.status)?.fromStatus ?? history.find((item) => !["ISSUE", "ON_HOLD", "CANCELLED"].includes(item.toStatus))?.toStatus ?? order.status
    : order.status;
  const activeIndex = Math.max(0, plan.findIndex((item) => item.statuses.includes(underlyingStatus)));
  const nextMilestone = !paused && !cancelled && !completed ? plan[activeIndex + 1]?.label : undefined;
  return { plan, activeIndex, paused, cancelled, completed, nextMilestone };
}

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat("ru-RU", { style: "currency", currency, maximumFractionDigits: 0 }).format(value);
}

type AttachmentCategory = Detail["files"][number]["category"];

const attachmentUploadCategories: Record<DemoRole, AttachmentCategory[]> = {
  CLIENT: ["CARGO_PHOTO", "DOCUMENT", "INVOICE", "OTHER"],
  MANAGER: ["CARGO_PHOTO", "WAREHOUSE_PHOTO", "DOCUMENT", "INVOICE", "OTHER"],
  DRIVER: ["CARGO_PHOTO", "DOCUMENT", "PROOF_OF_DELIVERY"],
  WAREHOUSE: ["WAREHOUSE_PHOTO", "DOCUMENT", "OTHER"],
  ADMIN: ["CARGO_PHOTO", "WAREHOUSE_PHOTO", "DOCUMENT", "INVOICE", "OTHER"],
};

const attachmentCategoryLabels: Record<Detail["files"][number]["category"], string> = {
  CARGO_PHOTO: "Фото груза",
  WAREHOUSE_PHOTO: "Фото склада",
  DOCUMENT: "Документ",
  INVOICE: "Счёт",
  PROOF_OF_DELIVERY: "Подтверждение доставки",
  OTHER: "Другое",
};

const warehouseOperationLabels: Record<string, string> = {
  ...warehouseOperationTypeLabels,
  INTAKE: "Приёмка",
  PROCESSING: "Обработка",
  READY_FOR_DELIVERY: "Готовность к выдаче",
  SERVICE_COMPLETE: "Услуги завершены",
  RELEASE: "Выдача",
};

function AttachmentSection({ detail, role, preview }: { detail: Detail; role: DemoRole; preview: boolean }) {
  const photos = detail.files.filter((file) => file.mimeType?.startsWith("image/"));
  const documents = detail.files.filter((file) => !file.mimeType?.startsWith("image/"));
  const uploadedAt = (date: Date) => new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(date);
  const attachmentHref = (fileId: string) => preview ? "/demo/cargo-placeholder.svg" : `/api/attachments/${fileId}`;

  return <section className="panel comments-panel" id="order-documents">
    <div className="panel-heading"><div className="icon-tile"><FileText size={18} /></div><div><span className="eyebrow">ФАЙЛЫ И ДОКУМЕНТЫ</span><h2>Вложения · {detail.files.length}</h2></div></div>
    <div className="attachment-groups">
      <section className="attachment-group" aria-labelledby="order-photos-heading">
        <div className="attachment-group-heading"><h3 id="order-photos-heading">Фото</h3><span>{photos.length}</span></div>
        {photos.length ? <div className="attachment-photo-grid">{photos.map((file) => <a className="attachment-photo-card" href={attachmentHref(file.id)} key={file.id} target={preview ? undefined : "_blank"} rel={preview ? undefined : "noreferrer"}>
          <span className="attachment-photo-thumb"><Image className="attachment-photo-image" src={preview ? file.category === "WAREHOUSE_PHOTO" ? "/demo/warehouse-placeholder.svg" : "/demo/cargo-placeholder.svg" : `/api/attachments/${file.id}`} fill sizes="(max-width: 640px) 50vw, 240px" unoptimized alt={`${attachmentCategoryLabels[file.category]}: ${file.filename}`} /></span>
          <span className="attachment-photo-caption"><strong>{file.filename}</strong><small>{attachmentCategoryLabels[file.category]} · {uploadedAt(file.createdAt)}{file.visibility === "INTERNAL" ? " · Внутренний файл" : ""}</small></span>
        </a>)}</div> : <p className="muted-copy attachment-empty">Фотографии по заявке пока не добавлены.</p>}
      </section>
      <section className="attachment-group" aria-labelledby="order-files-heading">
        <div className="attachment-group-heading"><h3 id="order-files-heading">Документы и подтверждения</h3><span>{documents.length}</span></div>
        {documents.length ? <div className="attachment-document-list">{documents.map((file) => <a className="attachment-row" href={attachmentHref(file.id)} key={file.id} target={preview ? undefined : "_blank"} rel={preview ? undefined : "noreferrer"}>
          <span>{file.filename}<small>{attachmentCategoryLabels[file.category]} · {file.visibility === "INTERNAL" ? "Внутренний файл" : "Доступен клиенту"} · {uploadedAt(file.createdAt)}</small></span><FileText size={15} aria-hidden="true" />
        </a>)}</div> : <p className="muted-copy attachment-empty">Документы по заявке пока не добавлены.</p>}
      </section>
    </div>
    <form action={uploadOrderAttachmentAction} className="attachment-form"><input type="hidden" name="orderId" value={detail.order.id} /><label className="wizard-field"><span>{role === "DRIVER" ? "Фото груза или доставки" : "Файл (JPG, PNG, WebP или PDF; до 10 МБ)"}</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,application/pdf" capture={role === "DRIVER" ? "environment" : undefined} required disabled={preview} /></label><label className="wizard-field"><span>Категория</span><select name="category" defaultValue={role === "DRIVER" ? detail.order.status === "DELIVERY_IN_PROGRESS" ? "PROOF_OF_DELIVERY" : "CARGO_PHOTO" : "DOCUMENT"} disabled={preview}>{attachmentUploadCategories[role].map((category) => <option key={category} value={category}>{attachmentCategoryLabels[category]}</option>)}</select></label>{role === "MANAGER" || role === "ADMIN" ? <label className="wizard-check"><input type="checkbox" name="visibility" value="INTERNAL" disabled={preview} /><span>Только для команды</span></label> : null}<button className="button button-secondary" type="submit" disabled={preview}>{role === "DRIVER" ? "Добавить фото" : "Загрузить файл"}</button></form>
  </section>;
}

export async function OrderDetail({ detail, role, roleRoot, backHref, drivers, vehicles, canViewFinance, preview = false }: { detail: Detail; role: DemoRole; roleRoot: string; backHref?: string; drivers: Awaited<ReturnType<typeof getActiveDrivers>>; vehicles: Awaited<ReturnType<typeof getActiveVehicles>>; canViewFinance: boolean; preview?: boolean }) {
  const availableTransitions = await getAllowedTransitions(detail.order);
  const canReportIssue = availableTransitions.includes("ISSUE");
  const allowed = availableTransitions.filter((nextStatus) => nextStatus !== "ISSUE");
  const hasDeliveryProof = detail.files.some((file) => file.category === "PROOF_OF_DELIVERY" && file.visibility === "CLIENT" && file.uploadedByUserId === detail.order.driverUserId);
  const needsDeliveryProof = allowed.includes("DELIVERED") && !hasDeliveryProof;
  const status = orderStatusConfig[detail.order.status];
  const issueEvent = detail.order.status === "ISSUE" ? detail.history.find((item) => item.toStatus === "ISSUE") : null;
  const issueMessage = issueEvent?.note && !["CLIENT", "DRIVER"].includes(role)
    ? issueEvent.note
    : "Работа по заявке приостановлена. Менеджер получил уведомление и свяжется с участниками.";
  const expectedPlaces = detail.cargo.reduce((total, item) => total + (item.places ?? item.quantity), 0);
  const expectedWeight = detail.cargo.reduce((total, item) => total + (item.weightKg ?? 0), 0);
  const outboundDispatchRequired = detail.order.status === "READY_FOR_DELIVERY" && ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE"].includes(detail.order.type);
  const releaseOperation = detail.operations.find(({ operation }) => operation.operationType === "RELEASE")?.operation;
  const intakeOperation = detail.operations.find(({ operation }) => operation.operationType === "INTAKE")?.operation;
  const releasePlaces = intakeOperation?.quantity ?? expectedPlaces;
  const waitingForWarehouse = role === "DRIVER" && detail.order.status === "PICKED_UP" && ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(detail.order.type);
  const clientProgress = role === "CLIENT" ? getClientProgress(detail.order, detail.history) : null;
  const plannedPoint = detail.points.find((point) => point.plannedAt && !point.completedAt);
  const plannedAt = plannedPoint?.plannedAt ?? detail.order.plannedDeliveryAt ?? detail.order.plannedPickupAt;
  const plannedLabel = detail.order.type === "WAREHOUSE_INTAKE" ? "Приёмка" : "План";
  return <div className="page-stack order-detail-page">
    <Link className="back-link" href={backHref ?? `${roleRoot}/orders`}><ArrowLeft size={15} /> Все заявки</Link>
    <section className={`panel order-detail-hero${role === "DRIVER" ? " driver-order-hero" : ""}`}>
      <div className="order-detail-heading"><div><span className="eyebrow">{detail.order.number}</span><h2>{detail.order.title || "Логистическая заявка"}</h2><p>{detail.companyName} · {orderTypeLabels[detail.order.type]} · создана {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(detail.order.createdAt)}{plannedAt ? ` · ${plannedLabel}: ${new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(plannedAt)}` : ""}</p></div><span className={`status-pill status-${status.tone}`}><span className="status-dot" />{status.label}</span></div>
      {detail.order.description ? <p className="order-description">{detail.order.description}</p> : null}
      {role === "CLIENT" ? <div className="client-order-actions"><Link className="button button-primary" href="#order-comments">Написать менеджеру</Link><Link className="button button-secondary" href="#order-documents">Документы и фото</Link></div> : null}
      {role === "MANAGER" && detail.order.status === "CONFIRMED" ? <form action={changeOrderStatusAction} className="status-action-form"><input type="hidden" name="orderId" value={detail.order.id} /><input type="hidden" name="nextStatus" value="DRIVER_ASSIGNED" /><label>Назначить водителя<select name="driverUserId" required defaultValue="" disabled={preview}><option value="" disabled>Выберите водителя</option>{drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}{driver.phone ? ` · ${driver.phone}` : ""}</option>)}</select></label><label>Транспорт<select name="vehicleId" defaultValue="" disabled={preview}><option value="">Без назначения</option>{vehicles.map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}{vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}{vehicle.capacityKg ? ` · ${vehicle.capacityKg} кг` : ""}</option>)}</select></label><button className="button button-primary" type="submit" disabled={preview}>Назначить и передать в работу</button></form> : role === "MANAGER" && outboundDispatchRequired && releaseOperation ? <div className="warehouse-release-complete outbound-release-confirmation">{releaseOperation.resultText || "Склад оформил выдачу."} Назначенный водитель может начать доставку.</div> : role === "MANAGER" && outboundDispatchRequired ? <form action={assignOutboundDeliveryAction} className="status-action-form outbound-dispatch-form"><input type="hidden" name="orderId" value={detail.order.id} /><p className="muted-copy">Склад подготовил груз. Подтвердите водителя и автомобиль — после выдачи водитель начнёт рейс.</p><label>Водитель<select name="driverUserId" required defaultValue={detail.order.driverUserId ?? ""} disabled={preview}><option value="" disabled>Выберите водителя</option>{detail.order.driverUserId ? <option value={detail.order.driverUserId}>{detail.driverName || "Текущий водитель"} · уже назначен</option> : null}{drivers.filter((driver) => driver.id !== detail.order.driverUserId).map((driver) => <option key={driver.id} value={driver.id}>{driver.name}{driver.phone ? ` · ${driver.phone}` : ""}</option>)}</select></label><label>Автомобиль<select name="vehicleId" required defaultValue={detail.order.vehicleId ?? ""} disabled={preview}><option value="" disabled>Выберите автомобиль</option>{detail.order.vehicleId ? <option value={detail.order.vehicleId}>{detail.vehicleName || "Текущий автомобиль"}{detail.vehiclePlateNumber ? ` · ${detail.vehiclePlateNumber}` : ""} · уже назначен</option> : null}{vehicles.filter((vehicle) => vehicle.id !== detail.order.vehicleId).map((vehicle) => <option key={vehicle.id} value={vehicle.id}>{vehicle.name}{vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ""}{vehicle.capacityKg ? ` · ${vehicle.capacityKg} кг` : ""}</option>)}</select></label><button className="button button-primary" type="submit" disabled={preview}>{detail.order.driverUserId && detail.order.vehicleId ? "Подтвердить назначение" : "Назначить исходящий рейс"}</button></form> : role === "WAREHOUSE" && allowed.includes("AT_WAREHOUSE") ? <div className="warehouse-intake-prompt"><span>ПРИЁМКА ГРУЗА</span><strong>Сверьте фактические данные перед подтверждением</strong></div> : role === "WAREHOUSE" && allowed.length ? <form action={changeOrderStatusAction} className="status-action-form"><input type="hidden" name="orderId" value={detail.order.id} /><label>Следующий этап<select name="nextStatus" defaultValue={allowed[0]} disabled={preview}>{allowed.map((item) => <option key={item} value={item}>{orderStatusConfig[item].label}</option>)}</select></label><label className="warehouse-note-field">Комментарий<textarea name="note" maxLength={1000} placeholder="Результат складской операции" rows={2} disabled={preview} /></label><button className="button button-primary" type="submit" disabled={preview}>Сохранить этап</button></form> : role === "DRIVER" && availableTransitions.length === 1 && availableTransitions[0] === "ISSUE" ? <>{waitingForWarehouse ? <div className="driver-waiting-note"><strong>Груз передан в путь</strong><span>Склад подтвердит приёмку, когда груз прибудет.</span></div> : null}<form action={changeOrderStatusAction} className="status-action-form driver-issue-form"><input type="hidden" name="orderId" value={detail.order.id} /><input type="hidden" name="nextStatus" value="ISSUE" /><label>Причина проблемы<textarea name="note" maxLength={1000} placeholder="Опишите, что мешает продолжить рейс" rows={2} required disabled={preview} /></label><button className="button button-secondary" type="submit" disabled={preview}>Сообщить о проблеме</button></form></> : (role === "MANAGER" || role === "ADMIN") && needsDeliveryProof ? <div className="delivery-proof-required" role="status"><strong>Нужно подтверждение доставки</strong><p>Перед установкой статуса «Доставлен» прикрепите клиентский файл категории «Подтверждение доставки».</p><a className="text-link" href="#order-documents">Открыть раздел файлов</a></div> : allowed.length ? <form action={changeOrderStatusAction} className="status-action-form"><input type="hidden" name="orderId" value={detail.order.id} /><label>Следующий статус<select name="nextStatus" defaultValue={allowed[0]} disabled={preview}>{allowed.map((item) => <option key={item} value={item}>{orderStatusConfig[item].label}</option>)}</select></label><label>Комментарий<input name="note" maxLength={1000} placeholder="Добавьте пояснение (необязательно)" disabled={preview} /></label><button className="button button-primary" type="submit" disabled={preview}>Обновить заявку</button></form> : null}
    </section>

    {canReportIssue && (role !== "DRIVER" || allowed.length > 0) ? <form action={changeOrderStatusAction} className="status-action-form order-issue-form"><input type="hidden" name="orderId" value={detail.order.id} /><input type="hidden" name="nextStatus" value="ISSUE" /><label>Сообщить о проблеме<textarea name="note" maxLength={1000} placeholder="Опишите расхождение или причину остановки" rows={3} required disabled={preview} /></label><button className="button button-secondary" type="submit" disabled={preview}>Отправить менеджеру</button></form> : null}
    {issueEvent ? <section className="order-issue-banner" role="status" aria-live="polite"><span className="eyebrow">ТРЕБУЕТ ВНИМАНИЯ</span><strong>Заявка приостановлена</strong><p>{issueMessage}</p>{role === "MANAGER" || role === "ADMIN" ? <small>После уточнения выберите следующий этап в блоке действий.</small> : null}</section> : null}

    {clientProgress ? <section className="panel client-progress-panel"><div className="panel-heading"><div className="icon-tile"><Route size={18} /></div><div><span className="eyebrow">ПРОГРЕСС ЗАЯВКИ</span><h2>Этапы заявки</h2></div></div><ol className="client-milestone-list" aria-label="Этапы заявки" style={{ gridTemplateColumns: `repeat(${clientProgress.plan.length}, minmax(0, 1fr))` }}>{clientProgress.plan.map((item, index) => {
      const done = clientProgress.completed || index < clientProgress.activeIndex;
      const current = !clientProgress.completed && index === clientProgress.activeIndex;
      return <li className={`client-milestone${done ? " done" : ""}${current ? " current" : ""}${current && clientProgress.paused ? " attention" : ""}`} aria-current={current ? "step" : undefined} key={item.label}><span className="client-milestone-marker">{done ? <CheckCircle2 size={15} /> : String(index + 1).padStart(2, "0")}</span><strong>{item.label}</strong><small>{done ? "Готово" : current ? status.label : ""}</small></li>;
    })}</ol><p className="client-milestone-summary">{clientProgress.completed ? "Все этапы завершены." : clientProgress.cancelled ? "Заявка отменена." : clientProgress.paused ? `Заявка ${status.label.toLowerCase()}.` : <>Сейчас — <strong>{clientProgress.plan[clientProgress.activeIndex].label}</strong>{clientProgress.nextMilestone ? <> · Далее — <strong>{clientProgress.nextMilestone}</strong></> : null}</>}</p></section> : null}

    <div className="order-detail-grid">
      {role === "WAREHOUSE" && allowed.includes("AT_WAREHOUSE") ? <section className="panel warehouse-intake-panel"><div className="panel-heading"><div className="icon-tile"><Package size={18} /></div><div><span className="eyebrow">СКЛАД · ПРИЁМКА</span><h2>Сверка груза</h2></div></div><WarehouseIntakeForm orderId={detail.order.id} expectedPlaces={expectedPlaces} expectedWeight={expectedWeight} preview={preview} /></section> : null}
      {role === "WAREHOUSE" && outboundDispatchRequired ? <section className="panel warehouse-intake-panel"><div className="panel-heading"><div className="icon-tile"><Package size={18} /></div><div><span className="eyebrow">СКЛАД · ВЫДАЧА</span><h2>{releaseOperation ? "Выдача оформлена" : "Передача груза"}</h2></div></div>{releaseOperation ? <p className="warehouse-release-complete">{releaseOperation.resultText || "Выдача по заявке записана в журнал."}</p> : <WarehouseReleaseForm orderId={detail.order.id} quantity={releasePlaces} driverName={detail.driverName} vehicleName={detail.vehicleName} vehiclePlateNumber={detail.vehiclePlateNumber} preview={preview} />}</section> : null}
      <section className="panel"><div className="panel-heading"><div className="icon-tile"><Route size={18} /></div><div><span className="eyebrow">МАРШРУТ</span><h2>Точки маршрута</h2></div></div><div className="route-timeline">{detail.points.map((point, index) => <div className="route-point" key={point.id}><span className="route-point-index">{String(index + 1).padStart(2, "0")}</span><div><strong>{point.label || point.type}</strong><p>{point.addressText}</p>{point.plannedAt ? <small>План: {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(point.plannedAt)}</small> : null}{point.completedAt ? <small className="route-complete">Выполнено: {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(point.completedAt)}</small> : null}{point.contactName || point.contactPhone ? <small>{point.contactName ? point.contactName : null}{point.contactName && point.contactPhone ? " · " : null}{point.contactPhone ? <a className="route-phone" href={`tel:${point.contactPhone.replace(/[^\d+]/g, "")}`}>{point.contactPhone}</a> : null}</small> : null}<a className="map-link" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.addressText)}`} target="_blank" rel="noreferrer">Открыть на карте</a></div></div>)}</div></section>
      <section className="panel"><div className="panel-heading"><div className="icon-tile"><Package size={18} /></div><div><span className="eyebrow">ГРУЗ</span><h2>{detail.cargo.length} позиции</h2></div></div><div className="cargo-list">{detail.cargo.map((item) => <article className="cargo-row" key={item.id}><strong>{item.title}</strong><span>{item.places ?? item.quantity} {item.unit || "мест"}{item.weightKg ? ` · ${item.weightKg} кг` : ""}</span>{item.description ? <p>{item.description}</p> : null}</article>)}</div></section>
      {detail.serviceLines.length ? <section className="panel"><div className="panel-heading"><div className="icon-tile"><Boxes size={18} /></div><div><span className="eyebrow">УСЛУГИ</span><h2>Заказанные операции</h2></div></div><div className="service-detail-list">{detail.serviceLines.map(({ line, serviceName, serviceUnit }) => <article className="service-detail-row" key={line.id}><span className={line.isCompleted ? "service-detail-state complete" : "service-detail-state"}>{line.isCompleted ? <CheckCircle2 size={17} /> : <Circle size={17} />}</span><div><strong>{serviceName}</strong><small>{line.quantity} {serviceUnit || "усл."} · {line.isCompleted ? "Выполнена" : "Ожидает обработки"}</small></div>{role === "WAREHOUSE" && detail.order.status === "WAREHOUSE_PROCESSING" ? <form action={toggleOrderServiceAction}><input type="hidden" name="orderId" value={detail.order.id} /><input type="hidden" name="serviceId" value={line.serviceId} /><input type="hidden" name="completed" value={String(!line.isCompleted)} /><button className="table-action" type="submit" disabled={preview}>{line.isCompleted ? "Вернуть в список" : "Отметить выполненной"}</button></form> : null}</article>)}</div></section> : null}
      {role === "WAREHOUSE" && detail.order.status === "WAREHOUSE_PROCESSING" ? <section className="panel warehouse-intake-panel"><div className="panel-heading"><div className="icon-tile"><Boxes size={18} /></div><div><span className="eyebrow">СКЛАД · ОБРАБОТКА</span><h2>Зафиксировать операцию</h2></div></div><WarehouseOperationForm orderId={detail.order.id} preview={preview} /></section> : null}
      {role === "WAREHOUSE" || detail.operations.length > 0 ? <section className="panel"><div className="panel-heading"><div className="icon-tile"><Boxes size={18} /></div><div><span className="eyebrow">СКЛАДСКОЙ ЖУРНАЛ</span><h2>Операции</h2></div></div><div className="history-list">{detail.operations.map(({ operation, operatorName }) => <article className="history-row" key={operation.id}><span className="history-marker" /><div><strong>{warehouseOperationLabels[operation.operationType] ?? operation.operationType.replaceAll("_", " ").toLowerCase()}</strong><p>{operation.resultText || "Операция выполнена"}</p>{operation.notes ? <p className="warehouse-operation-notes">{operation.notes}</p> : null}{operation.quantity !== null || operation.weightKg !== null ? <small>Зафиксировано: {operation.quantity === null ? "—" : `${operation.quantity} мест`}{operation.weightKg === null ? "" : ` · ${operation.weightKg.toLocaleString("ru-RU")} кг`}</small> : null}<small>{operatorName} · {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(operation.performedAt)}</small>{detail.files.filter((file) => file.warehouseOperationId === operation.id).map((file) => <a className="warehouse-operation-attachment" href={preview ? file.category === "WAREHOUSE_PHOTO" ? "/demo/warehouse-placeholder.svg" : "/demo/cargo-placeholder.svg" : `/api/attachments/${file.id}`} target={preview ? undefined : "_blank"} rel={preview ? undefined : "noreferrer"} key={file.id}><FileText size={13} /> {file.filename}</a>)}</div></article>)}{!detail.operations.length ? <p className="muted-copy">Складские операции появятся после приёмки груза.</p> : null}</div></section> : null}
      {canViewFinance ? <section className="panel"><div className="panel-heading"><div className="icon-tile"><Wallet size={18} /></div><div><span className="eyebrow">РАСЧЁТ</span><h2>Стоимость заявки</h2></div></div><div className="finance-total">{formatMoney(detail.order.total, detail.order.currency)}</div><div className="price-breakdown"><span>Перевозка <b>{formatMoney(detail.order.subtotal, detail.order.currency)}</b></span><span>Услуги <b>{formatMoney(detail.order.servicesTotal, detail.order.currency)}</b></span>{detail.serviceLines.map(({ line, serviceName, serviceUnit }) => <span className="price-service" key={line.id}>{serviceName} · {line.quantity} {serviceUnit || "усл."} <b>{formatMoney(line.totalPrice, detail.order.currency)}</b></span>)}<span>Страхование <b>{formatMoney(detail.order.insuranceTotal, detail.order.currency)}</b></span><span>Скидка и налог <b>{formatMoney(detail.order.taxTotal - detail.order.discountTotal, detail.order.currency)}</b></span></div>{role === "MANAGER" || role === "ADMIN" ? <form action={updateOrderPricingAction} className="pricing-form"><input type="hidden" name="orderId" value={detail.order.id} />{([["subtotal", "Перевозка", detail.order.subtotal], ["servicesTotal", "Услуги", detail.order.servicesTotal], ["insuranceTotal", "Страхование", detail.order.insuranceTotal], ["discountTotal", "Скидка", detail.order.discountTotal], ["taxTotal", "Налог", detail.order.taxTotal]] as const).map(([name, label, value]) => <label key={name}>{label}<input type="number" name={name} min="0" step="0.01" defaultValue={value} /></label>)}<button className="button button-secondary" type="submit" disabled={preview}>Сохранить расчёт</button></form> : <p className="muted-copy">Расчёт подготовлен менеджером.</p>}</section> : null}
      <section className="panel"><div className="panel-heading"><div className="icon-tile"><MapPin size={18} /></div><div><span className="eyebrow">ИСТОРИЯ</span><h2>Изменения статуса</h2></div></div><div className="history-list">{detail.history.map((item) => <article className="history-row" key={item.id}><span className="history-marker" /><div><strong>{orderStatusConfig[item.toStatus].label}</strong>{item.note ? <p>{item.note}</p> : null}<small>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(item.createdAt)}</small></div></article>)}</div></section>
      <section className="panel comments-panel" id="order-comments"><div className="panel-heading"><div className="icon-tile"><Package size={18} /></div><div><span className="eyebrow">ОБСУЖДЕНИЕ</span><h2>Комментарии</h2></div></div><div className="comment-list">{detail.comments.map(({ comment, authorName }) => <article className="comment-row" key={comment.id}><strong>{authorName}<small>{comment.scope === "INTERNAL" ? " · внутренний" : " · виден клиенту"}</small></strong><p>{comment.body}</p><time>{new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(comment.createdAt)}</time></article>)}{!detail.comments.length ? <p className="muted-copy">Пока нет комментариев по заявке.</p> : null}</div><form action={addOrderCommentAction} className="comment-form"><input type="hidden" name="orderId" value={detail.order.id} /><textarea name="body" placeholder="Напишите комментарий к заявке" maxLength={2000} required rows={3} />{role === "MANAGER" || role === "ADMIN" ? <select name="scope" defaultValue="CLIENT_VISIBLE"><option value="CLIENT_VISIBLE">Виден клиенту</option><option value="INTERNAL">Внутренний</option></select> : <input type="hidden" name="scope" value="CLIENT_VISIBLE" />}<button className="button button-secondary" type="submit" disabled={preview}>Добавить комментарий</button></form></section>
      <AttachmentSection detail={detail} role={role} preview={preview} />
    </div>
  </div>;
}

