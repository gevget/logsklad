# 22 — DASHBOARD STRATEGY

## 1. Reference basis

Главные референсы:
- `REF_01_ANALYTICS_DASHBOARD`
- `REF_06_INVOICES_DASHBOARD`
- `REF_07_METRICS_CHART`
- `REF_10_FLEET_MAP`

Общий характер:
- dark enterprise SaaS;
- крупная рабочая область;
- тонкие границы;
- компактные KPI;
- мало декоративного цвета;
- яркий accent только для действия / риска / статуса.

---

## 2. Dashboard не равен BI

В MVP dashboard должен отвечать:
> что мне нужно сделать сейчас?

А не:
> какие красивые графики можно показать?

---

## 3. Client dashboard

Приоритет:
1. активные заявки;
2. текущий статус;
3. ближайшая доставка;
4. уведомления;
5. быстрый CTA «Создать заявку».

KPI:
- активные;
- завершено за месяц;
- требуют внимания.

График необязателен.

---

## 4. Manager dashboard

Приоритет:
1. новые;
2. без водителя;
3. сегодня;
4. issue;
5. карта / список активных перевозок.

KPI row:
- Incoming
- Active
- At Warehouse
- In Delivery
- Issues

Можно использовать компактный chart, но operational list важнее.

---

## 5. Driver dashboard

Приоритет:
- current job;
- next stop;
- ETA / planned time;
- action button.

Никаких KPI ради KPI.

---

## 6. Warehouse dashboard

Приоритет:
- ожидается сегодня;
- прибыло;
- в обработке;
- готово к выдаче;
- issue.

---

## 7. Admin dashboard

Простой overview:
- users;
- companies;
- orders;
- drivers;
- issues.

---

## 8. Card language

Референсы показывают:
- большой radius;
- почти чёрные панели;
- 1px border;
- слабые внутренние highlights;
- высокий контраст key value;
- muted secondary labels.

Не делать карточки «стеклянными» в агрессивном смысле.
Glass — очень сдержанный.

---

## 9. Color semantics

Primary accent:
- orange.

Semantic:
- green = success / complete;
- red = overdue / error;
- amber = warning / attention;
- blue/cyan = info / location / neutral tracking.

Не использовать rainbow UI без причины.
