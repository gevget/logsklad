# 19 — INFORMATION ARCHITECTURE

## 1. Цель

Собрать продукт так, чтобы пять ролей работали с одной системой, но каждая видела только свой рабочий контекст.

Главная сущность — `Order`.

Архитектура интерфейса строится вокруг:
- dashboard роли;
- списка заявок / заданий;
- карточки заявки;
- contextual actions;
- документов / уведомлений;
- профиля.

---

## 2. Общий принцип

Не создавать пять полностью независимых продуктов.

Использовать единый:
- shell;
- design system;
- order model;
- status language;
- file system;
- notification layer.

Меняются:
- navigation;
- priorities;
- permissions;
- density;
- actions.

---

## 3. Client IA

```text
Client
├─ Dashboard
├─ Orders
│  ├─ All
│  ├─ Active
│  ├─ Completed
│  └─ Order Details
├─ New Order
├─ Documents
├─ Notifications
└─ Profile / Company
```

Optional:
```text
Suppliers
Saved Addresses
```

---

## 4. Manager IA

```text
Manager
├─ Dashboard
├─ Incoming
├─ Orders
│  ├─ All
│  ├─ Needs Attention
│  ├─ Unassigned
│  └─ Order Details
├─ Planning
├─ Drivers
├─ Vehicles
├─ Warehouse Overview
├─ Documents
└─ Notifications
```

---

## 5. Driver IA

```text
Driver
├─ Today
├─ Jobs
│  ├─ Active
│  ├─ Upcoming
│  └─ History
├─ Notifications
└─ Profile
```

На mobile:
- bottom navigation;
- current job first;
- sticky action.

---

## 6. Warehouse IA

```text
Warehouse
├─ Today
├─ Expected
├─ Intake
├─ In Warehouse
├─ Processing
├─ Ready for Release
├─ History
└─ Notifications
```

---

## 7. Admin IA

```text
Admin
├─ Overview
├─ Users
├─ Companies
├─ Drivers
├─ Vehicles
├─ Warehouses
├─ Services
├─ Orders
├─ Audit
└─ Demo Tools
```

---

## 8. Cross-role entities

Все роли могут использовать единый визуальный паттерн для:
- Order number;
- StatusBadge;
- User / Company;
- RoutePoint;
- Cargo;
- Attachment;
- Timeline event;
- Notification.

Это необходимо для консистентности.

---

## 9. Global UI zones

### Desktop
```text
Left Sidebar / Rail
Top Context Bar
Main Content
Optional Right Context Panel
```

### Mobile
```text
Top App Bar
Main Content
Sticky Primary Action
Bottom Navigation
```

---

## 10. Navigation principle

В навигации показывать задачи, а не внутреннюю структуру БД.

Хорошо:
- Заявки
- Сегодня
- На складе
- Водители

Плохо:
- Order Entities
- Warehouse Operations
- Status History
