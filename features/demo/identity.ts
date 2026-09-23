export const demoIdentities = [
  {
    role: "CLIENT",
    label: "Заказчик",
    name: "Алексей Морозов",
    email: "client@demo.local",
    route: "/client",
  },
  {
    role: "MANAGER",
    label: "Менеджер",
    name: "Анна Смирнова",
    email: "manager@demo.local",
    route: "/manager",
  },
  {
    role: "DRIVER",
    label: "Водитель",
    name: "Сергей Волков",
    email: "driver@demo.local",
    route: "/driver",
  },
  {
    role: "WAREHOUSE",
    label: "Склад",
    name: "Михаил Орлов",
    email: "warehouse@demo.local",
    route: "/warehouse",
  },
  {
    role: "ADMIN",
    label: "Администратор",
    name: "Екатерина Лебедева",
    email: "admin@demo.local",
    route: "/admin",
  },
] as const;

export type DemoRole = (typeof demoIdentities)[number]["role"];
export type DemoIdentity = (typeof demoIdentities)[number];

export const roleNavigation: Record<DemoRole, { label: string; href: string }[]> = {
  CLIENT: [
    { label: "Главная", href: "/client" },
    { label: "Заявки", href: "/client/orders" },
    { label: "Создать заявку", href: "/client/orders/new" },
    { label: "Документы", href: "/client/documents" },
    { label: "Уведомления", href: "/client/notifications" },
    { label: "Профиль", href: "/client/profile" },
  ],
  MANAGER: [
    { label: "Обзор", href: "/manager" },
    { label: "Входящие", href: "/manager/incoming" },
    { label: "Все заявки", href: "/manager/orders" },
    { label: "Планирование", href: "/manager/planning" },
    { label: "Водители", href: "/manager/drivers" },
    { label: "Склад", href: "/manager/warehouse" },
    { label: "Документы", href: "/manager/documents" },
    { label: "Уведомления", href: "/manager/notifications" },
  ],
  DRIVER: [
    { label: "Сегодня", href: "/driver" },
    { label: "Мои задания", href: "/driver/jobs" },
    { label: "История", href: "/driver/history" },
    { label: "Уведомления", href: "/driver/notifications" },
    { label: "Профиль", href: "/driver/profile" },
  ],
  WAREHOUSE: [
    { label: "Сегодня", href: "/warehouse" },
    { label: "Ожидается", href: "/warehouse/expected" },
    { label: "Приёмка", href: "/warehouse/intake" },
    { label: "На складе", href: "/warehouse/orders" },
    { label: "Обработка", href: "/warehouse/processing" },
    { label: "К выдаче", href: "/warehouse/ready" },
    { label: "История", href: "/warehouse/history" },
    { label: "Уведомления", href: "/warehouse/notifications" },
  ],
  ADMIN: [
    { label: "Обзор", href: "/admin" },
    { label: "Пользователи", href: "/admin/users" },
    { label: "Компании", href: "/admin/companies" },
    { label: "Водители", href: "/admin/drivers" },
    { label: "Транспорт", href: "/admin/vehicles" },
    { label: "Склады", href: "/admin/warehouses" },
    { label: "Услуги", href: "/admin/services" },
    { label: "Заявки", href: "/admin/orders" },
    { label: "Журнал действий", href: "/admin/audit" },
    { label: "Демо-настройки", href: "/admin/demo" },
  ],
};

export function getDemoIdentity(email?: string): DemoIdentity {
  return demoIdentities.find((identity) => identity.email === email) ?? demoIdentities[0];
}

export function isDemoRole(value: string): value is DemoRole {
  return demoIdentities.some((identity) => identity.role === value);
}

export function getRoleIdentity(role: DemoRole): DemoIdentity {
  return demoIdentities.find((identity) => identity.role === role) ?? demoIdentities[0];
}
