"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Archive,
  Bell,
  Box,
  Building2,
  CalendarDays,
  ClipboardList,
  FileText,
  Gauge,
  LayoutDashboard,
  MapPinned,
  Package,
  PackageCheck,
  Settings2,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { setDemoIdentityAction } from "@/features/demo/actions";
import { demoIdentities, roleNavigation, type DemoIdentity, type DemoRole } from "@/features/demo/identity";

const iconByLabel: Record<string, typeof LayoutDashboard> = {
  "Главная": LayoutDashboard,
  "Обзор": Gauge,
  "Заявки": ClipboardList,
  "Создать заявку": Package,
  "Документы": FileText,
  "Уведомления": Bell,
  "Профиль": Users,
  "Входящие": Archive,
  "Все заявки": ClipboardList,
  "Планирование": CalendarDays,
  "Водители": Truck,
  "Склад": Warehouse,
  "Сегодня": Gauge,
  "Мои задания": MapPinned,
  "История": Activity,
  "Ожидается": CalendarDays,
  "Приёмка": PackageCheck,
  "На складе": Box,
  "Обработка": Settings2,
  "К выдаче": PackageCheck,
  "Пользователи": Users,
  "Компании": Building2,
  "Транспорт": Truck,
  "Склады": Warehouse,
  "Услуги": Settings2,
  "Журнал действий": Activity,
  "Демо-настройки": Settings2,
};

const roleAccent: Record<DemoRole, string> = {
  CLIENT: "C",
  MANAGER: "M",
  DRIVER: "D",
  WAREHOUSE: "W",
  ADMIN: "A",
};

export function AppShell({ identity, children, preview = false, showDemoTools = true, unreadNotificationCount = 0 }: { identity: DemoIdentity; children: React.ReactNode; preview?: boolean; showDemoTools?: boolean; unreadNotificationCount?: number }) {
  const pathname = usePathname();
  const navItems = roleNavigation[identity.role].filter((item) => showDemoTools || item.href !== "/admin/demo");
  const mobileItems = identity.role === "CLIENT" ? navItems.filter((item) => item.href !== "/client/documents") : navItems.slice(0, 5);
  const mobileHasNotifications = mobileItems.some((item) => item.label === "Уведомления");
  const hasNotificationPage = navItems.some((item) => item.label === "Уведомления");
  const roleRoot = `/${identity.role.toLowerCase()}`;
  const matchPath = (href: string) => href === roleRoot ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  const activeHref = [...navItems].filter((item) => matchPath(item.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  const activeMobileHref = [...mobileItems].filter((item) => matchPath(item.href)).sort((a, b) => b.href.length - a.href.length)[0]?.href;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <Link className="brand" href={`/${identity.role.toLowerCase()}`} aria-label="ЛогСклад — на главную">
          <span className="brand-mark">Л</span>
          <span className="brand-copy"><strong>ЛОГСКЛАД</strong><small>LOGISTICS PLATFORM</small></span>
        </Link>

        <div className="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>
        <nav className="side-nav" aria-label="Основная навигация">
          {navItems.map((item) => {
            const Icon = iconByLabel[item.label] ?? ClipboardList;
            const active = item.href === activeHref;
            return (
              <Link className={`nav-link${active ? " active" : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined} aria-label={item.label === "Уведомления" && unreadNotificationCount > 0 ? `${item.label}: ${unreadNotificationCount} непрочитанных` : undefined}>
                <Icon size={17} strokeWidth={1.8} />
                <span>{item.label}</span>
                {item.label === "Уведомления" && unreadNotificationCount > 0 ? <span className="notification-badge">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span> : null}
                {active ? <span className="nav-active-dot" /> : null}
              </Link>
            );
          })}
        </nav>

        <div className="sidebar-spacer" />
        <div className="demo-note"><span className="demo-note-dot" /><span>{preview ? "Просмотр дизайна" : "Демо-режим"}</span><span className="demo-note-version">{preview ? "UI" : "MVP"}</span></div>
        <IdentitySwitcher identity={identity} compact={false} />
      </aside>

      <div className="main-column">
        <header className="topbar">
          <div className="mobile-brand">
            <span className="brand-mark">Л</span><strong>ЛОГСКЛАД</strong>
          </div>
          <div className="breadcrumbs"><span>Рабочее пространство</span><span className="breadcrumb-separator">/</span><strong>{identity.label}</strong></div>
          <div className="topbar-actions">
            <span className="environment-pill"><span /> {preview ? "ПРЕДПРОСМОТР" : "DEMO"}</span>
            <div className="identity-chip"><span className={`avatar avatar-${identity.role.toLowerCase()}`}>{roleAccent[identity.role]}</span><span className="identity-chip-copy"><strong>{identity.name}</strong><small>{identity.label}</small></span></div>
            {hasNotificationPage && !mobileHasNotifications ? <Link className="topbar-notification-quicklink" href={`${roleRoot}/notifications`} aria-label={`Уведомления: ${unreadNotificationCount} непрочитанных`}><Bell size={18} />{unreadNotificationCount > 0 ? <span className="notification-badge notification-badge-mobile">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span> : null}</Link> : null}
            <div className="mobile-role-switch"><IdentitySwitcher identity={identity} compact /></div>
          </div>
        </header>

        <main className="main-content">{children}</main>
      </div>

      <nav className="bottom-nav" aria-label="Мобильная навигация">
        {mobileItems.map((item) => {
          const Icon = iconByLabel[item.label] ?? ClipboardList;
          const active = item.href === activeMobileHref;
          return <Link className={`bottom-nav-item${active ? " active" : ""}`} href={item.href} key={item.href} aria-current={active ? "page" : undefined} aria-label={item.label === "Уведомления" && unreadNotificationCount > 0 ? `${item.label}: ${unreadNotificationCount} непрочитанных` : undefined}><Icon size={19} strokeWidth={1.9} /><span>{item.label}</span>{item.label === "Уведомления" && unreadNotificationCount > 0 ? <span className="notification-badge notification-badge-mobile">{unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}</span> : null}</Link>;
        })}
      </nav>
    </div>
  );
}

function IdentitySwitcher({ identity, compact }: { identity: DemoIdentity; compact: boolean }) {
  return (
    <form className={`identity-switcher${compact ? " compact" : ""}`} action={setDemoIdentityAction}>
      <label htmlFor={compact ? "mobile-role-switcher" : "sidebar-role-switcher"}>
        {compact ? "Роль" : <><span className="eyebrow">ТЕСТИРОВАТЬ РОЛИ</span><span className="switcher-current">{identity.label}</span></>}
      </label>
      <select id={compact ? "mobile-role-switcher" : "sidebar-role-switcher"} name="role" value={identity.role} aria-label="Выбрать демонстрационную роль" onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        {roleNavigationOrder.map((role) => <option value={role.role} key={role.role}>{role.label} · {role.name}</option>)}
      </select>
      {!compact ? <span className="switcher-email">{identity.email}</span> : null}
      <noscript><button className="switcher-submit" type="submit">Переключить</button></noscript>
    </form>
  );
}

const roleNavigationOrder = demoIdentities;
