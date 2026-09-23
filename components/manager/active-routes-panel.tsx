"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, MapPin, Package, Route, Truck } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import type { ManagerActiveRoute } from "@/features/orders/queries";

function formatPlannedTime(value: Date | null) {
  if (!value) return "Время не задано";
  return new Intl.DateTimeFormat("ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Moscow" }).format(value);
}

export function ActiveRoutesPanel({ routes }: { routes: ManagerActiveRoute[] }) {
  const [selectedId, setSelectedId] = useState(routes[0]?.order.id ?? "");
  const selected = routes.find(({ order }) => order.id === selectedId) ?? routes[0];

  return (
    <section className="panel active-routes-panel" aria-labelledby="active-routes-title">
      <header className="active-routes-heading">
        <div className="panel-heading">
          <div className="icon-tile"><Route size={19} /></div>
          <div>
            <span className="eyebrow">ТРАНСПОРТ В РАБОТЕ</span>
            <h2 id="active-routes-title">Активные перевозки</h2>
          </div>
        </div>
        <span className="active-routes-count">{routes.length} {routes.length === 1 ? "рейс" : routes.length > 1 && routes.length < 5 ? "рейса" : "рейсов"}</span>
      </header>

      {selected ? (
        <div className="active-routes-layout">
          <div className="active-route-list" role="group" aria-label="Выберите перевозку">
            {routes.map((route) => {
              const status = orderStatusConfig[route.order.status];
              const isSelected = route.order.id === selected.order.id;
              const destination = route.points.at(-1);
              return (
                <button
                  className={`active-route-option${isSelected ? " selected" : ""}`}
                  key={route.order.id}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => setSelectedId(route.order.id)}
                >
                  <span className="active-route-option-top"><span className={`route-state-dot tone-${status.tone}`} />{status.label}<span className="active-route-order">{route.order.number}</span></span>
                  <strong>{route.order.title || route.companyName}</strong>
                  <span className="active-route-option-bottom"><span>{route.driverName || "Водитель не указан"}</span><span>{destination?.label || destination?.addressText || "Точка не указана"}</span></span>
                </button>
              );
            })}
          </div>

          <div className="active-route-detail" aria-live="polite">
            <div className="route-schematic" role="img" aria-label={`Схема маршрута заявки ${selected.order.number}: ${selected.points.map((point) => point.label || point.addressText).join(" — ") || "точки маршрута не указаны"}. Схема без географического масштаба и координат.`}>
              <div className="route-schematic-topline"><span><MapPin size={14} /> ПОРЯДОК ТОЧЕК МАРШРУТА</span><span>БЕЗ GPS</span></div>
              {selected.points.length > 0 ? (
                <>
                  <svg className="route-schematic-line" viewBox="0 0 640 120" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
                    <path className="route-schematic-track-base" d="M44 61 H596" />
                    <path className="route-schematic-track-active" d="M44 61 H596" />
                    {selected.points.map((point, index) => {
                      const x = selected.points.length === 1 ? 320 : 44 + index * (552 / (selected.points.length - 1));
                      return <g className="route-schematic-stop" key={point.id} transform={`translate(${x} 61)`}>
                        <circle className="route-schematic-stop-halo" r="17" />
                        <circle className="route-schematic-stop-core" r="11" />
                        <text className="route-schematic-stop-number" textAnchor="middle" dominantBaseline="central">{index + 1}</text>
                      </g>;
                    })}
                  </svg>
                  <div className="route-schematic-stops" style={{ gridTemplateColumns: `repeat(${Math.min(selected.points.length, 4)}, minmax(0, 1fr))` }}>
                    {selected.points.slice(0, 4).map((point, index) => (
                      <div className="route-schematic-stop-copy" key={point.id}>
                        <span>{index === 0 ? "СТАРТ" : index === selected.points.length - 1 ? "ФИНИШ" : `ТОЧКА ${String(index + 1).padStart(2, "0")}`}</span>
                        <strong>{point.label || point.type}</strong>
                        <small>{point.addressText}</small>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="route-schematic-empty"><MapPin size={18} /><span>Для этой заявки ещё не указаны точки маршрута</span></div>
              )}
              <div className="route-schematic-note">Схема показывает порядок остановок, а не фактическое положение транспорта.</div>
            </div>

            <div className="active-route-footer">
              <div className="active-route-crew">
                <span><Truck size={15} />{selected.driverName || "Водитель не назначен"}</span>
                <span><Package size={15} />{selected.vehicleName || "Транспорт не указан"}</span>
                <span><MapPin size={15} />Доставка: {formatPlannedTime(selected.order.plannedDeliveryAt)}</span>
              </div>
              <Link className="active-route-open" href={`/manager/orders/${selected.order.id}`}>Открыть заявку <ArrowUpRight size={15} /></Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="active-routes-empty">
          <div className="empty-mark"><Truck size={19} /></div>
          <div><strong>Активных рейсов пока нет</strong><span>Назначенные перевозки появятся здесь вместе с точками маршрута и данными водителя.</span></div>
          <Link className="text-link" href="/manager/planning">Открыть планирование <ArrowUpRight size={15} /></Link>
        </div>
      )}
    </section>
  );
}
