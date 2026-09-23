import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowDownRight, ArrowUpRight, Box, ClipboardList, Clock3, PackageCheck, Plus, Warehouse } from "lucide-react";
import { getRoleIdentity, isDemoRole, roleNavigation, type DemoRole } from "@/features/demo/identity";
import { getCurrentDemoUser } from "@/lib/auth/current-user";
import { can } from "@/lib/permissions";
import { getActiveDrivers, getActiveServices, getActiveVehicles, getClientSuppliers, getDashboardData, getDriverDashboardJobs, getOrderCreationCompanies, getOrdersForUser, getSectionStatuses } from "@/features/orders/queries";
import { OrderList } from "@/components/orders/order-list";
import { OrderDetail } from "@/components/orders/order-detail";
import { DriverJobView } from "@/components/driver/driver-job-view";
import { DriverTodayView } from "@/components/driver/driver-today-view";
import { getOrderDetails } from "@/features/orders/queries";
import { OrderWizard } from "@/components/orders/order-wizard";
import { NotificationsView } from "@/components/notifications/notifications-view";
import { DocumentsView } from "@/components/documents/documents-view";
import { AdminDirectoryView } from "@/components/admin/admin-directory-view";
import { AdminUserDetailView } from "@/components/admin/admin-user-detail-view";
import { AdminCompanyView } from "@/components/admin/admin-company-view";
import { AdminDriverView } from "@/components/admin/admin-driver-view";
import { AdminResourceView } from "@/components/admin/admin-resource-view";
import { DemoToolsView } from "@/components/admin/demo-tools-view";
import { PlanningView } from "@/components/manager/planning-view";
import { ActiveRoutesPanel } from "@/components/manager/active-routes-panel";
import { DriversView } from "@/components/manager/drivers-view";
import { ProfileView } from "@/components/profile/profile-view";
import { getAdminCompanyDetail, getAdminDriverDetail, getAdminResourceDetail, getAdminUserDetail, type AdminResourceSection } from "@/features/admin/queries";
import { designPreviewEnabled } from "@/lib/design-preview/data";

type PageProps = {
  params: Promise<{ role: string; segments?: string[] }>;
};

const dashboardCopy: Record<DemoRole, { eyebrow: string; title: string; description: string; focus: string; icon: typeof Box }> = {
  CLIENT: {
    eyebrow: "КАБИНЕТ ЗАКАЗЧИКА",
    title: "Логистика под контролем",
    description: "Создавайте заявки и следите за каждым этапом перевозки в одном месте.",
    focus: "Здесь будут ваши активные заявки и последние обновления.",
    icon: PackageCheck,
  },
  MANAGER: {
    eyebrow: "ОПЕРАЦИОННЫЙ ЦЕНТР",
    title: "Рабочая смена",
    description: "Входящие заявки, назначения и текущая работа по перевозкам.",
    focus: "Здесь появятся входящие заявки и задачи, требующие внимания.",
    icon: ClipboardList,
  },
  DRIVER: {
    eyebrow: "КАБИНЕТ ВОДИТЕЛЯ",
    title: "Сегодня в рейсе",
    description: "Маршрут, контакты и ближайшее действие — всегда под рукой.",
    focus: "Назначенные рейсы и следующий адрес будут показаны здесь.",
    icon: Box,
  },
  WAREHOUSE: {
    eyebrow: "СКЛАДСКИЕ ОПЕРАЦИИ",
    title: "Смена склада",
    description: "Ожидаемые поступления, приёмка и грузы, готовые к выдаче.",
    focus: "Ожидаемые грузы и незавершённые операции появятся здесь.",
    icon: Warehouse,
  },
  ADMIN: {
    eyebrow: "УПРАВЛЕНИЕ СИСТЕМОЙ",
    title: "Обзор платформы",
    description: "Пользователи, компании и справочники логистической системы.",
    focus: "Сводные показатели появятся после подключения рабочей базы.",
    icon: Clock3,
  },
};

