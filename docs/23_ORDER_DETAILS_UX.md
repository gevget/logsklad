# 23 — ORDER DETAILS UX

## 1. Главный экран продукта

Order Details — центральный workspace всей системы.

Разные роли используют один domain object, но разные action layers.

---

## 2. Header

Показывать:
- order number;
- type;
- status;
- client/company;
- planned date;
- total, если role может видеть;
- primary actions.

Desktop:
- horizontal action zone.

Mobile:
- title + status + overflow menu;
- primary action sticky bottom.

---

## 3. Recommended sections

```text
Overview
Route
Cargo
Services
Warehouse
Driver
Documents
Comments
Timeline
Finance
```

Не все sections видны каждой роли.

---

## 4. Reference inspiration

`REF_04_LOGISTICS_MAP_CARD`:
- карта / статус;
- compact shipment data;
- horizontal status progression.

`REF_08_TRACKING_TIMELINE`:
- metrics + route + vertical timeline.

`REF_03_DENSE_DETAIL_MODAL`:
- dense detail grouping;
- subtle separators;
- editable controls within detail surface.

---

## 5. Overview

Сводка:
- current milestone;
- pickup;
- delivery;
- cargo summary;
- responsible;
- planned dates;
- services count.

---

## 6. Route

Desktop:
- optional dark map;
- route points list beside / below.

Mobile:
- route points first;
- map collapsible / secondary.

Каждая точка:
- type;
- address;
- contact;
- planned time;
- actual time;
- status.

---

## 7. Timeline

Вертикальный timeline:
- date/time;
- event;
- actor / source;
- location where relevant.

Client sees public timeline.
Manager sees expanded internal timeline.

---

## 8. Operational right rail

Для Manager desktop допустим right rail:
- next action;
- assigned driver;
- vehicle;
- quick status;
- issue;
- client contact.

На smaller desktop rail превращается в top cards / drawer.

---

## 9. Status progression

Не показывать все 15 статусов как одинаковый stepper.

Показывать 4–6 milestone stages, зависящих от type.

Пример:
```text
Создано
→ Забор
→ Склад
→ Доставка
→ Завершено
```

Подробные статусы остаются в timeline.

---

## 10. Issue visibility

ISSUE:
- заметная, но не кричащая alert strip;
- reason;
- last update;
- action for relevant role.

---

## 11. Files

Документы и фото разделять визуально:
- Documents list;
- Photo grid.

Не смешивать 30 файлов в одну стену.

---

## 12. Mobile order details

Порядок:
1. status;
2. next action;
3. route;
4. contacts;
5. cargo;
6. photos;
7. documents;
8. timeline;
9. secondary data.
