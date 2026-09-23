"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpRight, CalendarDays, Clock3, MapPin, PackageCheck, Search, Truck, Warehouse } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import type { Order, RoutePoint } from "@/db/schema";

export type PlanningRow = { order: Pick<Order, "id" | "number" | "title" | "status" | "driverUserId" | "plannedPickupAt">; companyName: string };
export type PlanningDriver = { id: string; name: string; phone: string | null; isAvailable: boolean | null };
export type PlanningPoint = Pick<RoutePoint, "id" | "orderId" | "type" | "label" | "addressText" | "plannedAt" | "sequence">;

type ScheduleEvent = {
  id: string;
  orderId: string;
  orderNumber: string;
  orderTitle: string;
  companyName: string;
  status: Order["status"];
  kind: RoutePoint["type"];
  label: string;
  address: string;
  plannedAt: Date;
  sequence: number;
};

const terminalStatuses = new Set(["COMPLETED", "CANCELLED"]);
const routeKindLabels: Record<RoutePoint["type"], string> = {
  PICKUP: "Забор груза",
  WAREHOUSE: "Склад",
  DELIVERY: "Доставка",
  TERMINAL: "Терминал перевозчика",
  OTHER: "Точка маршрута",
};

function dateKey(date: Date) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(date);
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("ru-RU", { timeZone: "Europe/Moscow", day: "numeric", month: "long" }).format(date);
}