const roleMetrics: Record<DemoRole, { label: string; detail: string; trend: "up" | "down" }[]> = {
  CLIENT: [
    { label: "Активные заявки", detail: "В работе и на маршруте", trend: "up" },
    { label: "Завершено за месяц", detail: "История последних перевозок", trend: "down" },
    { label: "Требуют внимания", detail: "Обновления от менеджера", trend: "up" },
  ],
  MANAGER: [
    { label: "Входящие", detail: "Новые заявки на проверку", trend: "up" },
    { label: "Активные", detail: "В работе у команды", trend: "up" },
    { label: "На складе", detail: "Ожидают следующего этапа", trend: "down" },
    { label: "В доставке", detail: "Уже в пути к получателю", trend: "up" },
    { label: "Требуют внимания", detail: "Проблемы и задержки", trend: "up" },
  ],
  DRIVER: [],
  WAREHOUSE: [
    { label: "Ожидается сегодня", detail: "Запланированные поступления", trend: "up" },
    { label: "Прибыло", detail: "Грузы, ожидающие приёмки", trend: "down" },
    { label: "В обработке", detail: "Складские операции", trend: "up" },
    { label: "Готово к выдаче", detail: "Завершённая обработка", trend: "down" },
    { label: "Требуют внимания", detail: "Заявки с проблемой", trend: "up" },
  ],
  ADMIN: [
    { label: "Пользователи", detail: "Активные учётные записи", trend: "up" },
    { label: "Компании", detail: "Клиенты платформы", trend: "down" },
    { label: "Активные заявки", detail: "Текущая операционная нагрузка", trend: "up" },
    { label: "Доступные водители", detail: "Можно назначить на заявку", trend: "up" },
    { label: "Проблемы", detail: "Заявки с открытым вопросом", trend: "down" },
  ],
};

function getSectionTitle(role: DemoRole, href: string) {
  return roleNavigation[role].find((item) => item.href === href)?.label ?? "Раздел";
}

function getAdminResourcePageTitle(section: AdminResourceSection, isNew: boolean) {
  if (section === "vehicles") return isNew ? "Новый транспорт" : "Карточка транспорта";
  if (section === "warehouses") return isNew ? "Новый склад" : "Карточка склада";
  return isNew ? "Новая услуга" : "Карточка услуги";
}

const sectionDescriptions: Record<DemoRole, Record<string, string>> = {
  CLIENT: {
    orders: "Следите за статусом перевозки, сроками и документами.",
    documents: "Накладные, счета и файлы по вашим перевозкам.",
    notifications: "Обновления по заявкам и важные сообщения команды.",
    profile: "Контактные данные и реквизиты вашей компании.",
  },
  MANAGER: {
    incoming: "Новые заявки, которые ждут проверки и решения.",
    orders: "Поиск и контроль перевозок на всех этапах.",
    planning: "Сроки перевозок и заявки, которым нужна дата.",
    drivers: "Доступность водителей и текущая загрузка.",
    warehouse: "Поставки, ожидаемые складом, и принятые грузы.",
    documents: "Документы, счета и фото по текущим перевозкам.",
    notifications: "Изменения статусов и задачи по заявкам.",
  },
  DRIVER: {
    jobs: "Маршруты, точки передачи и действия по рейсам.",
    history: "Завершённые перевозки и предыдущие маршруты.",
    notifications: "Назначения и изменения по вашим рейсам.",
    profile: "Контактные данные, транспорт и доступность.",
  },
  WAREHOUSE: {
    expected: "Поставки, которые скоро прибудут на склад.",
    intake: "Сверьте фактические места и вес при приёмке.",
    notifications: "Новые поступления и изменения планов выдачи.",
    orders: "Грузы, принятые на склад и ожидающие обработки.",
    processing: "Отметьте выполненные складские операции.",
    ready: "Грузы, подготовленные к выдаче и доставке.",
    history: "Принятые, обработанные и выданные грузы.",
  },
  ADMIN: {
    users: "Учётные записи, роли и доступ к рабочим разделам.",
    companies: "Компании клиентов и их реквизиты.",
    drivers: "Контакты водителей, доступность и документы.",
    vehicles: "Транспорт, регистрационные номера и грузоподъёмность.",
    warehouses: "Адреса, контакты и график работы складов.",
    services: "Складские услуги и базовые цены.",
    orders: "Заявки компании на всех этапах перевозки.",
    audit: "История действий пользователей и системы.",
    demo: "Переходите к рабочим разделам и изучайте интерфейс каждой роли.",
  },
};

