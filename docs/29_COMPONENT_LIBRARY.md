# 29 — COMPONENT LIBRARY

## 1. Цель

Собрать ограниченный, переиспользуемый component set.

Не делать новый компонент для каждого экрана.

---

# 2. Core Primitives

База:
- shadcn/ui;
- адаптированная под Design System.

Обязательные primitives:

```text
Button
IconButton
Input
Textarea
Select
Combobox
Checkbox
RadioGroup
Switch
DatePicker
TimeInput
Dialog
Sheet
Drawer
Popover
DropdownMenu
Tooltip
Tabs
Accordion
Separator
Badge
Avatar
Skeleton
Toast
Progress
Table
ScrollArea
```

---

# 3. Buttons

Variants:

```text
primary
secondary
ghost
danger
outline
```

Sizes:
```text
sm
md
lg
icon
```

Видимый текст — минимум 13px. Кнопки — от 44px; поля ввода — 50px на desktop и 52px на mobile. Мобильная цель нажатия — не меньше 44px.

Primary:
- orange background;
- dark text or high-contrast white depending final AA contrast;
- restrained hover glow; selected / primary actions may use the shared accent glow.

Не иметь одновременно 3 primary buttons в одном visual zone.

---

# 4. StatusBadge

API concept:

```tsx
<StatusBadge status="DELIVERY_IN_PROGRESS" />
```

Компонент сам определяет:
- label;
- semantic color;
- icon/dot;
- low-contrast semantic surface and border.

Не хардкодить цвет статуса в страницах и не передавать статус только оттенком.

---

# 5. EntityCard

Reusable pattern:
- title;
- subtitle;
- status;
- meta rows;
- optional trailing action.

Использовать для:
- order;
- driver;
- vehicle;
- company;
- supplier.

---

# 6. MetricCard

Содержит:
- label;
- value;
- optional delta;
- optional helper;
- optional icon.

Reference:
`REF_01`, `REF_07`.

Значение — главный визуальный акцент; подпись и пояснение остаются читаемыми. Статусный цвет или glow использовать только при наличии смысла. Не превращать metric cards в rainbow cards.

---

# 7. OrderCard

Mobile / compact list.

Показывает:
- number;
- type;
- status;
- route;
- planned date;
- optional driver;
- next milestone.

CTA:
- open.

---

# 8. OrderTable

Desktop.

Columns configurable by role.

Common:
- number;
- client;
- route;
- type;
- status;
- date;
- driver;
- total;
- actions.

Не показывать все колонки всем ролям. Строки имеют достаточную высоту для чтения и отдельное ненавязчивое состояние hover; на mobile использовать карточки с тем же порядком данных.

---

# 9. RouteSummary

Варианты:
- compact;
- detailed.

Compact:
```text
Москва
↓
Воронеж
```

Detailed:
- addresses;
- contacts;
- timestamps;
- intermediate points.

---

# 10. Timeline

Reusable.

Event:
```ts
{
  title,
  timestamp,
  description,
  status,
  actor,
  location,
  icon
}
```

Variant:
- public;
- internal.

Reference:
`REF_08_TRACKING_TIMELINE`.

---

# 11. MapPanel

Container abstraction.

MVP может использовать:
- static / basic map implementation;
- external link.

Layout:
- dark map;
- controlled markers;
- right/left detail panel.

Reference:
`REF_10_FLEET_MAP`.

Map should not dictate business logic.

---

# 12. DriverCard

Показывает:
- avatar;
- name;
- availability;
- phone;
- vehicle;
- current assignment.

Variant:
- compact assignment;
- admin profile.

---

# 13. VehicleCard

Поля:
- name;
- plate;
- type;
- capacity;
- status;
- current driver optionally.

---

# 14. CargoCard

Поля:
- title;
- category;
- places;
- weight;
- dimensions;
- supplier;
- special requirements.

---

# 15. ServiceRow

- service;
- quantity;
- unit;
- unit price;
- total;
- completed state;
- edit action by permission.

---

# 16. FileCard

- file type icon / thumbnail;
- filename;
- size;
- category;
- uploader;
- date;
- actions;
- visible selected-file name after choosing a file.

Image variant:
- thumbnail grid.

---

# 17. CommentComposer

Modes:
- Internal
- Client-visible

Manager UI должен явно показывать выбранный mode.

---

# 18. EmptyState

Structure:
- optional icon;
- title;
- description;
- optional CTA.

Не использовать mascot / illustration для каждой пустоты.

---

# 19. IssueBanner

Показывает:
- issue label;
- reason;
- timestamp;
- actor;
- action.

Semantic:
danger / warning.

---

# 20. NotificationItem

- icon;
- title;
- body;
- timestamp;
- unread state;
- deep link.

---

# 21. FilterBar

Desktop:
- search;
- status;
- type;
- date;
- driver;
- more filters.

Mobile:
- search;
- filter button;
- active filter chips;
- filter Sheet.

---

# 22. SegmentControl

Использовать для:
- All / Active / Completed;
- Map / Vehicles / Drivers.

Reference:
`REF_04`, `REF_10`.

---

# 23. AppShell

Desktop:
- Sidebar;
- Header;
- Main;
- Optional contextual panel.

Mobile:
- TopBar;
- Main;
- BottomNav with labels that wrap without clipping;
- StickyAction above the safe area.

Desktop content uses a 36–40px page gutter; mobile uses 18px (16px below 375px).

---

# 24. RoleSwitcher

Demo-only.

Display:
- current role;
- current demo user.

Desktop:
- sidebar footer or top-right menu.

Mobile:
- hidden under profile/demo menu.

Visual styling:
- clearly demo utility;
- не путать с production role UI.

---

# 25. Modal / Drawer policy

Desktop:
- Dialog for small / medium forms.
- Sheet for contextual editing.
- Full page for complex workflows.

Mobile:
- Drawer / bottom sheet for quick action.
- Full page for complex forms.

Не помещать Create Order целиком в modal.

---

# 26. Destructive actions

Всегда:
- danger style;
- confirm;
- explain consequence.

Не использовать orange как destructive.

---

# 27. Loading components

- CardSkeleton
- TableSkeleton
- DetailSkeleton
- TimelineSkeleton

Skeleton должен повторять layout, а не быть случайным набором серых полос.

---

# 28. Component state checklist

Каждый интерактивный компонент:
- default;
- hover;
- focus;
- active;
- disabled;
- loading;
- error where relevant.

---

# 29. Ownership

Feature-specific components остаются внутри feature folder.

Design-system primitives:
`components/ui`.

Shared product components:
`components/shared`.
