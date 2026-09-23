import Link from "next/link";
import { ArrowLeft, ArrowUpRight, Camera, CheckCircle2, CircleAlert, Package, Phone, Route, Truck } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import { changeOrderStatusAction } from "@/features/orders/actions";
import { uploadOrderAttachmentAction } from "@/features/files/actions";
import { getAllowedTransitions } from "@/features/orders/services/order-status-machine";
import type { OrderDetails } from "@/features/orders/queries";
import { DriverActionForm } from "@/components/driver/driver-action-form";

function getDriverAction(status: OrderDetails["order"]["status"], allowed: string[]) {
  if (status === "READY_FOR_DELIVERY" && allowed.includes("DELIVERY_IN_PROGRESS")) return { nextStatus: "DELIVERY_IN_PROGRESS", label: "Начать доставку" };
  if (status === "DRIVER_ASSIGNED" && allowed.includes("PICKUP_IN_PROGRESS")) return { nextStatus: "PICKUP_IN_PROGRESS", label: "Начать движение" };
  if (status === "PICKUP_IN_PROGRESS" && allowed.includes("PICKED_UP")) return { nextStatus: "PICKED_UP", label: "Подтвердить, что груз забран", confirmMessage: "Подтвердить, что груз забран у поставщика?" };
  if (status === "PICKED_UP" && allowed.includes("DELIVERY_IN_PROGRESS")) return { nextStatus: "DELIVERY_IN_PROGRESS", label: "Начать доставку" };
  if (status === "DELIVERY_IN_PROGRESS" && allowed.includes("DELIVERED")) return { nextStatus: "DELIVERED", label: "Подтвердить доставку", confirmMessage: "Отметить груз доставленным получателю?" };
  return null;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium", timeStyle: "short" }).format(value);
}

