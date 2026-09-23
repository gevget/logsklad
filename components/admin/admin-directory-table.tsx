"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { toggleDirectoryActiveAction } from "@/features/admin/actions";

const auditReferenceTime = Date.now();

type DirectoryData = {
  headers: string[];
  rows: { id: string; cells: string[]; active?: boolean; createdAt?: number }[];
};

export function AdminDirectoryTable({ directory, section, preview }: { directory: DirectoryData; section: string; preview: boolean }) {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [activeFilter, setActiveFilter] = useState("");
  const [auditActionFilter, setAuditActionFilter] = useState("");
  const [auditEntityFilter, setAuditEntityFilter] = useState("");
  const [auditActorFilter, setAuditActorFilter] = useState("");
  const [auditDateFilter, setAuditDateFilter] = useState("");
  const roleIndex = directory.headers.indexOf("Роль");
  const auditActionIndex = directory.headers.indexOf("Действие");
  const auditEntityIndex = directory.headers.indexOf("Объект");
  const auditActorIndex = directory.headers.indexOf("Пользователь");
  const supportsToggle = section !== "audit";
  const hasActiveState = directory.rows.some((row) => row.active !== undefined);
  const roles = useMemo(() => roleIndex < 0 ? [] : [...new Set(directory.rows.map((row) => row.cells[roleIndex]).filter(Boolean))], [directory.rows, roleIndex]);
  const auditActions = useMemo(() => auditActionIndex < 0 ? [] : [...new Set(directory.rows.map((row) => row.cells[auditActionIndex]).filter(Boolean))], [auditActionIndex, directory.rows]);
  const auditEntities = useMemo(() => auditEntityIndex < 0 ? [] : [...new Set(directory.rows.map((row) => row.cells[auditEntityIndex]).filter(Boolean))], [auditEntityIndex, directory.rows]);
  const auditActors = useMemo(() => auditActorIndex < 0 ? [] : [...new Set(directory.rows.map((row) => row.cells[auditActorIndex]).filter(Boolean))], [auditActorIndex, directory.rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    const cutoff = auditDateFilter ? auditReferenceTime - Number(auditDateFilter) * 24 * 60 * 60 * 1000 : 0;
    return directory.rows.filter((row) => {
      const matchesQuery = !normalizedQuery || row.cells.some((cell) => cell.toLocaleLowerCase("ru-RU").includes(normalizedQuery));
      const matchesRole = !roleFilter || row.cells[roleIndex] === roleFilter;
      const matchesActive = !activeFilter || row.active === (activeFilter === "active");
      const matchesAction = !auditActionFilter || row.cells[auditActionIndex] === auditActionFilter;
      const matchesEntity = !auditEntityFilter || row.cells[auditEntityIndex] === auditEntityFilter;
      const matchesActor = !auditActorFilter || row.cells[auditActorIndex] === auditActorFilter;
      const matchesDate = !auditDateFilter || Boolean(row.createdAt && row.createdAt >= cutoff);
      return matchesQuery && matchesRole && matchesActive && matchesAction && matchesEntity && matchesActor && matchesDate;
    });
  }, [activeFilter, auditActionFilter, auditActionIndex, auditActorFilter, auditActorIndex, auditDateFilter, auditEntityFilter, auditEntityIndex, directory.rows, query, roleFilter, roleIndex]);
  const hasFilters = Boolean(query || roleFilter || activeFilter || auditActionFilter || auditEntityFilter || auditActorFilter || auditDateFilter);
  const rowAction = (row: DirectoryData["rows"][number]) => preview
    ? <button className="table-action" type="button" disabled>Просмотр</button>
    : <form action={toggleDirectoryActiveAction}><input type="hidden" name="section" value={section} /><input type="hidden" name="id" value={row.id} /><input type="hidden" name="active" value={String(!row.active)} /><button className="table-action" type="submit">{row.active ? "Отключить" : "Включить"}</button></form>;
  const clearFilters = () => { setQuery(""); setRoleFilter(""); setActiveFilter(""); setAuditActionFilter(""); setAuditEntityFilter(""); setAuditActorFilter(""); setAuditDateFilter(""); };
  const createLabel = ({ vehicles: "Добавить транспорт", warehouses: "Добавить склад", services: "Добавить услугу", companies: "Добавить компанию" } as Record<string, string>)[section];
  const opensDetails = ["users", "companies", "drivers", "vehicles", "warehouses", "services"].includes(section);

  return <>
    <div className={`admin-directory-toolbar ${section === "audit" ? "audit-directory-toolbar" : ""}`}>
      <label className="admin-directory-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Имя, email или данные записи" aria-label="Поиск по справочнику" /></label>
      {roleIndex >= 0 ? <label className="admin-directory-filter"><span>Роль</span><select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} aria-label="Фильтр по роли"><option value="">Все роли</option>{roles.map((role) => <option value={role} key={role}>{role}</option>)}</select></label> : null}
      {hasActiveState ? <label className="admin-directory-filter"><span>Статус</span><select value={activeFilter} onChange={(event) => setActiveFilter(event.target.value)} aria-label="Фильтр активности"><option value="">Все записи</option><option value="active">Активные</option><option value="inactive">Отключённые</option></select></label> : null}
      {auditActionIndex >= 0 ? <label className="admin-directory-filter"><span>Действие</span><select value={auditActionFilter} onChange={(event) => setAuditActionFilter(event.target.value)} aria-label="Фильтр по действию"><option value="">Все действия</option>{auditActions.map((action) => <option value={action} key={action}>{action}</option>)}</select></label> : null}
      {auditEntityIndex >= 0 ? <label className="admin-directory-filter"><span>Объект</span><select value={auditEntityFilter} onChange={(event) => setAuditEntityFilter(event.target.value)} aria-label="Фильтр по объекту"><option value="">Все объекты</option>{auditEntities.map((entity) => <option value={entity} key={entity}>{entity}</option>)}</select></label> : null}
      {auditActorIndex >= 0 ? <label className="admin-directory-filter"><span>Пользователь</span><select value={auditActorFilter} onChange={(event) => setAuditActorFilter(event.target.value)} aria-label="Фильтр по пользователю"><option value="">Все пользователи</option>{auditActors.map((actor) => <option value={actor} key={actor}>{actor}</option>)}</select></label> : null}
      {section === "audit" ? <label className="admin-directory-filter"><span>Период</span><select value={auditDateFilter} onChange={(event) => setAuditDateFilter(event.target.value)} aria-label="Фильтр по периоду"><option value="">Любой</option><option value="1">24 часа</option><option value="7">7 дней</option><option value="30">30 дней</option></select></label> : null}
      <span className="admin-directory-count">{filteredRows.length} из {directory.rows.length}</span>
      {createLabel ? <Link className="button button-primary admin-directory-create" href={`/admin/${section}/new`}>{createLabel}</Link> : null}
    </div>
    {filteredRows.length ? <section className="panel admin-table-wrap">
      <table className="admin-table"><thead><tr>{directory.headers.map((header) => <th key={header}>{header}</th>)}{supportsToggle ? <th>Действие</th> : null}</tr></thead><tbody>{filteredRows.map((row) => <tr key={row.id}>{row.cells.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`}>{cellIndex === 0 && opensDetails ? <Link className="admin-user-row-link" href={`/admin/${section}/${row.id}`}>{cell}</Link> : cell}</td>)}{supportsToggle ? <td>{rowAction(row)}</td> : null}</tr>)}</tbody></table>
      <div className="admin-mobile-list">{filteredRows.map((row) => <article className="admin-mobile-card" key={row.id}>
        <div className="admin-mobile-card-heading"><div><strong>{opensDetails ? <Link className="admin-user-row-link" href={`/admin/${section}/${row.id}`}>{row.cells[0]}</Link> : row.cells[0]}</strong>{directory.headers[1] && row.cells[1] ? <small>{directory.headers[1]} · {row.cells[1]}</small> : null}</div>{row.active !== undefined ? <span className={`admin-state-pill ${row.active ? "active" : "inactive"}`}>{row.active ? "Активна" : "Отключена"}</span> : null}</div>
        <dl>{directory.headers.slice(2).map((header, index) => header === "Статус" && row.active !== undefined ? null : <div key={header}><dt>{header}</dt><dd>{row.cells[index + 2]}</dd></div>)}</dl>
        {supportsToggle ? <div className="admin-mobile-card-action">{rowAction(row)}</div> : null}
      </article>)}</div>
    </section> : <section className="panel admin-directory-empty"><h2>Записи не найдены</h2><p>Измените условия поиска или сбросьте фильтры.</p>{hasFilters ? <button className="text-button" type="button" onClick={clearFilters}><X size={14} /> Сбросить фильтры</button> : null}</section>}
  </>;
}
