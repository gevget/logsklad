"use client";

import Link from "next/link";
import { useActionState } from "react";
import { CalendarDays, Mail, MapPin, Phone, Truck, UserRound } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import { toggleDirectoryActiveAction, updateAdminDriverAction, type AdminUserUpdateState } from "@/features/admin/actions";
import type { AdminDriverDetail } from "@/features/admin/queries";

const initialDriverUpdateState: AdminUserUpdateState = { status: "idle", message: "" };

export function AdminDriverView({ detail, preview = false }: { detail: AdminDriverDetail; preview?: boolean }) {
  const [state, formAction, pending] = useActionState(updateAdminDriverAction, initialDriverUpdateState);
  const hasAssignments = detail.assignments.length > 0;

  return <>
    <Link className="admin-user-back" href="/admin/drivers">← Все водители</Link>
    <div className="admin-driver-layout">
      <section className="panel admin-user-form-panel">
        <div className="panel-heading"><div className="icon-tile"><UserRound size={18} /></div><div><span className="eyebrow">ПРОФИЛЬ ВОДИТЕЛЯ</span><h2>Контакты и доступность</h2></div></div>
        <p className="admin-user-intro">Контактные данные и удостоверение нужны для назначения и связи по рейсу.</p>
        <form action={formAction} className="admin-user-form">
          <input type="hidden" name="id" value={detail.user.id} />
          <div className="admin-user-fields">
            <label className="wizard-field"><span>Имя и фамилия</span><input name="name" defaultValue={detail.user.name} required maxLength={180} autoComplete="name" /></label>
            <label className="wizard-field"><span>Телефон</span><input name="phone" type="tel" defaultValue={detail.user.phone ?? ""} maxLength={40} autoComplete="tel" /></label>
            <label className="wizard-field"><span>Номер водительского удостоверения</span><input name="licenseNumber" defaultValue={detail.profile?.licenseNumber ?? ""} maxLength={80} /></label>
            <label className="wizard-field"><span>Доступность для назначений</span><select name="isAvailable" defaultValue={String(detail.profile?.isAvailable ?? !hasAssignments)}><option value="true" disabled={hasAssignments}>Доступен</option><option value="false">Занят или недоступен</option></select><small>{hasAssignments ? "Есть активные заявки. Водителя нельзя отметить доступным до их завершения." : "Доступность учитывается при планировании рейса."}</small></label>
            <label className="wizard-field full-field"><span>Рабочая заметка</span><textarea name="notes" rows={3} maxLength={1000} defaultValue={detail.profile?.notes ?? ""} placeholder="Например, допуск на складской комплекс" /></label>
          </div>
          {state.message ? <p className={`admin-user-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
          {preview ? <p className="admin-user-preview-note">Поля можно изучать и заполнять. В режиме просмотра дизайна изменения не сохраняются.</p> : null}
          <div className="admin-user-form-actions"><span>Изменения профиля записываются в журнал действий.</span><button className="button button-primary" type="submit" disabled={preview || pending}>{pending ? "Сохраняем…" : "Сохранить изменения"}</button></div>
        </form>
      </section>

      <aside className="admin-driver-side">
        <section className="panel admin-driver-account">
          <div className="admin-driver-avatar">{detail.user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("ru-RU")}</div>
          <strong>{detail.user.name}</strong>
          <span>{detail.user.email}</span>
          <span className={`admin-state-pill ${detail.user.isActive ? "active" : "inactive"}`}>{detail.user.isActive ? "Активен" : "Отключён"}</span>
          <div className="admin-driver-contact"><div><Phone size={14} />{detail.user.phone || "Телефон не указан"}</div><div><Mail size={14} />{detail.user.email}</div></div>
          <form action={toggleDirectoryActiveAction} className="admin-company-toggle"><input type="hidden" name="section" value="drivers" /><input type="hidden" name="id" value={detail.user.id} /><input type="hidden" name="active" value={String(!detail.user.isActive)} /><button className="table-action" type="submit" disabled={preview}>{detail.user.isActive ? "Отключить водителя" : "Включить водителя"}</button></form>
          <p>Назначения сохраняются в истории заявок.</p>
        </section>

        <section className="panel admin-driver-assignments">
          <div className="panel-heading"><div className="icon-tile"><Truck size={17} /></div><div><span className="eyebrow">ТЕКУЩАЯ РАБОТА</span><h2>Назначения · {detail.assignments.length}</h2></div></div>
          {hasAssignments ? <div className="admin-driver-job-list">{detail.assignments.map((assignment) => <Link className="admin-driver-job" href={`/admin/orders/${assignment.id}`} key={assignment.id}>
            <span className="admin-driver-job-top"><strong>{assignment.number}</strong><small>{orderStatusConfig[assignment.status].label}</small></span>
            <span className="admin-driver-job-title">{assignment.title || "Логистическая заявка"}</span>
            <span className="admin-driver-job-meta"><Truck size={13} />{assignment.vehicleName ? `${assignment.vehicleName}${assignment.plateNumber ? ` · ${assignment.plateNumber}` : ""}` : "Транспорт не назначен"}</span>
            {assignment.plannedPickupAt || assignment.plannedDeliveryAt ? <span className="admin-driver-job-meta"><CalendarDays size={13} />{formatSchedule(assignment.plannedPickupAt, assignment.plannedDeliveryAt)}</span> : null}
          </Link>)}</div> : <div className="admin-driver-empty"><MapPin size={18} /><strong>Активных назначений нет</strong><span>Водитель появится в подборе после активации.</span></div>}
          {detail.profile?.licenseNumber ? <div className="admin-driver-license"><span>Удостоверение</span><strong>{detail.profile.licenseNumber}</strong></div> : null}
        </section>
      </aside>
    </div>
  </>;
}

function formatSchedule(pickup: Date | null, delivery: Date | null) {
  const format = (value: Date) => new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(value);
  if (pickup && delivery) return `${format(pickup)} — ${format(delivery)}`;
  return pickup ? `Забор · ${format(pickup)}` : `Доставка · ${format(delivery!)}`;
}