function getSectionDescription(role: DemoRole, segments: string[], isDetail: boolean, isDriverJobDetail: boolean, isNewOrderPage: boolean) {
  if (isNewOrderPage) return "Заполните заявку — менеджер уточнит сроки и условия перевозки.";
  if (isDriverJobDetail) return "Маршрут, контакты и следующее действие по рейсу.";
  if (isDetail) return "Текущий статус, маршрут, груз и история перевозки.";
  return sectionDescriptions[role][segments[0] ?? ""] ?? "Рабочие данные и действия для этой роли.";
}

export default async function RolePage({ params }: PageProps) {
  const { role: roleParam, segments = [] } = await params;
  const roleKey = roleParam.toUpperCase();

  if (!isDemoRole(roleKey)) notFound();
  const role = roleKey;
  const user = await getCurrentDemoUser();
  if (user.role !== role) redirect(getRoleIdentity(user.role).route);
  const basePath = `/${roleParam}`;
  const currentPath = segments.length === 0 ? basePath : `${basePath}/${segments.join("/")}`;
  const roleRoot = `/${roleParam.toLowerCase()}`;

  if (segments.length === 0 && roleParam !== roleParam.toLowerCase()) {
    redirect(roleRoot);
  }

  const copy = dashboardCopy[role];
  const Icon = copy.icon;
  const isDashboard = segments.length === 0;
  const isDriverDashboard = role === "DRIVER" && isDashboard;
  const isOrderListWithCreate = segments.length === 1 && segments[0] === "orders" && can(user, "orders:create");
  const isOrdersPage = segments.length === 1 && (segments[0] === "orders" || Boolean(getSectionStatuses(role, segments[0])));
  const isNewOrderPage = segments.length === 2 && segments[0] === "orders" && segments[1] === "new" && can(user, "orders:create");
  const isDriverJobDetail = role === "DRIVER" && segments.length === 2 && segments[0] === "jobs";
  const isNotificationsPage = segments.length === 1 && segments[0] === "notifications";
  const isDocumentsPage = segments.length === 1 && segments[0] === "documents";
  const isManagerPlanning = role === "MANAGER" && segments.length === 1 && segments[0] === "planning";
  const isManagerDrivers = role === "MANAGER" && segments.length === 1 && segments[0] === "drivers";
  const isProfilePage = segments.length === 1 && segments[0] === "profile" && (role === "CLIENT" || role === "DRIVER");
  const adminSections = ["users", "companies", "drivers", "vehicles", "warehouses", "services", "audit"];
  const isAdminDemoTools = role === "ADMIN" && segments.length === 1 && segments[0] === "demo";
  const demoToolsAvailable = process.env.DEMO_MODE === "true" && process.env.NODE_ENV !== "production" && process.env.VERCEL_ENV !== "production";
  if (isAdminDemoTools && !demoToolsAvailable) notFound();
  const isAdminDirectory = role === "ADMIN" && segments.length === 1 && adminSections.includes(segments[0]);
  const isAdminUserDetail = role === "ADMIN" && segments.length === 2 && segments[0] === "users";
  const isAdminDriverDetail = role === "ADMIN" && segments.length === 2 && segments[0] === "drivers";
  const isAdminCompanyNew = role === "ADMIN" && segments.length === 2 && segments[0] === "companies" && segments[1] === "new";
  const isAdminCompanyDetail = role === "ADMIN" && segments.length === 2 && segments[0] === "companies" && segments[1] !== "new";
  const resourceSections = ["vehicles", "warehouses", "services"];
  const isAdminResourceNew = role === "ADMIN" && segments.length === 2 && resourceSections.includes(segments[0]) && segments[1] === "new";
  const isAdminResourceDetail = role === "ADMIN" && segments.length === 2 && resourceSections.includes(segments[0]) && segments[1] !== "new";
  const adminResourceSection = isAdminResourceNew || isAdminResourceDetail ? segments[0] as AdminResourceSection : null;
  const isOrderDetail = segments.length === 2 && segments[0] === "orders" && !isNewOrderPage;
  const title = isDashboard ? copy.title : isNewOrderPage ? "Новая заявка" : isAdminUserDetail ? "Карточка пользователя" : isAdminCompanyNew ? "Новая компания" : isAdminCompanyDetail ? "Карточка компании" : isAdminDriverDetail ? "Карточка водителя" : (isAdminResourceNew || isAdminResourceDetail) && adminResourceSection ? getAdminResourcePageTitle(adminResourceSection, isAdminResourceNew) : isDriverJobDetail ? "Задание водителю" : isOrderDetail ? "Заявка" : getSectionTitle(role, currentPath);
  const description = isDashboard ? copy.description : isAdminUserDetail ? "Контакты, роль и привязка к компании." : isAdminCompanyNew ? "Добавьте компанию и контакт для заявок." : isAdminCompanyDetail ? "Реквизиты, пользователи и история заявок компании." : isAdminDriverDetail ? "Контакты, доступность, транспорт и активные назначения." : (isAdminResourceNew || isAdminResourceDetail) && adminResourceSection ? `${getAdminResourcePageTitle(adminResourceSection, isAdminResourceNew)} · параметры и состояние записи.` : getSectionDescription(role, segments, isOrderDetail, isDriverJobDetail, isNewOrderPage);
  const detailId = isOrderDetail || isDriverJobDetail ? segments[1] : null;
  const [dashboard, orderRows, orderDetail, activeServices, activeSuppliers, orderCompanies, managerResources, adminUserDetail, adminCompanyDetail, adminDriverDetail, adminResourceDetail, driverDashboardJobs] = await Promise.all([
    isDashboard ? getDashboardData(user) : Promise.resolve(null),
    isOrdersPage ? getOrdersForUser(user, { statuses: getSectionStatuses(role, segments[0]), limit: 100 }) : Promise.resolve(null),
    detailId ? getOrderDetails(detailId, user) : Promise.resolve(null),
    isNewOrderPage ? getActiveServices() : Promise.resolve(undefined),
    isNewOrderPage ? getClientSuppliers(user) : Promise.resolve([]),
    isNewOrderPage ? getOrderCreationCompanies(user) : Promise.resolve([]),
    isOrderDetail && role === "MANAGER" ? Promise.all([getActiveDrivers(), getActiveVehicles()]) : Promise.resolve([undefined, undefined] as const),
    isAdminUserDetail ? getAdminUserDetail(user, segments[1]) : Promise.resolve(null),
    isAdminCompanyDetail ? getAdminCompanyDetail(user, segments[1]) : Promise.resolve(null),
    isAdminDriverDetail ? getAdminDriverDetail(user, segments[1]) : Promise.resolve(null),
    isAdminResourceDetail && adminResourceSection ? getAdminResourceDetail(user, adminResourceSection, segments[1]) : Promise.resolve(null),
    isDriverDashboard ? getDriverDashboardJobs(user) : Promise.resolve([]),
  ]);
  const [drivers, vehicles] = managerResources;
  if ((isOrderDetail || isDriverJobDetail) && !orderDetail) notFound();
  if (isAdminUserDetail && !adminUserDetail) notFound();
  if (isAdminCompanyDetail && !adminCompanyDetail) notFound();
  if (isAdminDriverDetail && !adminDriverDetail) notFound();
  if (isAdminResourceDetail && !adminResourceDetail) notFound();

  return (
    <div className="page-stack">
      <header className="page-heading">
        <div>
          <div className="eyebrow">{isDashboard ? copy.eyebrow : isAdminUserDetail ? "ПОЛЬЗОВАТЕЛИ" : isAdminCompanyNew || isAdminCompanyDetail ? "КОМПАНИИ" : isAdminDriverDetail ? "ВОДИТЕЛИ" : isAdminResourceNew || isAdminResourceDetail ? getSectionTitle(role, `${roleRoot}/${adminResourceSection}` ).toUpperCase() : roleNavigation[role].find((item) => item.href === currentPath)?.label.toUpperCase()}</div>
          <h1>{title}</h1>
          <p>{description}</p>
        </div>
        {can(user, "orders:create") && isDashboard ? (
          <Link className="button button-primary" href={`${roleRoot}/orders/new`}><Plus size={17} /> Создать заявку</Link>
        ) : isOrderListWithCreate ? (
          <Link className="button button-primary" href={`${roleRoot}/orders/new`}><Plus size={17} /> Создать заявку</Link>
        ) : role === "WAREHOUSE" && isDashboard ? (
          <Link className="button button-primary" href="/warehouse/intake"><PackageCheck size={17} /> Открыть приёмку</Link>
        ) : null}
      </header>

      {designPreviewEnabled ? <div className="preview-notice"><strong>Просмотр дизайна</strong><span>Показаны примерные данные. Можно изучать экраны и проходить форму; изменения не сохраняются.</span></div> : null}

      {isDriverDashboard ? <DriverTodayView jobs={driverDashboardJobs} /> : isDashboard ? (
        <>
          {roleMetrics[role].length > 0 ? (
            <section className="metric-grid" aria-label="Ключевые показатели">
              {roleMetrics[role].map((metric) => <MetricCard key={metric.label} {...metric} value={getMetricValue(role, metric.label, dashboard!)} />)}
            </section>
          ) : null}

          {role === "MANAGER" ? <ActiveRoutesPanel routes={dashboard!.activeRoutes} /> : null}

          <section className="workspace-grid">
            <div className="panel focus-panel">
              <div className="panel-heading">
                <div className="icon-tile"><Icon size={19} /></div>
                <div>
                  <span className="eyebrow">РАБОЧИЙ СПИСОК</span>
                  <h2>{role === "DRIVER" ? "Ближайшее задание" : role === "WAREHOUSE" ? "Ожидаемые поступления" : role === "CLIENT" ? "Ваши заявки" : role === "ADMIN" ? "Активность системы" : role === "MANAGER" ? "Последние заявки" : "Текущие задачи"}</h2>
                </div>
              </div>
              {dashboard!.orders.length ? <div className="dashboard-orders">
                <OrderList rows={dashboard!.orders} basePath={roleRoot + (role === "DRIVER" ? "/jobs" : "/orders")} />
              </div> : null}
              {!dashboard!.orders.length ? <div className="empty-state">
                <div className="empty-mark"><Icon size={21} /></div>
                <h3>{role === "CLIENT" ? "Пока нет заявок" : "Рабочая область готова"}</h3>
                <p>{copy.focus}</p>
                {role === "CLIENT" ? <Link className="button button-secondary" href="/client/orders/new"><Plus size={16} /> Создать первую заявку</Link> : null}
              </div> : null}
            </div>

            <aside className="panel next-panel">
              <div className="panel-heading compact-heading">
                <div>
                  <span className="eyebrow">БЫСТРЫЙ ПЕРЕХОД</span>
                  <h2>Рабочие разделы</h2>
                </div>
              </div>
              <div className="quick-links">
                {roleNavigation[role].slice(1, 5).map((item, index) => (
                  <Link className="quick-link" href={item.href} key={item.href}>
                    <span className="quick-link-index">0{index + 1}</span>
                    <span>{item.label}</span>
                    <ArrowUpRight size={15} />
                  </Link>
                ))}
              </div>
              <div className="panel-footnote"><Clock3 size={14} /> Данные обновляются по мере работы с заявками</div>
            </aside>
          </section>

          <section className="status-strip">
            <div className="status-strip-icon"><PackageCheck size={17} /></div>
            <div><strong>{role === "ADMIN" ? "Состояние среды" : "Единая история перевозки"}</strong><span>{role === "ADMIN" ? designPreviewEnabled ? "Демо-данные включены. Изменения отключены в просмотре дизайна." : "Демо-режим активен. Администратор управляет пользователями и справочниками." : "Клиент, менеджер, водитель и склад будут работать с одной заявкой."}</span></div>
            <span className="status-pill status-info"><span className="status-dot" />{role === "ADMIN" ? "СИСТЕМА АКТИВНА" : "ОСНОВА ПЛАТФОРМЫ"}</span>
          </section>
        </>
      ) : isNotificationsPage ? (
        <NotificationsView user={user} preview={designPreviewEnabled} />
      ) : isDocumentsPage ? (
        <DocumentsView user={user} preview={designPreviewEnabled} />
      ) : isManagerPlanning ? (
        <PlanningView user={user} />
      ) : isManagerDrivers ? (
        <DriversView />
      ) : isProfilePage ? (
        <ProfileView user={user} />
      ) : isAdminDemoTools ? (
        <DemoToolsView preview={designPreviewEnabled} resetAvailable={demoToolsAvailable} />
      ) : isAdminUserDetail && adminUserDetail ? (
        <AdminUserDetailView key={adminUserDetail.user.id} detail={adminUserDetail} actorId={user.id} preview={designPreviewEnabled} />
      ) : isAdminDriverDetail && adminDriverDetail ? (
        <AdminDriverView detail={adminDriverDetail} preview={designPreviewEnabled} />
      ) : isAdminCompanyNew || isAdminCompanyDetail && adminCompanyDetail ? (
        <AdminCompanyView detail={adminCompanyDetail} preview={designPreviewEnabled} />
      ) : isAdminResourceNew && adminResourceSection || isAdminResourceDetail && adminResourceSection ? (
        <AdminResourceView section={adminResourceSection} detail={adminResourceDetail} preview={designPreviewEnabled} />
      ) : isAdminDirectory ? (
        <AdminDirectoryView user={user} section={segments[0]} preview={designPreviewEnabled} />
      ) : isNewOrderPage ? (
        <OrderWizard services={activeServices ?? []} suppliers={activeSuppliers} companyOptions={orderCompanies} targetCompanyRequired={role !== "CLIENT"} preview={designPreviewEnabled} />
      ) : isDriverJobDetail && role === "DRIVER" && orderDetail ? (
        <DriverJobView detail={orderDetail} preview={designPreviewEnabled} />
      ) : isOrderDetail && orderDetail ? (
        <OrderDetail detail={orderDetail} role={role} roleRoot={roleRoot} backHref={isDriverJobDetail ? `${roleRoot}/jobs` : undefined} drivers={drivers ?? []} vehicles={vehicles ?? []} canViewFinance={can(user, "orders:view_finance", orderDetail.order)} preview={designPreviewEnabled} />
      ) : isOrdersPage && orderRows ? (
        <section className="panel"><OrderList rows={orderRows} basePath={roleRoot + (role === "DRIVER" ? "/jobs" : "/orders")} showFilters /></section>
      ) : (
        <section className="panel section-placeholder">
          <div className="empty-mark"><Icon size={21} /></div>
          <h2>{title}</h2>
          <p>Раздел включён в навигацию продукта. Его рабочие данные и действия будут подключаться вместе с соответствующим этапом.</p>
          <Link className="text-link" href={roleRoot}><ArrowDownRight size={16} /> Вернуться к обзору</Link>
        </section>
      )}
    </div>
  );
}

