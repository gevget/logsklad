# 15 — ADMIN WORKFLOWS

## 1. Роль

Admin управляет системой, справочниками и доступами.

Это не основной операционный пользователь, поэтому Admin UI должен быть функциональным, но не перегружать MVP.

---

## 2. Главные разделы

```text
Overview
Пользователи
Компании
Водители
Транспорт
Склады
Услуги
Справочники
Заявки
Audit
Demo Tools
```

---

## 3. Overview

Показать:
- users count;
- companies count;
- active orders;
- drivers available;
- issues;
- basic system status.

Это административный overview, не BI.

---

## 4. Users

Функции:
- список;
- поиск;
- фильтр по role;
- active / inactive;
- открыть профиль;
- изменить базовые данные;
- изменить role;
- привязать Client к Company.

Изменение role:
- confirm;
- audit log.

---

## 5. Companies

Функции:
- список client companies;
- создать;
- редактировать;
- deactivate;
- открыть users;
- открыть orders.

Не удалять company, если у неё есть history / orders.

---

## 6. Drivers

Показать:
- driver;
- phone;
- availability;
- assigned vehicle / current assignments;
- active status.

Функции:
- activate/deactivate;
- edit profile;
- view assignments.

---

## 7. Vehicles

CRUD:
- name;
- type;
- plate;
- capacity;
- active.

Не удалять vehicle, использованный в истории.
Использовать `isActive`.

---

## 8. Warehouses

CRUD:
- name;
- address;
- phone;
- working hours;
- active.

---

## 9. Services

CRUD:
- code;
- name;
- description;
- unit;
- base price;
- active.

Изменение base price не должно переписывать цену уже созданных `order_services`.

---

## 10. Orders

Admin имеет доступ ко всем заявкам.

Использовать тот же domain layer, что Manager.

Не создавать отдельную альтернативную реализацию карточки заказа, если можно переиспользовать компоненты.

---

## 11. Audit

Список:
- date;
- actor;
- action;
- entity;
- short payload.

Фильтры:
- actor;
- action;
- entity type;
- date.

Audit read-only.

---

## 12. Demo Tools

Только если:
```text
DEMO_MODE=true
```

Возможности:
- switch demo role;
- reset demo data and reseed atomically;
- открыть hero scenarios.

Любое destructive действие:
- доступно только ADMIN при `DEMO_MODE=true`;
- требует typed confirmation `ВОССТАНОВИТЬ ДЕМО`;
- сбрасывает базу в одной транзакции и удаляет привязанные локальные загрузки после commit;
- скрыто и заблокировано в production mode.

---

## 13. Safety

Admin UI не должен содержать:
- «удалить всю историю»;
- hard delete completed orders;
- direct arbitrary status mutation вне lifecycle service.

---

## 14. Responsive

Admin primarily desktop.

Mobile:
- basic access;
- lists;
- detail view;
- urgent edit.

Сложные настройки допустимо делать менее плотными на mobile.
