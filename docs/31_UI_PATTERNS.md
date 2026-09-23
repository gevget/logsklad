# 31 — UI PATTERNS

## 1. Цель

Зафиксировать продуктовые паттерны, чтобы разные роли ощущались частью одной системы.

---

# 2. Status Pattern

Всегда:
```text
[dot/icon] Label
```

Пример:
```text
● В доставке
```

На critical status можно добавить:
- soft background;
- border.

Не использовать:
- только цвет точки без текста.

---

# 3. Next Action Pattern

В карточке / detail экранe должно быть очевидно:
> что дальше?

Пример:
```text
Следующий этап
Забрать груз у поставщика
Сегодня, 14:30
[Начать поездку]
```

Это важнее полного списка history.

---

# 4. Timeline Pattern

Event anatomy:
```text
icon/dot
timestamp
event title
secondary detail
actor/location optional
```

Current:
- accent / stronger.

Completed:
- success / muted.

Future:
- neutral / low contrast.

---

# 5. Route Pattern

Compact:
```text
Москва, Варшавское ш.
↓
Склад №1
↓
Воронеж, ул. ...
```

Detailed:
- point number;
- type;
- contact;
- time;
- status.

Map является дополнением, не заменой textual route.

---

# 6. Dashboard Metrics Pattern

Metric card:
```text
Label
Value
Delta / context
```

Не более 4–6 KPI в верхнем ряду.

Плохой dashboard:
10 одинаковых metric cards + 4 графика.

---

# 7. List Row Pattern

Order list row:
- number;
- main route / client;
- status;
- date;
- driver / amount;
- trailing action.

На hover:
- subtle surface shift;
- no jumping elevation.

---

# 8. Filters Pattern

Desktop:
```text
Search | Status | Type | Date | Driver | More
```

Active filters:
- chips below / inside bar.

Mobile:
```text
Search
[Filters 3]
active chips
```

---

# 9. Empty Pattern

Пример:
```text
Заявок пока нет
Создайте первую заявку — она появится здесь.

[Создать заявку]
```

No fake charts / placeholder cards.

---

# 10. Error Pattern

Inline:
- field error.

Block:
- failed data load.

Critical:
- issue banner.

Network:
- retry.

Не использовать один toast для всех типов ошибок.

---

# 11. Confirmation Pattern

Критические изменения:
- title;
- clear consequence;
- cancel;
- confirm.

Пример:
```text
Подтвердить доставку?
После подтверждения заявка будет отмечена как доставленная.
```

---

# 12. Upload Pattern

States:
- idle;
- selected;
- uploading;
- success;
- error.

Image:
- thumbnail.

PDF:
- file icon.

CTA:
- Добавить ещё.

---

# 13. Comment Pattern

Manager:
```text
[Внутренний | Виден клиенту]
textarea
[Отправить]
```

Scope visual должен быть очевиден до отправки.

---

# 14. Wizard Pattern

Structure:
```text
Back
Step / progress
Title
Description
Fields
Continue
Save Draft
```

Каждый step:
- одна смысловая группа;
- no unnecessary summary.

---

# 15. Pricing Pattern

Client:
```text
Перевозка               18 000 ₽
Разгрузка                3 500 ₽
Хранение                 2 700 ₽
-------------------------------
Итого                    24 200 ₽
```

Manager:
- editable rows;
- totals summary.

Reference:
`REF_09_INVOICE_FILTER` / `REF_06_INVOICES_DASHBOARD` only for visual density, not billing structure.

---

# 16. Profile Pattern

Reference:
`REF_05_PROFILE_CARD`.

Use:
- identity;
- contact actions;
- sections;
- badges;
- meta.

Driver profile:
- availability;
- vehicle;
- phone;
- recent jobs.

---

# 17. Map Pattern

Reference:
`REF_10_FLEET_MAP`.

Desktop:
- map dark;
- list beside;
- active item syncs with marker.

Markers:
- status-aware;
- limited colors.

No excessive animated pulsing.

---

# 18. Fleet Item Pattern

```text
Vehicle / Order
Driver
Origin
Destination
ETA / distance
Status
```

Problem:
- danger / warning indicator.

---

# 19. Warehouse Intake Pattern

Card:
```text
Ожидалось
5 мест / 1240 кг

Фактически
[ 4 ] мест
[ 1180 ] кг

Несоответствие: -1 место / -60 кг
[Фото]
[Комментарий]
[Принять груз]
```

---

# 20. Notification Pattern

Unread:
- stronger title;
- subtle accent dot.

Read:
- normal.

Do not fill unread rows with bright orange.

---

# 21. Search Pattern

Search must support:
- order number;
- company;
- supplier;
- route;
- driver where role allows.

Search result text should highlight match subtly.

---

# 22. Skeleton Pattern

Skeleton:
- same structure as final component;
- subtle animation;
- no bright shimmer.

---

# 23. Toast Pattern

Use for:
- saved;
- assigned;
- uploaded;
- failed.

Not for:
- long instructions;
- critical unresolved issues.

---

# 24. Inline Editing

Use only when:
- quick;
- reversible;
- obvious.

Good:
- service price;
- planned time.

Bad:
- entire order data set hidden behind uncontrolled inline edits.

---

# 25. Keyboard

Manager/Admin:
- tab navigation;
- Enter submit where safe;
- Escape close modal;
- keyboard focus visible.

Future:
command palette optional, not MVP.
