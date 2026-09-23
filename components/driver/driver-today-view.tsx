import Link from "next/link";
import { ArrowRight, CalendarClock, CheckCircle2, MapPin, Package, Phone, Route, Truck } from "lucide-react";
import { orderStatusConfig } from "@/config/order-status";
import type { getDriverDashboardJobs } from "@/features/orders/queries";

type DriverJobs = Awaited<ReturnType<typeof getDriverDashboardJobs>>;

function formatPlan(date: Date | null) {
  if (!date) return "Время уточняется";
  return new Intl.DateTimeFormat("ru-RU", { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }).format(date);
}

export function DriverTodayView({ jobs }: { jobs: DriverJobs }) {
  const urgentJobs = jobs.filter(({ order }) => order.status === "ISSUE" || order.status === "ON_HOLD");
  const activeJobs = jobs.filter(({ order }) => order.status !== "ISSUE" && order.status !== "ON_HOLD");
  const current = activeJobs[0];
  const nextJobs = activeJobs.slice(1);
  const todayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  const todayCount = activeJobs.filter(({ order }) => order.plannedPickupAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Moscow", year: "numeric", month: "2-digit", day: "2-digit" }).format(order.plannedPickupAt) === todayKey).length;
  const currentPoint = current?.points.find((point) => !point.completedAt) ?? current?.points[0];
  const status = current ? orderStatusConfig[current.order.status] : null;

  return <div className="driver-today-view">
    <section className="driver-shift-summary" aria-label="Сводка смены">
      <article><span>Заданий на сегодня</span><strong>{todayCount}</strong><small>По вашему маршруту</small></article>
      <article><span>Активные рейсы</span><strong>{activeJobs.length}</strong><small>Назначены вам</small></article>
      <article><span>Следующий шаг</span><strong>{current ? status?.label : "Свободны"}</strong><small>Статус текущего рейса</small></article>
    </section>

    {urgentJobs.length ? <section className="panel driver-alert-panel"><div className="driver-alert-heading"><span className="driver-alert-dot" /><div><strong>Нужно внимание</strong><small>{urgentJobs.length} {urgentJobs.length === 1 ? "задание" : "задания"} ждут решения менеджера</small></div></div><div className="driver-alert-list">{urgentJobs.map(({ order }) => <Link href={`/driver/jobs/${order.id}`} key={order.id}><span>{order.number} · {order.title}</span><span className={`status-pill status-${orderStatusConfig[order.status].tone}`}><span className="status-dot" />{orderStatusConfig[order.status].label}</span><ArrowRight size={14} /></Link>)}</div></section> : null}

    {current ? <section className="panel driver-current-job">
      <div className="driver-current-job-top"><div><span className="eyebrow">ТЕКУЩИЙ РЕЙС</span><span className={`status-pill status-${status?.tone}`}><span className="status-dot" />{status?.label}</span></div><span className="driver-job-number">{current.order.number}</span></div>
      <h2>{current.order.title}</h2>
      <p className="driver-current-client">{current.companyName} · {current.order.type.replaceAll("_", " ")}</p>
      <div className="driver-current-route"><MapPin size={17} /><div><strong>{currentPoint?.label ?? "Маршрут не указан"}</strong><span>{currentPoint?.addressText ?? "Откройте задание, чтобы посмотреть точки маршрута"}</span></div></div>
      <div className="driver-current-meta"><span><CalendarClock size={15} /> {formatPlan(currentPoint?.plannedAt ?? current.order.plannedPickupAt)}</span>{currentPoint?.contactPhone ? <a href={`tel:${currentPoint.contactPhone.replace(/[^\d+]/g, "")}`}><Phone size={15} /> Позвонить</a> : null}</div>
      <div className="driver-current-job-actions"><Link className="button button-primary" href={`/driver/jobs/${current.order.id}`}>Открыть задание <ArrowRight size={16} /></Link><span><Package size={14} /> {current.order.title}</span></div>
    </section> : <section className="panel driver-empty-shift"><div className="driver-empty-icon"><CheckCircle2 size={22} /></div><div><h2>На сегодня заданий нет</h2><p>Когда менеджер назначит вам рейс, он появится здесь.</p></div></section>}

    {nextJobs.length ? <section className="panel driver-upcoming-panel">
      <div className="panel-heading"><div className="icon-tile"><Route size={18} /></div><div><span className="eyebrow">ДАЛЬШЕ ПО ПЛАНУ</span><h2>Другие задания</h2></div><Link className="driver-view-all" href="/driver/jobs">Все задания <ArrowRight size={14} /></Link></div>
      <div className="driver-upcoming-list">{nextJobs.slice(0, 4).map(({ order, points, companyName }) => {
        const nextPoint = points.find((point) => !point.completedAt) ?? points[0];
        const nextStatus = orderStatusConfig[order.status];
        return <Link className="driver-upcoming-row" href={`/driver/jobs/${order.id}`} key={order.id}><span className="driver-upcoming-icon"><Truck size={16} /></span><span className="driver-upcoming-copy"><strong>{order.number} · {order.title}</strong><small>{companyName} · {nextPoint?.addressText ?? "Маршрут уточняется"}</small></span><span className={`status-pill status-${nextStatus.tone}`}><span className="status-dot" />{nextStatus.label}</span><ArrowRight size={15} /></Link>;
      })}</div>
    </section> : null}
  </div>;
}
