"use client";

import Link from "next/link";
import { useActionState } from "react";
import { Boxes, Building2, MapPin, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { toggleDirectoryActiveAction, upsertAdminResourceAction, type AdminResourceUpdateState } from "@/features/admin/actions";
import type { AdminResourceDetail, AdminResourceSection } from "@/features/admin/queries";

const initialState: AdminResourceUpdateState = { status: "idle", message: "" };
const sectionLabels: Record<AdminResourceSection, string> = { vehicles: "Транспорт", warehouses: "Склады", services: "Услуги" };
const sectionIcons = { vehicles: Truck, warehouses: Building2, services: Boxes };

export function AdminResourceView({ section, detail, preview = false }: { section: AdminResourceSection; detail: AdminResourceDetail | null; preview?: boolean }) {
  const [state, formAction, pending] = useActionState(upsertAdminResourceAction, initialState);
  const resource = detail?.section === section ? detail.resource : null;
  const vehicle = section === "vehicles" && resource && "vehicleType" in resource ? resource : null;
  const warehouse = section === "warehouses" && resource && "addressText" in resource ? resource : null;
  const service = section === "services" && resource && "code" in resource ? resource : null;
  const Icon = sectionIcons[section];
  const isNew = !resource;

  return <>
    <Link className="admin-user-back" href={`/admin/${section}`}>← Все записи · {sectionLabels[section].toLocaleLowerCase("ru-RU")}</Link>
    <div className="admin-resource-layout">
      <section className="panel admin-user-form-panel">
        <div className="panel-heading"><div className="icon-tile"><Icon size={18} /></div><div><span className="eyebrow">{isNew ? "НОВАЯ ЗАПИСЬ" : sectionLabels[section].toLocaleUpperCase("ru-RU")}</span><h2>{resource?.name ?? `Новая запись · ${sectionLabels[section].toLocaleLowerCase("ru-RU")}`}</h2></div></div>
        <p className="admin-user-intro">{section === "vehicles" ? "Параметры транспорта помогают подобрать машину для перевозки." : section === "warehouses" ? "Адрес и часы работы доступны команде при планировании приёмки." : "Параметры услуги будут доступны для новых заявок."}</p>

        <form action={formAction} className="admin-user-form">
          <input type="hidden" name="section" value={section} />
          <input type="hidden" name="id" value={resource?.id ?? ""} />
          {section === "vehicles" ? <div className="admin-user-fields">
            <label className="wizard-field"><span>Название</span><input name="name" defaultValue={vehicle?.name ?? ""} required maxLength={160} placeholder="Например, Газель Next" /></label>
            <label className="wizard-field"><span>Тип транспорта</span><input name="vehicleType" defaultValue={vehicle?.vehicleType ?? ""} maxLength={80} placeholder="Фургон, тентованный" /></label>
            <label className="wizard-field"><span>Регистрационный номер</span><input name="plateNumber" defaultValue={vehicle?.plateNumber ?? ""} maxLength={20} /></label>
            <label className="wizard-field"><span>Грузоподъёмность, кг</span><input name="capacityKg" type="number" min="0" max="10000000" step="1" defaultValue={vehicle?.capacityKg ?? ""} /></label>
            <label className="wizard-field"><span>Объём кузова, м³</span><input name="volumeM3" type="number" min="0" max="1000000" step="0.01" defaultValue={vehicle?.volumeM3 ?? ""} /></label>
          </div> : null}
          {section === "warehouses" ? <div className="admin-user-fields">
            <label className="wizard-field"><span>Название</span><input name="name" defaultValue={warehouse?.name ?? ""} required maxLength={180} placeholder="Например, Склад Химки" /></label>
            <label className="wizard-field"><span>Телефон</span><input name="phone" type="tel" defaultValue={warehouse?.phone ?? ""} maxLength={40} autoComplete="tel" /></label>
            <label className="wizard-field full-field"><span>Адрес</span><textarea name="addressText" rows={3} defaultValue={warehouse?.addressText ?? ""} required maxLength={4000} placeholder="Город, улица, дом, ориентир" /></label>
            <label className="wizard-field full-field"><span>Часы работы</span><input name="workingHours" defaultValue={warehouse?.workingHours ?? ""} maxLength={120} placeholder="Пн–Сб, 08:00–20:00" /></label>
          </div> : null}
          {section === "services" ? <div className="admin-user-fields">
            <label className="wizard-field"><span>Код услуги</span><input name="code" defaultValue={service?.code ?? ""} required minLength={2} maxLength={40} pattern="[A-Za-z0-9_-]{2,40}" placeholder="PHOTO_REPORT" /></label>
            <label className="wizard-field"><span>Название</span><input name="name" defaultValue={service?.name ?? ""} required maxLength={160} placeholder="Фотоотчёт" /></label>
            <label className="wizard-field"><span>Единица измерения</span><input name="unit" defaultValue={service?.unit ?? ""} maxLength={40} placeholder="услуга, место, кг" /></label>
            <label className="wizard-field"><span>Базовая цена, ₽</span><input name="basePrice" type="number" min="0" max="1000000" step="0.01" defaultValue={service?.basePrice ?? ""} /></label>
            <label className="wizard-field full-field"><span>Описание</span><textarea name="description" rows={3} defaultValue={service?.description ?? ""} maxLength={4000} /></label>
          </div> : null}

          {state.message ? <p className={`admin-user-feedback ${state.status}`} role={state.status === "error" ? "alert" : "status"}>{state.message}{state.status === "success" && resource?.id ? <> <Link className="text-link" href={`/admin/${section}/${resource.id}`}>Вернуться к карточке</Link></> : null}{state.status === "success" && state.message === "Изменения сохранены и записаны в журнал действий." && isNew ? <> <Link className="text-link" href={`/admin/${section}`}>Вернуться к списку</Link></> : null}</p> : null}
          {section === "services" ? <p className="admin-user-preview-note">Новая цена действует только для будущих заявок; стоимость уже созданных услуг не меняется.</p> : null}
          {preview ? <p className="admin-user-preview-note">Поля можно изучать и заполнять. В режиме просмотра дизайна изменения не сохраняются.</p> : null}
          <div className="admin-user-form-actions"><span>Удаление заменено отключением, чтобы сохранить историю операций.</span><button className="button button-primary" type="submit" disabled={preview || pending}>{pending ? "Сохраняем…" : isNew ? "Создать запись" : "Сохранить изменения"}</button></div>
        </form>
      </section>

      {resource ? <aside className="panel admin-resource-state">
        <div className="icon-tile"><ShieldCheck size={18} /></div><span className="eyebrow">СОСТОЯНИЕ</span><h2>{resource.name}</h2><span className={`admin-state-pill ${resource.isActive ? "active" : "inactive"}`}>{resource.isActive ? "Активна" : "Отключена"}</span>
        <form action={toggleDirectoryActiveAction} className="admin-company-toggle"><input type="hidden" name="section" value={section} /><input type="hidden" name="id" value={resource.id} /><input type="hidden" name="active" value={String(!resource.isActive)} /><button className="table-action" type="submit" disabled={preview}>{resource.isActive ? "Отключить" : "Включить"}</button></form>
        <div className="admin-resource-policy"><MapPin size={15} /><span>{section === "vehicles" ? "Транспорт из истории остаётся в заявках и не удаляется." : section === "warehouses" ? "Склад сохраняется в истории складских операций." : "Услуга сохраняется в старых заявках с указанной на тот момент ценой."}</span></div>
        {section === "services" ? <div className="admin-resource-policy"><PackageCheck size={15} /><span>Обновление базовой цены не переписывает стоимость в order_services.</span></div> : null}
      </aside> : <aside className="panel admin-resource-state">
        <div className="icon-tile"><ShieldCheck size={18} /></div><span className="eyebrow">ПРАВИЛА УЧЁТА</span><h2>Без удаления истории</h2><p>Запись можно отключить после создания. Она останется в ранее оформленных заявках и операциях.</p>
      </aside>}
    </div>
  </>;
}
