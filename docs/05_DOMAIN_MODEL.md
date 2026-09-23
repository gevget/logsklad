# 05 — DOMAIN MODEL

## 1. Цель
Зафиксировать доменные сущности и связи до реализации БД. Точные SQL-поля — в `06_DATABASE_SCHEMA.md`.

## 2. Основные сущности

### User
Человек с доступом к системе.
Ключевые атрибуты: id, role, name, email, phone, companyId, active.

### Company
Организация клиента.
Ключевые атрибуты: legal name, display name, INN, contacts, billing data, status.

### Order
Главная бизнес-сущность.
Содержит number, type, status, company, creator, manager, driver, vehicle, pricing, route, services, files, history.

### Supplier
Поставщик клиента.
Поля: name, company details, contact, phone, address, notes.

### Address
Точка, используемая как pickup / warehouse / delivery / terminal / company address.
Для MVP полноценный geocoding не обязателен.

### RoutePoint
Точка маршрута конкретной заявки.
Позволяет иметь несколько pickup, склад и финальную доставку.

### Cargo
Описание груза.
Поля: title, category, description, quantity, places, weight, dimensions, declared value, special requirements.
В одной заявке может быть несколько cargo items.

### Service
Справочник услуг: storage, loading, unloading, packaging, labeling, cutting, photo report, insurance, forwarding.

### OrderService
Связь заявки с услугой: service, quantity, unit price, total, completion marker, notes.

### DriverProfile
Расширение User для роли Driver: availability, license/demo info, notes.

### Vehicle
Транспорт: type, plate, capacity, volume, active.

### Warehouse
Склад: name, address, contact, working hours.

### WarehouseOperation
Факт складского действия: intake, unloading, weighing, storage, packing, labeling, cutting, loading, release.

### Attachment
Файл или изображение, связанное с Order / WarehouseOperation / delivery proof.

### Document
Бизнес-документ: invoice, waybill, act, supplier document, proof of delivery, other.

### Comment
Комментарий со scope `INTERNAL` или `CLIENT_VISIBLE`.

### Notification
Уведомление пользователя о событиях заявки.

### StatusHistory
История изменения статусов: from, to, actor, timestamp, note.

### AuditLog
Журнал значимых действий: driver assigned, price changed, file uploaded, service added и т.д.

## 3. Ключевые связи

```text
Company
  ├─< User
  ├─< Supplier
  └─< Order

Order
  ├─< Cargo
  ├─< RoutePoint
  ├─< OrderService >─ Service
  ├─< Attachment
  ├─< Document
  ├─< Comment
  ├─< StatusHistory
  ├─< WarehouseOperation
  └─< Notifications / events

Order
  ├─ Manager(User)
  ├─ Driver(User/DriverProfile)
  └─ Vehicle
```

## 4. Aggregate principle
`Order` — основной aggregate root.

Изменения assigned driver, current status, services и route должны проходить через order-aware service functions.

Не изменять статус произвольным `UPDATE` из UI action.

## 5. Immutable history
Обычная бизнес-операция не удаляет:
- StatusHistory;
- AuditLog.

Ошибочное событие корректируется новым событием либо специальной admin-операцией.

## 6. Derived data
Не хранить одно и то же состояние в нескольких местах без причины.

Допустимо хранить:
- current status в Order;
- историю в StatusHistory;
- completedAt для быстрых запросов;
- assignedDriverId в Order.

## 7. Soft deletion
Для справочников использовать `isActive`.
Business records из обычного UI не удалять.

## 8. Demo realism
Seed должен моделировать:
- разные компании;
- типы грузов;
- типы заявок;
- стадии lifecycle;
- водителей и машины;
- складские операции;
- документы;
- комментарии;
- уведомления.

Не использовать имена `Test 1`, `User 2`, `Order 3`.