export function PlanningBoard({ rows, drivers, points, todayKey }: { rows: PlanningRow[]; drivers: PlanningDriver[]; points: PlanningPoint[]; todayKey: string }) {
  const [query, setQuery] = useState("");
  const [range, setRange] = useState<"today" | "all">("today");
  const events = useMemo<ScheduleEvent[]>(() => {
    const rowsById = new Map(rows.map((row) => [row.order.id, row]));
    return points.flatMap((point) => {
      if (!point.plannedAt) return [];
      const row = rowsById.get(point.orderId);
      if (!row || terminalStatuses.has(row.order.status)) return [];
      return [{
        id: point.id,
        orderId: row.order.id,
        orderNumber: row.order.number,
        orderTitle: row.order.title || "Логистическая заявка",
        companyName: row.companyName,
        status: row.order.status,
        kind: point.type,
        label: point.label || routeKindLabels[point.type],
        address: point.addressText,
        plannedAt: point.plannedAt,
        sequence: point.sequence,
      }];
    }).sort((first, second) => first.plannedAt.getTime() - second.plannedAt.getTime() || first.sequence - second.sequence);
  }, [points, rows]);
  const todayEvents = useMemo(() => events.filter((event) => dateKey(event.plannedAt) === todayKey), [events, todayKey]);
  const filteredEvents = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru-RU");
    return events.filter((event) => (range === "all" || dateKey(event.plannedAt) === todayKey)
      && (!normalizedQuery || [event.orderNumber, event.orderTitle, event.companyName, event.label, event.address, orderStatusConfig[event.status].label]
        .some((value) => value.toLocaleLowerCase("ru-RU").includes(normalizedQuery))));
  }, [events, query, range, todayKey]);
  const unassigned = useMemo(() => rows.filter(({ order }) => order.status === "CONFIRMED" && !order.driverUserId), [rows]);
  const activeAssignments = useMemo(() => rows.filter(({ order }) => !terminalStatuses.has(order.status) && order.driverUserId), [rows]);
  const pickupCount = todayEvents.filter((event) => event.kind === "PICKUP").length;
  const deliveryCount = todayEvents.filter((event) => event.kind === "DELIVERY" || event.kind === "TERMINAL").length;
  const warehouseCount = todayEvents.filter((event) => event.kind === "WAREHOUSE").length;

  return <div className="planning-board">
    <section className="planning-metrics" aria-label="План на сегодня">
      <article className="metric-card"><div className="metric-card-top"><span>Заборы</span><span className="metric-trend"><PackageCheck size={15} /></span></div><strong>{pickupCount}</strong><p>точек сегодня</p></article>
      <article className="metric-card"><div className="metric-card-top"><span>Доставки</span><span className="metric-trend"><Truck size={15} /></span></div><strong>{deliveryCount}</strong><p>точек сегодня</p></article>
      <article className="metric-card"><div className="metric-card-top"><span>Приёмка на склад</span><span className="metric-trend"><Warehouse size={15} /></span></div><strong>{warehouseCount}</strong><p>ожидается сегодня</p></article>
      <article className="metric-card"><div className="metric-card-top"><span>Без водителя</span><span className="metric-trend"><MapPin size={15} /></span></div><strong>{unassigned.length}</strong><p>подтверждённых заявок</p></article>
    </section>

    <div className="planning-layout">
      <section className="panel planning-agenda">
        <div className="panel-heading"><div className="icon-tile"><CalendarDays size={18} /></div><div><span className="eyebrow">МАРШРУТЫ · {formatDay(new Date())}</span><h2>План перевозок</h2></div></div>
        <div className="planning-toolbar">
          <label className="planning-search"><Search size={15} /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Заявка, компания или адрес" aria-label="Поиск по плану перевозок" /></label>
          <div className="planning-range" role="group" aria-label="Период планирования"><button type="button" aria-pressed={range === "today"} className={range === "today" ? "active" : ""} onClick={() => setRange("today")}>Сегодня</button><button type="button" aria-pressed={range === "all"} className={range === "all" ? "active" : ""} onClick={() => setRange("all")}>Все даты</button></div>
          <span className="planning-event-count">{filteredEvents.length} {filteredEvents.length === 1 ? "точка" : "точек"}</span>
        </div>
        {filteredEvents.length ? <div className="planning-event-list">{filteredEvents.map((event) => <Link className="planning-event" href={`/manager/orders/${event.orderId}`} key={event.id}>
          <span className="planning-event-time"><Clock3 size={14} />{formatDate(event.plannedAt)}</span>
          <span className={`planning-event-marker ${event.kind.toLowerCase()}`}><MapPin size={15} /></span>
          <span className="planning-event-copy"><span className="planning-event-kind">{event.label || routeKindLabels[event.kind]}</span><strong>{event.orderNumber} · {event.orderTitle}</strong><small>{event.address}</small><small>{event.companyName} · {orderStatusConfig[event.status].label}</small></span>
          <ArrowUpRight className="planning-event-open" size={15} />
        </Link>)}</div> : <div className="planning-empty-state"><CalendarDays size={20} /><strong>{range === "today" ? "На сегодня точек в плане нет" : "По запросу ничего не найдено"}</strong><span>{range === "today" ? "Переключитесь на все даты или проверьте назначение сроков." : "Измените поиск или выберите другой период."}</span></div>}
      </section>

      <aside className="planning-side">
        <section className="panel planning-side-panel"><div className="panel-heading"><div><span className="eyebrow">НАЗНАЧЕНИЕ</span><h2>Подтверждены без водителя</h2></div><span className="planning-side-count">{unassigned.length}</span></div>
          {unassigned.length ? <div className="planning-list compact-planning">{unassigned.map(({ order, companyName }) => <Link className="unscheduled-row" href={`/manager/orders/${order.id}`} key={order.id}><span>{order.number} · {orderStatusConfig[order.status].label}</span><strong>{order.title || "Логистическая заявка"}</strong><small>{companyName}{order.plannedPickupAt ? ` · забор ${formatDate(order.plannedPickupAt)}` : " · дата забора не задана"}</small></Link>)}</div> : <p className="planning-empty">Все подтверждённые заявки назначены водителям.</p>}
        </section>
        <section className="panel planning-side-panel"><div className="panel-heading"><div><span className="eyebrow">КОМАНДА</span><h2>Загрузка водителей</h2></div><Truck size={17} /></div>
          {drivers.length ? <div className="planning-driver-list">{drivers.map((driver) => {
            const assignmentCount = activeAssignments.filter(({ order }) => order.driverUserId === driver.id).length;
            return <article className="planning-driver-row" key={driver.id}><span className={`driver-availability ${driver.isAvailable ? "available" : "busy"}`}><Truck size={15} /></span><span className="planning-driver-copy"><strong>{driver.name}</strong><small>{driver.isAvailable ? "Доступен" : "В рейсе"}{driver.phone ? ` · ${driver.phone}` : ""}</small></span><span className="planning-driver-load">{assignmentCount} {assignmentCount === 1 ? "заявка" : "заявок"}</span></article>;
          })}</div> : <p className="planning-empty">Нет активных водителей.</p>}
        </section>
      </aside>
    </div>
  </div>;
}
