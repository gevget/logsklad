# 20 — ROUTE MAP AND NAVIGATION

## 1. Route strategy

Role prefix обязателен в Demo MVP.

```text
/client/*
/manager/*
/driver/*
/warehouse/*
/admin/*
```

Demo Role Switcher может переводить пользователя на dashboard выбранной роли.

---

## 2. Client routes

```text
/client
/client/orders
/client/orders/new
/client/orders/[id]
/client/documents
/client/notifications
/client/profile
```

---

## 3. Manager routes

```text
/manager
/manager/incoming
/manager/orders
/manager/orders/[id]
/manager/orders/new
/manager/planning
/manager/drivers
/manager/vehicles
/manager/warehouse
/manager/documents
/manager/notifications
```

---

## 4. Driver routes

```text
/driver
/driver/jobs
/driver/jobs/[id]
/driver/history
/driver/notifications
/driver/profile
```

---

## 5. Warehouse routes

```text
/warehouse
/warehouse/expected
/warehouse/intake
/warehouse/orders/[id]
/warehouse/processing
/warehouse/ready
/warehouse/history
```

---

## 6. Admin routes

```text
/admin
/admin/users
/admin/users/[id]
/admin/companies
/admin/companies/[id]
/admin/drivers
/admin/vehicles
/admin/warehouses
/admin/services
/admin/orders
/admin/orders/[id]
/admin/orders/new
/admin/audit
/admin/demo
```

---

## 7. Deep links

Notification links должны открывать релевантный объект.

Примеры:
```text
/client/orders/{id}?tab=documents
/manager/orders/{id}?tab=route
/warehouse/orders/{id}?tab=operations
```

---

## 8. Navigation states

Sidebar item:
- default;
- hover;
- active;
- optional badge;
- disabled only when business reason exists.

Active state должен быть визуально заметен, но не кричащий.

---

## 9. Reference direction

По референсам использовать compact dark rail / sidebar:
- иконка;
- label;
- active accent;
- минимальный шум.

См.:
- `references/REF_06_INVOICES_DASHBOARD.webp`
- `references/REF_10_FLEET_MAP.webp`

---

## 10. Back behavior

На detail screens:
- desktop: breadcrumb + contextual back;
- mobile: explicit Back in top bar.

Не полагаться только на browser back.