export async function DriverJobView({ detail, preview = false }: { detail: OrderDetails; preview?: boolean }) {
  const allowed = await getAllowedTransitions(detail.order);
  const action = getDriverAction(detail.order.status, allowed);
  const hasDeliveryProof = detail.files.some((file) => file.category === "PROOF_OF_DELIVERY" && file.visibility === "CLIENT");
  const nextPoint = detail.points.find((point) => !point.completedAt);
  const status = orderStatusConfig[detail.order.status];
  const isWaitingForWarehouse = detail.order.status === "PICKED_UP" && !action && ["PICKUP_TO_WAREHOUSE", "WAREHOUSE_INTAKE", "WAREHOUSE_SERVICE"].includes(detail.order.type);
  const canReportIssue = allowed.includes("ISSUE");

  return <div className="page-stack driver-job-page">
    <Link className="back-link" href="/driver/jobs"><ArrowLeft size={15} /> Все задания</Link>

    <section className="panel driver-job-hero">
      <div className="driver-job-heading">
        <div><span className="eyebrow">{detail.order.number} · {detail.order.type.replaceAll("_", " ")}</span><h2>{detail.order.title || "Задание на перевозку"}</h2><p>{detail.companyName} · создана {new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(detail.order.createdAt)}</p></div>
        <span className={`status-pill status-${status.tone}`}><span className="status-dot" />{status.label}</span>
      </div>
      {detail.order.description ? <p className="driver-job-description">{detail.order.description}</p> : null}
    </section>

    <div className="driver-action-sticky">
      {action ? <div className="panel driver-next-action">
        <div className="driver-next-action-copy"><span className="eyebrow">СЛЕДУЮЩИЙ ШАГ</span><strong>{action.label}</strong><span>{nextPoint?.addressText ?? "Продолжайте маршрут по заданию"}</span></div>
        <div className="driver-next-action-controls">
          {action.nextStatus === "DELIVERED" && !hasDeliveryProof ? <p className="driver-proof-reminder">Сначала <a href="#driver-proof-upload">добавьте подтверждение доставки</a>.</p> : null}
          <DriverActionForm orderId={detail.order.id} nextStatus={action.nextStatus} label={action.label} confirmMessage={action.confirmMessage} disabled={preview || (action.nextStatus === "DELIVERED" && !hasDeliveryProof)} />
        </div>
      </div> : isWaitingForWarehouse ? <div className="panel driver-waiting-card"><div className="driver-waiting-icon"><CheckCircle2 size={19} /></div><div><span className="eyebrow">СЛЕДУЮЩИЙ ШАГ</span><strong>Передайте груз на склад</strong><p>Приёмку подтвердит сотрудник склада. После этого задание обновится.</p></div></div> : null}
    </div>

    <div className="driver-job-grid">
      <div className="driver-job-main">
        <section className="panel driver-route-panel">
          <div className="panel-heading"><div className="icon-tile"><Route size={18} /></div><div><span className="eyebrow">МАРШРУТ</span><h2>Точки задания</h2></div></div>
          <div className="driver-route-list">{detail.points.map((point, index) => <article className="driver-route-stop" key={point.id}>
            <span className={`driver-stop-marker${point.completedAt ? " complete" : ""}`}>{point.completedAt ? <CheckCircle2 size={16} /> : index + 1}</span>
            <div className="driver-stop-content"><div className="driver-stop-heading"><strong>{point.label || point.type}</strong><span>{point.completedAt ? "Выполнено" : point.plannedAt ? formatDate(point.plannedAt) : "По маршруту"}</span></div>
              <p>{point.addressText}</p>
              {point.contactName ? <small>{point.contactName}</small> : null}
              <div className="driver-stop-actions">
                {point.contactPhone ? <a className="driver-contact-button" href={`tel:${point.contactPhone.replace(/[^\d+]/g, "")}`}><Phone size={15} /> {point.contactPhone}</a> : null}
                <a className="driver-map-button" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(point.addressText)}`} target="_blank" rel="noreferrer">Открыть карту <ArrowUpRight size={14} /></a>
              </div>
            </div>
          </article>)}</div>
        </section>

        <section className="panel driver-cargo-panel">
          <div className="panel-heading"><div className="icon-tile"><Package size={18} /></div><div><span className="eyebrow">ГРУЗ</span><h2>{detail.cargo.length} {detail.cargo.length === 1 ? "позиция" : "позиции"}</h2></div></div>
          <div className="driver-cargo-list">{detail.cargo.map((item) => <article className="driver-cargo-row" key={item.id}><div><strong>{item.title}</strong>{item.description ? <p>{item.description}</p> : null}</div><span>{item.places ?? item.quantity} {item.unit || "мест"}{item.weightKg ? ` · ${item.weightKg.toLocaleString("ru-RU")} кг` : ""}</span></article>)}</div>
        </section>
      </div>

      <aside className="driver-job-side">
        <section className="panel driver-photo-panel">
          <div className="panel-heading"><div className="icon-tile"><Camera size={18} /></div><div><span className="eyebrow">ФОТО И ПОДТВЕРЖДЕНИЯ</span><h2>Состояние груза</h2></div></div>
          <div className="driver-photo-list">{detail.files.map((file) => <a className="driver-photo-row" href={preview ? "/demo/cargo-placeholder.svg" : `/api/attachments/${file.id}`} key={file.id}><span className="driver-photo-thumbnail"><Camera size={16} /></span><span><strong>{file.filename}</strong><small>{file.category === "PROOF_OF_DELIVERY" ? "Подтверждение доставки" : "Фото груза"}</small></span><ArrowUpRight size={15} /></a>)}{!detail.files.length ? <p className="muted-copy">Добавьте фото груза или документов по ходу рейса.</p> : null}</div>
          <form action={uploadOrderAttachmentAction} className="driver-photo-form" id="driver-proof-upload"><input type="hidden" name="orderId" value={detail.order.id} /><label><span>{detail.order.status === "DELIVERY_IN_PROGRESS" ? "Подтверждение доставки" : "Добавить фото"}</span><input type="file" name="file" accept="image/jpeg,image/png,image/webp,application/pdf" capture="environment" required disabled={preview} /></label><input type="hidden" name="category" value={detail.order.status === "DELIVERY_IN_PROGRESS" ? "PROOF_OF_DELIVERY" : "CARGO_PHOTO"} /><button className="button button-secondary" type="submit" disabled={preview}><Camera size={15} />{detail.order.status === "DELIVERY_IN_PROGRESS" ? "Сохранить подтверждение" : "Сохранить фото"}</button></form>
        </section>

        <section className="panel driver-history-panel">
          <div className="panel-heading"><div className="icon-tile"><Truck size={18} /></div><div><span className="eyebrow">ИСТОРИЯ РЕЙСА</span><h2>Последние изменения</h2></div></div>
          <div className="driver-history-list">{[...detail.history].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 4).map((item) => <article className="driver-history-row" key={item.id}><span className="driver-history-marker" /><div><strong>{orderStatusConfig[item.toStatus].label}</strong>{item.note ? <p>{item.note}</p> : null}<small>{formatDate(item.createdAt)}</small></div></article>)}</div>
        </section>

        {canReportIssue ? <section className="panel driver-issue-panel"><div className="driver-issue-heading"><CircleAlert size={18} /><div><strong>Возникла проблема?</strong><span>Менеджер получит уведомление и свяжется с вами.</span></div></div><form action={changeOrderStatusAction} className="driver-issue-form"><input type="hidden" name="orderId" value={detail.order.id} /><input type="hidden" name="nextStatus" value="ISSUE" /><label htmlFor="driver-issue-note">Что произошло</label><textarea id="driver-issue-note" name="note" maxLength={1000} placeholder="Например: поставщик задерживает погрузку" rows={3} required disabled={preview} /><button className="button button-secondary" type="submit" disabled={preview}>Сообщить о проблеме</button></form></section> : null}
      </aside>
    </div>
  </div>;
}
