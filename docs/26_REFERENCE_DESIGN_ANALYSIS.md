# 26 — REFERENCE DESIGN ANALYSIS

## 1. Общий вывод

Все предоставленные референсы формируют один устойчивый визуальный язык:

> тёмный премиальный enterprise SaaS с высокой информационной плотностью, тонкой геометрией, минимальными границами и ярким оранжевым акцентом.

Это хорошо подходит логистической платформе:
- серьёзно;
- технологично;
- не выглядит как generic CRM;
- хорошо работает с картами, статусами, timeline и данными.

---

## 2. Базовая атмосфера

### Background
Очень тёмный:
- black / charcoal;
- без чистого #000 на всех слоях;
- поверхности различаются на 2–6% brightness.

### Panels
- мягко отделены от фона;
- тонкий border;
- слабый внутренний highlight;
- без тяжёлых drop shadows.

### Radius
Средний / крупный:
- cards примерно 14–22px;
- buttons 8–12px;
- pills full / semi-pill.

---

## 3. Primary accent

Оранжевый — главный интерактивный accent.

Использовать для:
- primary CTA;
- active nav;
- selected filters;
- focus / key outline;
- map markers;
- highlighted values;
- warning-like attention where semantic conflict отсутствует.

Не заливать оранжевым большие площади интерфейса.

---

## 4. Semantic colors

Помимо orange:
- green — success / delivered / positive;
- red — error / overdue / issue;
- yellow / amber — waiting / warning;
- cyan / blue — location / tracking / neutral informational.

Цвет всегда должен иметь смысл.

---

## 5. Typography

Характер:
- modern grotesk;
- neutral;
- high legibility;
- компактный SaaS rhythm.

Рекомендация:
- Geist / Inter / similar.

Hierarchy:
- Page title: strong but not oversized.
- Card title: 14–18.
- Primary metric: 24–34 where appropriate.
- Body: 13–15.
- Meta: 11–13.

Не использовать ultra-thin weights.

---

## 6. Density

Референсы достаточно плотные.

Для нашего продукта:
- Manager/Admin: medium-high density;
- Client: medium density;
- Driver/Warehouse mobile: lower density, larger actions.

Не копировать одинаковую плотность на все роли.

---

## 7. Borders and separators

Главный инструмент структуры:
- 1px low-contrast borders;
- subtle row separators;
- group background shifts.

Не использовать:
- толстые outlines;
- excessive shadows;
- карточку внутри карточки внутри карточки без необходимости.

---

## 8. Glow

Есть слабые orange / red glow effects.

Использовать только:
- hero metric;
- active map state;
- critical status;
- selected card.

Не делать neon aesthetic.

---

## 9. Reference-by-reference

### REF_01_ANALYTICS_DASHBOARD
Берём:
- KPI cards;
- dark graph area;
- low contrast grid;
- compact filter controls.

Не берём:
- много разноцветных точек как постоянный визуальный мотив.

### REF_02_PRICING_CARD
Берём:
- controlled orange glow;
- polished card surface;
- bottom action bar.

### REF_03_DENSE_DETAIL_MODAL
Берём:
- grouped dense information;
- in-place controls;
- subtle status indicators.

Адаптация:
- формы сделать крупнее и проще.

### REF_04_LOGISTICS_MAP_CARD
Очень релевантен.
Берём:
- map + entity detail;
- status progression;
- route identity;
- shipment code.

### REF_05_PROFILE_CARD
Берём:
- profile hierarchy;
- icon actions;
- section separators;
- verified/status accent.

### REF_06_INVOICES_DASHBOARD
Берём:
- desktop shell;
- sidebar rail;
- filter pills;
- metric summary;
- grid/list hybrid.

### REF_07_METRICS_CHART
Берём:
- dark analytical panel;
- subtle line chart;
- compact top metrics.

### REF_08_TRACKING_TIMELINE
Ключевой референс.
Берём:
- transport summary;
- timeline;
- ETA;
- route information;
- carrier/driver card;
- dark operational density.

### REF_09_INVOICE_FILTER
Берём:
- dropdown styling;
- selected orange state;
- subdued menu items;
- mobile-friendly panel.

### REF_10_FLEET_MAP
Ключевой Manager reference.
Берём:
- sidebar + list + map;
- vehicle status markers;
- search/filter row;
- dense operations layout.

---

## 10. What NOT to copy

Не копировать буквально:
- тексты;
- брендовые иконки;
- layout пиксель-в-пиксель;
- exact proprietary visual compositions.

Использовать как visual direction.

---

## 11. Proposed design language

Рабочее название:
`Dark Logistics OS`

Принципы:
1. Operational first.
2. Dark graphite hierarchy.
3. Orange as controlled energy.
4. Dense, not cramped.
5. Maps and timelines are first-class.
6. Status is always readable.
7. Mobile actions are larger than desktop controls.
8. One design system across all roles.

---

## 12. Design Pack input

Этот файл является основой для следующих документов:
- `27_DESIGN_DIRECTION.md`
- `28_DESIGN_SYSTEM.md`
- `29_COMPONENT_LIBRARY.md`
- `30_RESPONSIVE_RULES.md`
- `31_UI_PATTERNS.md`
- `32_VISUAL_QA.md`

Все 10 reference images находятся в `/references`.
