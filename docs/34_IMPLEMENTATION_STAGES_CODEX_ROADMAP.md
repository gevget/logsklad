# 34 — IMPLEMENTATION STAGES / CODEX ROADMAP

## 1. Назначение

Этот файл определяет порядок разработки.

Codex не должен пытаться собрать весь продукт одним гигантским проходом.

Работа выполняется этапами.
После каждого этапа:
- build;
- typecheck;
- smoke test;
- фиксация результата.

---

# STAGE 0 — Repository Audit

Если репозиторий уже существует:

1. изучить структуру;
2. изучить package.json;
3. найти существующие routes/components;
4. определить, что можно сохранить;
5. не удалять рабочий код без необходимости.

Если пустой:
- создать Next.js App Router project;
- TypeScript strict;
- Tailwind;
- базовый lint.

### Done
- проект запускается;
- структура соответствует `03_PROJECT_STRUCTURE.md`.

---

# STAGE 1 — Foundation

Реализовать:
- app shell;
- global theme;
- design tokens;
- typography;
- sidebar;
- mobile top/bottom navigation;
- base UI primitives;
- role config;
- demo role switcher.

Документы:
```text
01
02
03
04
27
28
29
30
```

### Done
- все 5 role shells открываются;
- navigation меняется;
- responsive shell работает.

---

# STAGE 2 — Database

Реализовать:
- PostgreSQL;
- Drizzle;
- schema;
- migrations;
- DB connection;
- seed system.

Документы:
```text
05
06
09
```

Seed:
- companies;
- users;
- drivers;
- vehicles;
- warehouses;
- suppliers;
- services;
- orders;
- cargo;
- route points;
- documents;
- histories;
- notifications.

### Done
```bash
npm run db:seed
```
создаёт полноценный dataset.

---

# STAGE 3 — Demo Auth / Permissions

Реализовать:
- current demo user;
- cookie/session mechanism;
- role switch;
- server-side permissions;
- route guards.

Документ:
```text
04_ROLES_AND_PERMISSIONS.md
```

### Done
- Client не открывает Admin;
- Driver не видит чужие Orders;
- смена роли реально меняет permission context.

---

# STAGE 4 — Order Domain

Реализовать:
- Order queries;
- Order mutations;
- lifecycle service;
- status history;
- audit;
- domain helpers.

Документы:
```text
05
07
08
```

### Done
- status нельзя менять произвольно;
- valid transitions работают;
- invalid transitions блокируются.

---

# STAGE 5 — Client MVP

Реализовать:
- Client Dashboard;
- Orders list;
- Order Details;
- Create Order wizard;
- Documents;
- Notifications;
- Profile.

Документы:
```text
11
19–25
27–32
```

### Done
Client:
- создаёт draft;
- отправляет;
- видит новую заявку;
- видит timeline.

---

# STAGE 6 — Manager MVP

Реализовать:
- Dashboard;
- Incoming;
- Orders;
- Order workspace;
- pricing;
- driver assignment;
- vehicle assignment;
- comments;
- issue;
- planning basic.

Документы:
```text
12
18
22
23
31
```

### Done
Manager может провести заявку от SUBMITTED до DRIVER_ASSIGNED.

---

# STAGE 7 — Driver MVP

Реализовать mobile-first:
- Today;
- Jobs;
- Job Details;
- status actions;
- photo upload;
- issue;
- History.

Документы:
```text
13
25
30
31
```

### Done
Driver demo flow проходит на 375px.

---

# STAGE 8 — Warehouse MVP

Реализовать:
- Dashboard;
- Expected;
- Intake;
- In Warehouse;
- Processing;
- Ready;
- warehouse operations;
- photos;
- discrepancy.

Документы:
```text
14
25
30
31
```

### Done
Warehouse принимает реальный Order и меняет shared state.

---

# STAGE 9 — Admin MVP

Реализовать:
- Overview;
- Users;
- Companies;
- Drivers;
- Vehicles;
- Warehouses;
- Services;
- Orders;
- Audit;
- Demo Tools.

Документ:
```text
15
```

### Done
Core directories управляются через UI.

---

# STAGE 10 — Files & Notifications

Провести system-wide integration:
- storage;
- file preview;
- categories;
- in-app notifications;
- deep links.

Документы:
```text
16
17
```

### Done
Actions создают реальные notifications и attachments.

---

# STAGE 11 — Visual Pass

Использовать:
```text
Reference/*
Docs/26_REFERENCE_DESIGN_ANALYSIS.md
Docs/27_DESIGN_DIRECTION.md
Docs/28_DESIGN_SYSTEM.md
Docs/29_COMPONENT_LIBRARY.md
Docs/30_RESPONSIVE_RULES.md
Docs/31_UI_PATTERNS.md
Docs/32_VISUAL_QA.md
```

Задачи:
- привести все surfaces;
- typography;
- spacing;
- status colors;
- cards;
- lists;
- tables;
- timeline;
- maps;
- mobile navigation.

### Done
Интерфейс воспринимается как один продукт.

---

# STAGE 12 — Responsive Pass

Проверить:
```text
360
375
390
430
768
1024
1280
1440
1920
```

Особое внимание:
- Driver;
- Client Order;
- Wizard;
- Warehouse Intake.

---

# STAGE 13 — Demo Scenario Pass

Пройти полностью `33_DEMO_SCENARIOS_AND_ACCEPTANCE_TESTS.md`.

Не исправлять только визуально.
Все состояния должны реально сохраняться.

---

# STAGE 14 — QA & Stabilization

- lint;
- typecheck;
- build;
- permissions;
- loading;
- empty;
- error;
- broken links;
- uploads;
- seed;
- reset;
- mobile overflow.

Документ:
```text
35_QA_RELEASE_CHECKLIST.md
```

---

# STAGE 15 — Deploy

Target:
- Vercel;
- Supabase.

Проверить:
- environment variables;
- migrations;
- storage;
- preview;
- production/demo URL.

---

# 2. Правило stage boundaries

После каждого Stage Codex должен вывести:

```text
STAGE N COMPLETE

Implemented:
- ...

Validated:
- lint
- typecheck
- build

Known limitations:
- ...

Next:
- Stage N+1
```

Если validation падает:
не объявлять Stage complete.

---

# 3. Не делать раньше времени

До завершения core MVP не добавлять:
- real Telegram integration;
- GPS;
- routing optimization;
- 1C;
- payment gateway;
- light theme;
- command palette;
- custom animation system;
- advanced analytics.

---

# 4. Scope protection

Если возникает новая идея:
1. проверить Docs;
2. определить, входит ли она в Demo MVP;
3. если нет — записать как future extension;
4. не расширять scope автоматически.

---

# 5. Главный критерий порядка

Сначала:
**data → permissions → business logic → screens → polish**

Не наоборот.
