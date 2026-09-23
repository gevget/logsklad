"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Building2, FileText, ShieldCheck, UsersRound } from "lucide-react";
import { toggleDirectoryActiveAction, upsertAdminCompanyAction, type AdminCompanyUpdateState } from "@/features/admin/actions";
import type { AdminCompanyDetail } from "@/features/admin/queries";
import type { User } from "@/db/schema";
import { orderStatusConfig } from "@/config/order-status";

const initialCompanyUpdateState: AdminCompanyUpdateState = { status: "idle", message: "" };

export function AdminCompanyView({ detail, preview = false }: { detail: AdminCompanyDetail | null; preview?: boolean }) {
  const company = detail?.company ?? null;
  const [state, formAction, pending] = useActionState(upsertAdminCompanyAction, initialCompanyUpdateState);
  const isNew = !company;

  return <>
    <Link className="admin-user-back" href="/admin/companies">← Все компании</Link>
    <div className="admin-company-layout">
      <section className="panel admin-user-form-panel">
        <div className="panel-heading">
          <div className="icon-tile"><Building2 size={18} /></div>
          <div><span className="eyebrow">{isNew ? "НОВАЯ ЗАПИСЬ" : "КАРТОЧКА КОМПАНИИ"}</span><h2>{isNew ? "Данные компании" : "Реквизиты и контакты"}</h2></div>
        </div>
        <p className="admin-user-intro">Название и контактные данные используются в заявках и документах компании.</p>

        <form action={formAction} className="admin-user-form">
          <input type="hidden" name="id" value={company?.id ?? ""} />
          <div className="admin-user-fields">
            <label className="wizard-field"><span>Краткое название</span><input name="displayName" defaultValue={company?.displayName ?? ""} required maxLength={240} autoComplete="organization" /></label>
            <label className="wizard-field"><span>Юридическое название</span><input name="legalName" defaultValue={company?.legalName ?? ""} maxLength={300} autoComplete="organization-title" /></label>
            <label className="wizard-field"><span>ИНН</span><input name="inn" defaultValue={company?.inn ?? ""} inputMode="numeric" pattern="\d{10}|\d{12}" maxLength={12} /></label>
            <label className="wizard-field"><span>Email для связи</span><input name="email" type="email" defaultValue={company?.email ?? ""} maxLength={320} autoComplete="email" /></label>
            <label className="wizard-field"><span>Телефон</span><input name="phone" type="tel" defaultValue={company?.phone ?? ""} maxLength={40} autoComplete="tel" /></label>
          </div>

          {state.message ? <p className={`admin-user-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}{state.status === "success" && state.companyId && isNew ? <> <Link className="text-link" href={`/admin/companies/${state.companyId}`}>Открыть карточку</Link></> : null}</p> : null}
          {preview ? <p className="admin-user-preview-note">Поля можно изучать и заполнять. В режиме просмотра дизайна изменения не сохраняются.</p> : null}
          <div className="admin-user-form-actions"><span>Реквизиты сохраняются в истории действий.</span><button className="button button-primary" type="submit" disabled={preview || pending}>{pending ? "Сохраняем…" : isNew ? "Создать компанию" : "Сохранить изменения"}</button></div>
        </form>
      </section>

      {detail ? <CompanyConnections detail={detail} preview={preview} /> : <aside className="panel admin-company-aside">
        <div className="icon-tile"><ShieldCheck size={18} /></div><h2>Доступ компании</h2>
        <p>После создания к компании можно привязать пользователей с ролью «Заказчик» и открывать её заявки из этой карточки.</p>
        <div className="admin-company-aside-note"><UsersRound size={15} /><span>Историю заявок и пользователей можно будет открыть здесь.</span></div>
      </aside>}
    </div>
  </>;
}

function CompanyConnections({ detail, preview }: { detail: AdminCompanyDetail; preview: boolean }) {
  const { company } = detail;
  return <aside className="admin-company-side">
    <section className="panel admin-company-status-panel">
      <div className="admin-company-status-heading"><span className="admin-company-icon"><Building2 size={16} /></span><div><span className="eyebrow">СОСТОЯНИЕ</span><strong>{company.displayName}</strong></div></div>
      <span className={`admin-state-pill ${company.isActive ? "active" : "inactive"}`}>{company.isActive ? "Активна" : "Отключена"}</span>
      <form action={toggleDirectoryActiveAction} className="admin-company-toggle"><input type="hidden" name="section" value="companies" /><input type="hidden" name="id" value={company.id} /><input type="hidden" name="active" value={String(!company.isActive)} /><button className="table-action" type="submit" disabled={preview}>{company.isActive ? "Отключить компанию" : "Включить компанию"}</button></form>
      <p>Отключение не удаляет историю и уже созданные заявки.</p>
    </section>

    <section className="panel admin-company-relations">
      <div className="panel-heading"><div className="icon-tile"><UsersRound size={17} /></div><div><span className="eyebrow">ДОСТУП</span><h2>Пользователи · {detail.users.length}</h2></div></div>
      {detail.users.length ? <div className="admin-company-link-list">{detail.users.map((user) => <CompanyUserRow user={user} key={user.id} />)}</div> : <p className="admin-company-empty">К этой компании ещё не привязаны пользователи.</p>}
      <Link className="text-link admin-company-all-link" href="/admin/users">Все пользователи</Link>
    </section>

    <section className="panel admin-company-relations">
      <div className="panel-heading"><div className="icon-tile"><FileText size={17} /></div><div><span className="eyebrow">ПЕРЕВОЗКИ</span><h2>Заявки · {detail.orderCount}</h2></div></div>
      {detail.orders.length ? <div className="admin-company-link-list">{detail.orders.map((order) => <Link className="admin-company-order-row" href={`/admin/orders/${order.id}`} key={order.id}><span><strong>{order.number}</strong><small>{order.title || "Логистическая заявка"}</small></span><small className="admin-company-order-status">{orderStatusConfig[order.status].label}</small></Link>)}</div> : <p className="admin-company-empty">У компании пока нет заявок.</p>}
      <Link className="text-link admin-company-all-link" href="/admin/orders">Все заявки</Link>
    </section>
  </aside>;
}

function CompanyUserRow({ user }: { user: Pick<User, "id" | "name" | "email" | "role" | "isActive"> }) {
  return <Link className="admin-company-user-row" href={`/admin/users/${user.id}`}><span className="admin-company-user-initials">{user.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("ru-RU")}</span><span className="admin-company-user-copy"><strong>{user.name}</strong><small>{user.email} · {roleLabel(user.role)}</small></span><span className={`admin-company-user-state ${user.isActive ? "active" : "inactive"}`} aria-label={user.isActive ? "Активен" : "Отключён"} /></Link>;
}

function roleLabel(role: User["role"]) {
  return ({ CLIENT: "Заказчик", MANAGER: "Менеджер", DRIVER: "Водитель", WAREHOUSE: "Склад", ADMIN: "Администратор" } as const)[role];
}
