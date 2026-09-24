# 30 — RESPONSIVE RULES

## 1. Цель

Responsive — не уменьшенная desktop версия.

На каждом breakpoint необходимо менять:
- hierarchy;
- density;
- navigation;
- action placement;
- representation of data.

---

# 2. Breakpoints

Рекомендуемая логика:

```text
xs   < 375
sm   375–639
md   640–767
lg   768–1023
xl   1024–1279
2xl  1280+
```

Tailwind breakpoints можно использовать стандартные, но QA вести по указанным реальным widths.

---

# 3. Mobile 360–430

## Shell
- top bar;
- bottom nav;
- 18px page padding (16px below 375px);
- no permanent sidebar.

## Cards
- full width;
- 16–20px internal padding;
- avoid nested cards.

## Typography
- H1 26–28px;
- body 15–16px;
- captions and metadata at least 13px.

## Primary action
- full-width or strong sticky bottom;
- minimum 44px touch height;
- leave the bottom navigation and safe area unobstructed.

---

# 4. Tablet 640–1023

Можно:
- 2-column cards;
- collapsible sidebar;
- split details in selected screens;
- denser lists.

Warehouse tablet flow должен быть особенно комфортным.

---

# 5. Desktop 1024+

Sidebar:
- fixed / sticky.

Content:
- multi-column;
- tables;
- right rail;
- map split.

---

# 6. Large desktop 1440+

Не растягивать строки и формы бесконечно.

Использовать:
- max content width;
- grids;
- contextual panel;
- map area.

---

# 7. Navigation

## Driver mobile bottom nav
Пример:
```text
Сегодня
Задания
История
Профиль
```

## Client mobile
```text
Главная
Заявки
Создать
Уведомления
Профиль
```

Создать может быть центральным акцентным действием. Подписи нижней навигации не меньше 13px, при необходимости переносятся на две строки и не обрезаются.

## Manager mobile
```text
Главная
Заявки
План
Уведомления
Ещё
```

---

# 8. Tables

Desktop:
- native table.

Tablet:
- reduced columns.

Mobile:
- card list.

Нельзя:
- просто завернуть 8-column table в horizontal scroll как единственное решение.

---

# 9. Forms

### Mobile
- one field per row;
- 52px touch-friendly height for primary text and numeric entry;
- related small fields can be 2-column only if comfortable;
- select opens mobile-friendly popover/sheet;
- sticky Continue.

### Desktop
- 2-column layout;
- full-width for:
  - address;
  - textarea;
  - file upload;
  - complex selectors.

---

# 10. Order Details

### Mobile order:
```text
Header
Status
Primary action
Route
Contacts
Cargo
Services
Photos
Documents
Timeline
Finance
```

### Desktop:
```text
Header
Main 8/12
Context Rail 4/12
```

или:
```text
Main 9/12 + rail 3/12
```

---

# 11. Manager fleet view

### Desktop
```text
Sidebar
Fleet list 35–40%
Map 60–65%
```

### Tablet
- list above map / toggle.

### Mobile
- Map / List tabs.
- list default.

---

# 12. Driver job

Mobile:
- current status prominent;
- address;
- one-tap phone;
- open map;
- cargo summary;
- photos;
- sticky action.

Desktop version вторична.

---

# 13. Warehouse intake

Mobile/tablet:
- expected values;
- actual inputs;
- discrepancy state;
- camera upload;
- confirm.

Не делать desktop-only spreadsheet workflow.

---

# 14. Dialog responsive behavior

Desktop Dialog:
- max-width 480 / 640 / 800.

Mobile:
- if content > short confirmation → Drawer / full page.

---

# 15. Touch

Min comfortable:
```text
44px
```

List row with click:
- at least 48px height.

---

# 16. Hover

Никакая обязательная информация не должна появляться только по hover.

Hover enhancements только desktop.

---

# 17. Safe areas

Mobile sticky bottom UI:
```css
padding-bottom: env(safe-area-inset-bottom);
```

Bottom navigation / CTA не должны конфликтовать.

---

# 18. Long data

Проверять:
- длинное юрлицо;
- длинный адрес;
- длинный номер документа;
- длинное ФИО;
- 2–3 строки комментария;
- 6+ status words in Russian.

Использовать:
- wrap;
- clamp;
- tooltip только вторично.

---

# 19. Responsive QA widths

Обязательно:
```text
360x800
375x812
390x844
430x932
768x1024
1024x768
1280x800
1440x900
1920x1080
```

---

# 20. No horizontal overflow

`body` / app shell никогда не должны иметь случайный horizontal overflow.

Каждый data-heavy component обязан иметь responsive strategy до merge.