function getMetricValue(role: DemoRole, label: string, data: Awaited<ReturnType<typeof getDashboardData>>) {
  if (role === "CLIENT") {
    if (label === "Активные заявки") return String(data.active);
    if (label === "Завершено за месяц") return String(data.completed);
    return String(data.attention);
  }
  if (role === "MANAGER") {
    if (label === "Входящие") return String(data.incoming);
    if (label === "Активные") return String(data.active);
    if (label === "На складе") return String(data.warehouse);
    if (label === "В доставке") return String(data.inDelivery);
    return String(data.attention);
  }
  if (role === "WAREHOUSE") {
    if (label === "В обработке") return String(data.warehouseProcessing);
    if (label === "Готово к выдаче") return String(data.warehouseReady);
    if (label === "Прибыло") return String(data.warehouseArrived);
    if (label === "Требуют внимания") return String(data.warehouseIssue);
    return String(data.warehouseExpectedToday);
  }
  if (role === "ADMIN") {
    if (label === "Активные заявки") return String(data.active);
    if (label === "Доступные водители") return String(data.driversAvailable);
    if (label === "Проблемы") return String(data.attention);
    if (label === "Пользователи") return String(data.users);
    if (label === "Компании") return String(data.companies);
  }
  return "—";
}

function MetricCard({ label, value, detail, trend }: { label: string; value: string; detail: string; trend: "up" | "down" }) {
  const Trend = trend === "up" ? ArrowUpRight : ArrowDownRight;
  return (
    <article className="metric-card">
      <div className="metric-card-top"><span>{label}</span><span className="metric-trend"><Trend size={15} /></span></div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}
