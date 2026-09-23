"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, Package, Search, X } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import type { getOrdersForUser } from "@/features/orders/queries";

type OrderRows = Awaited<ReturnType<typeof getOrdersForUser>>;

export function OrderList({ rows, basePath, showFilters = false }: { rows: OrderRows; basePath: string; showFilters?: boolean }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const availableStatuses = useMemo(() => [...new Set(rows.map(({ order }) => order.status))], [rows]);
  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    return rows.filter(({ order, companyName, clientName }) => {
      const matchesQuery = !normalizedQuery || [order.number, order.title, companyName, clientName]
        .filter(Boolean).some((value) => value!.toLocaleLowerCase("ru-RU").includes(normalizedQuery));
      return matchesQuery && (!statusFilter || order.status === statusFilter);
    });
  }, [query, rows, statusFilter]);

  if (!rows.length) return <div className="empty-state"><div className="empty-mark"><Package size={21} /></div><h3>Заявок пока нет</h3><p>Когда появятся новые перевозки, они отобразятся в этом списке.</p></div>;

  return <div className="order-list-wrap">
    {showFilters ? <div className="order-list-toolbar"><label className="order-search"><Search size={16} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Номер, груз или клиент" aria-label="Найти заявку" /></label><label className="order-status-filter"><span>Статус</span><select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Фильтр по статусу"><option value="">Все статусы</option>{availableStatuses.map((item) => <option value={item} key={item}>{orderStatusConfig[item].label}</option>)}</select></label><span className="order-filter-count">{filteredRows.length} из {rows.length}</span></div> : null}
    {filteredRows.length ? <div className="order-list">
    {filteredRows.map(({ order, companyName, clientName }) => {
      const status = orderStatusConfig[order.status];
      const partyName = basePath.startsWith("/manager") || basePath.startsWith("/admin") ? companyName : clientName ?? companyName;
      return <Link className="order-row" href={`${basePath}/${order.id}`} key={order.id}>
        <div className="order-row-main"><span className="order-number">{order.number}</span><strong>{order.title || "Логистическая заявка"}</strong><small>{partyName}</small></div>
        <span className={`status-pill status-${status.tone}`}><span className="status-dot" />{status.label}</span>
        <div className="order-row-meta"><small>{new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short" }).format(order.updatedAt)}</small><ArrowUpRight size={16} /></div>
      </Link>;
    })}
    </div> : <div className="order-filter-empty"><span>По этим условиям заявок нет.</span><button className="text-button" type="button" onClick={() => { setQuery(""); setStatusFilter(""); }}><X size={14} /> Сбросить фильтры</button></div>}
  </div>;
}
