"use client";

import Link from "next/link";
import { useActionState, useState, type FormEvent } from "react";
import { Building2, CircleUserRound, Mail, Phone, ShieldCheck } from "lucide-react";
import { updateAdminUserAction, type AdminUserUpdateState } from "@/features/admin/actions";
import type { AdminUserDetail } from "@/features/admin/queries";

const initialAdminUserUpdateState: AdminUserUpdateState = { status: "idle", message: "" };

const roleOptions = [
  { value: "CLIENT", label: "Заказчик" },
  { value: "MANAGER", label: "Менеджер" },
  { value: "DRIVER", label: "Водитель" },
  { value: "WAREHOUSE", label: "Склад" },
  { value: "ADMIN", label: "Администратор" },
] as const;

export function AdminUserDetailView({ detail, actorId, preview = false }: { detail: AdminUserDetail; actorId: string; preview?: boolean }) {
  const [state, formAction, pending] = useActionState(updateAdminUserAction, initialAdminUserUpdateState);
  const [role, setRole] = useState<AdminUserDetail["user"]["role"]>(detail.user.role);
  const isSelf = detail.user.id === actorId;

  function confirmRoleChange(event: FormEvent<HTMLFormElement>) {
    if (role === detail.user.role) return;
    if (isSelf || !window.confirm(`Изменить роль пользователя с «${roleLabel(detail.user.role)}» на «${roleLabel(role)}»? Новые права доступа начнут действовать сразу.`)) {
      event.preventDefault();
    }
  }

  return <>
    <Link className="admin-user-back" href="/admin/users">← Все пользователи</Link>
    <div className="admin-user-layout">
      <section className="panel admin-user-form-panel">
        <div className="panel-heading">
          <div className="icon-tile"><CircleUserRound size={18} /></div>
          <div><span className="eyebrow">УЧЁТНАЯ ЗАПИСЬ</span><h2>Данные пользователя</h2></div>
        </div>
        <p className="admin-user-intro">Контакты, роль и привязка к компании определяют доступ пользователя к рабочим разделам.</p>

        <form action={formAction} className="admin-user-form" onSubmit={confirmRoleChange}>
          <input type="hidden" name="id" value={detail.user.id} />
          {isSelf ? <><input type="hidden" name="email" value={detail.user.email} /><input type="hidden" name="role" value={detail.user.role} /></> : null}
          <div className="admin-user-fields">
            <label className="wizard-field"><span>Имя и фамилия</span><input name="name" autoComplete="name" defaultValue={detail.user.name} required maxLength={180} /></label>
            <label className="wizard-field"><span>Email</span><input name="email" type="email" autoComplete="email" defaultValue={detail.user.email} required maxLength={320} disabled={isSelf} /><small>{isSelf ? "Email текущей демо-учётной записи закреплён за входом." : "На этот адрес будут приходить уведомления."}</small></label>
            <label className="wizard-field"><span>Телефон</span><input name="phone" type="tel" autoComplete="tel" defaultValue={detail.user.phone ?? ""} maxLength={40} /></label>
          </div>

          <div className="admin-user-access">
            <div><span className="eyebrow">ДОСТУП</span><h3>Роль и компания</h3><p>Для роли заказчика нужно выбрать компанию.</p></div>
            <div className="admin-user-fields">
              <label className="wizard-field"><span>Роль</span><select name="role" value={role} onChange={(event) => setRole(event.target.value as AdminUserDetail["user"]["role"])} disabled={isSelf}>{roleOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><small>{isSelf ? "Нельзя менять роль учётной записи, под которой вы вошли." : role === "CLIENT" ? "Заказчик увидит заявки своей компании." : "Доступ зависит от обязанностей пользователя."}</small></label>
              {role === "CLIENT" ? <label className="wizard-field"><span>Компания</span><select name="companyId" defaultValue={detail.user.companyId ?? ""} required><option value="" disabled>Выберите компанию</option>{detail.companies.map((company) => <option key={company.id} value={company.id} disabled={!company.isActive && company.id !== detail.user.companyId}>{company.displayName}{company.isActive ? "" : " · отключена"}</option>)}</select></label> : null}
            </div>
          </div>

          {state.message ? <p className={`admin-user-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}</p> : null}
          {preview ? <p className="admin-user-preview-note">В просмотре дизайна поля доступны для изучения, но сохранить изменения нельзя.</p> : null}
          {isSelf && role !== detail.user.role ? <p className="admin-user-preview-note">Для собственной учётной записи смена роли отключена.</p> : null}
          <div className="admin-user-form-actions"><span>Смена роли попадёт в журнал действий.</span><button className="button button-primary" type="submit" disabled={preview || pending}>{pending ? "Сохраняем…" : "Сохранить изменения"}</button></div>
        </form>
      </section>

      <aside className="panel admin-user-summary">
        <div className="admin-user-avatar" aria-hidden="true">{initials(detail.user.name)}</div>
        <div className="admin-user-summary-name"><strong>{detail.user.name}</strong><span>{roleLabel(detail.user.role)}</span></div>
        <div className="admin-user-state-row"><span className={`admin-state-pill ${detail.user.isActive ? "active" : "inactive"}`}>{detail.user.isActive ? "Активен" : "Отключён"}</span><span className="admin-user-role-pill"><ShieldCheck size={13} /> {roleLabel(detail.user.role)}</span></div>

        <div className="admin-user-contact-list">
          <div><Mail size={15} /><span>{detail.user.email}</span></div>
          <div><Phone size={15} /><span>{detail.user.phone || "Телефон не указан"}</span></div>
        </div>

        {detail.user.role === "CLIENT" ? <div className="admin-user-company">
          <div className="admin-user-company-title"><Building2 size={15} /><strong>Компания</strong></div>
          {detail.company ? <><span>{detail.company.displayName}</span>{detail.company.legalName ? <small>{detail.company.legalName}</small> : null}{detail.company.inn ? <small>ИНН {detail.company.inn}</small> : null}{!detail.company.isActive ? <small className="admin-user-company-warning">Компания отключена</small> : null}</> : <span>Компания не привязана</span>}
        </div> : null}

        <dl className="admin-user-meta"><div><dt>Добавлен</dt><dd>{formatDate(detail.user.createdAt)}</dd></div><div><dt>Обновлён</dt><dd>{formatDate(detail.user.updatedAt)}</dd></div></dl>
        <p className="admin-user-status-help">Аккаунт можно включить или отключить в списке пользователей.</p>
      </aside>
    </div>
  </>;
}

function roleLabel(role: AdminUserDetail["user"]["role"]) {
  return roleOptions.find((option) => option.value === role)?.label ?? role;
}

function initials(name: string) {
  return name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("ru-RU");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("ru-RU", { dateStyle: "medium" }).format(value);
}
