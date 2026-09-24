# 27 — DESIGN DIRECTION

## 1. Рабочее название визуального языка

# Dark Logistics OS

Тёмная операционная система для логистики:
- технологичная;
- премиальная;
- плотная;
- спокойная;
- профессиональная;
- без визуального шума;
- с контролируемым оранжевым акцентом.

Визуально продукт должен ощущаться ближе к современному enterprise SaaS / fleet management продукту, чем к «корпоративному сайту» или классической CRM.

---

## 2. Источники визуального направления

Основные референсы находятся в PACK 03:

```text
references/REF_01_ANALYTICS_DASHBOARD.webp
references/REF_02_PRICING_CARD.webp
references/REF_03_DENSE_DETAIL_MODAL.webp
references/REF_04_LOGISTICS_MAP_CARD.webp
references/REF_05_PROFILE_CARD.webp
references/REF_06_INVOICES_DASHBOARD.webp
references/REF_07_METRICS_CHART.webp
references/REF_08_TRACKING_TIMELINE.webp
references/REF_09_INVOICE_FILTER.webp
references/REF_10_FLEET_MAP.webp
```

Ключевые для проекта:
1. `REF_10_FLEET_MAP` — Manager / fleet / map.
2. `REF_08_TRACKING_TIMELINE` — Order Details / tracking.
3. `REF_06_INVOICES_DASHBOARD` — shell / dense dashboard.
4. `REF_04_LOGISTICS_MAP_CARD` — logistics card / route / status.
5. `REF_03_DENSE_DETAIL_MODAL` — information grouping.

---

## 3. Характер интерфейса

Интерфейс должен передавать:

### Контроль
Пользователь всегда понимает:
- где груз;
- что происходит;
- что нужно сделать дальше;
- кто ответственный;
- есть ли проблема.

### Скорость
Основные действия:
- находятся быстро;
- не спрятаны в сложных меню;
- имеют понятный priority.

### Надёжность
Данные выглядят структурированно.
Нет ощущения «красивого концепта без продукта».

### Премиальность
Достигается:
- типографикой;
- тонкими границами;
- качественной плотностью;
- аккуратными состояниями;
- хорошей работой с пустым пространством.

Не достигается:
- огромным glass blur;
- neon;
- gradients everywhere;
- чрезмерными glow effects.

---

## 4. Visual hierarchy

Приоритет визуальной иерархии:

```text
1. Статус / следующее действие
2. Номер / идентичность сущности
3. Ключевые данные
4. Маршрут / сроки
5. Secondary meta
6. История / служебная информация
```

На любом экране пользователь должен за 2–3 секунды понять:
- где он;
- с каким объектом работает;
- текущее состояние;
- что можно сделать.

---

## 5. Color philosophy

Основная палитра:
- graphite / charcoal;
- near-black;
- soft gray;
- white;
- orange accent.

Оранжевый:
- primary CTA;
- active navigation;
- selected control;
- map marker;
- highlight;
- focus.

Не использовать orange:
- как фон большой страницы;
- для всех badges;
- для всех иконок;
- для decorative gradients без функции.

---

## 6. Surface system

Продукт должен иметь 4 слоя:

### Canvas
Самый тёмный фон приложения.

### Surface 1
Основные panels / cards / sidebar.

### Surface 2
Interactive rows / grouped blocks.

### Surface 3
Hover / selected / elevated / modal.

Разница между слоями должна быть небольшой, но читаемой.

---

## 7. Border philosophy

Основной разделитель:
- 1px border;
- low contrast;
- без жирных серых рамок.

Borders используются чаще, чем shadows.

Shadows:
- только elevated surfaces;
- modal;
- dropdown;
- floating panel.

---

## 8. Radius language

Общий характер:
- мягкий;
- современный;
- без «пузырчатости».

Рекомендуемые:
- 8px — small controls;
- 10–12px — inputs/buttons;
- 14–16px — cards;
- 18–20px — large panels / modals.

Не использовать 24–32px radius на каждой карточке.

---

## 9. Density by role

### Manager
Medium-high density.

### Admin
Medium-high density.

### Client
Medium density.

### Warehouse
Medium density, крупнее operational controls.

### Driver
Low-medium density, large mobile actions.

Один и тот же design system, но разная плотность.

---

## 10. Core visual motifs

### Status
Всегда:
- badge;
- icon / dot where needed;
- text label.

Не полагаться только на цвет.

### Timeline
Один из ключевых визуальных мотивов продукта.

### Route
Маршрут — не просто текст.
Использовать:
- origin;
- destination;
- intermediate points;
- line / directional cue;
- map where useful.

### Data cards
Короткие и конкретные:
- label;
- value;
- delta / state.

---

## 11. Animation

Animation должна быть restrained.

Допустимо:
- 120–200ms hover / press;
- modal fade/scale;
- accordion;
- progress;
- skeleton;
- status change feedback.

Не использовать:
- floating cards;
- continuous glow;
- parallax;
- playful spring animation в operational flow.

---

## 12. Imagery

Внутри продукта изображения функциональные:
- cargo photos;
- warehouse photos;
- proof of delivery;
- avatars;
- map.

Не добавлять decorative 3D / stock illustrations в operational screens.

---

## 13. Desktop personality

Desktop:
- compact sidebar;
- dense working area;
- wide content;
- split views;
- tables;
- map + list;
- contextual rail.

---

## 14. Mobile personality

Mobile:
- спокойнее;
- крупнее;
- меньше информации одновременно;
- primary action всегда виден;
- cards вместо сложных tables;
- bottom nav.

---

## 15. Anti-patterns

Не делать:
- generic purple SaaS;
- neon cyberpunk;
- blue-on-black everywhere;
- excessive glass;
- huge gradients;
- 8 видов radius;
- 15 цветов статусов;
- any visible text smaller than 13px;
- all-caps интерфейс;
- oversized hero typography внутри ЛК;
- dashboard, состоящий только из графиков.

---

## 16. Итог

Визуальный результат должен выглядеть так, будто это:
> современная платформа управления логистикой, которой реально пользуются каждый день.

Красота — следствие порядка, а не отдельный слой поверх продукта.
