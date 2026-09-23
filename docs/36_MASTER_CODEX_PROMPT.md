# 36 — MASTER CODEX PROMPT

## COPY THIS PROMPT TO CODEX

Ты работаешь над Demo MVP единой логистической платформы с собственным складом.

В корне проекта находятся две важные папки:

```text
/Docs
/Reference
```

`/Docs` — обязательная проектная документация и source of truth.

`/Reference` — визуальные референсы. Они задают направление дизайна, но не должны копироваться пиксель-в-пиксель.

---

# 1. ПЕРЕД НАЧАЛОМ

Сначала изучи ВСЕ документы в `/Docs` по порядку:

```text
01_MASTER_PRODUCT_SPEC.md
02_TECH_ARCHITECTURE.md
03_PROJECT_STRUCTURE.md
04_ROLES_AND_PERMISSIONS.md
05_DOMAIN_MODEL.md
06_DATABASE_SCHEMA.md
07_ORDER_LIFECYCLE.md
08_ORDER_TYPES_AND_SERVICES.md
09_DEMO_DATA_SPEC.md
10_CODEX_DEVELOPMENT_RULES.md

11_CLIENT_WORKFLOWS.md
12_MANAGER_WORKFLOWS.md
13_DRIVER_WORKFLOWS.md
14_WAREHOUSE_WORKFLOWS.md
15_ADMIN_WORKFLOWS.md
16_DOCUMENTS_AND_FILES.md
17_NOTIFICATIONS.md
18_FINANCE_AND_PRICING.md

19_INFORMATION_ARCHITECTURE.md
20_ROUTE_MAP_AND_NAVIGATION.md
21_SCREEN_CATALOG.md
22_DASHBOARD_STRATEGY.md
23_ORDER_DETAILS_UX.md
24_CREATE_ORDER_WIZARD.md
25_RESPONSIVE_AND_MOBILE_UX.md
26_REFERENCE_DESIGN_ANALYSIS.md

27_DESIGN_DIRECTION.md
28_DESIGN_SYSTEM.md
29_COMPONENT_LIBRARY.md
30_RESPONSIVE_RULES.md
31_UI_PATTERNS.md
32_VISUAL_QA.md

33_DEMO_SCENARIOS_AND_ACCEPTANCE_TESTS.md
34_IMPLEMENTATION_STAGES_CODEX_ROADMAP.md
35_QA_RELEASE_CHECKLIST.md
```

После этого изучи все изображения в `/Reference`.

Не начинай реализацию, пока не сформировал целостное понимание:
- продукта;
- ролей;
- сущностей;
- lifecycle;
- UX;
- visual direction;
- demo scenarios.

---

# 2. ЦЕЛЬ

Нужно создать рабочий Demo MVP логистической платформы.

Это НЕ:
- статический prototype;
- набор несвязанных экранов;
- fake dashboard;
- frontend на hardcoded JSON.

Это должен быть работающий full-stack demo с:
- реальной тестовой БД;
- CRUD;
- permissions;
- role switcher;
- реальным Order lifecycle;
- документами;
- фото;
- уведомлениями;
- responsive UI.

---

# 3. РОЛИ

Обязательные роли:

```text
CLIENT
MANAGER
DRIVER
WAREHOUSE
ADMIN
```

Одна и та же заявка должна быть доступна разным ролям согласно permissions.

---

# 4. ГЛАВНАЯ СУЩНОСТЬ

Главная сущность:
`Order`.

Не создавай независимые параллельные системы заявок для:
- доставки;
- склада;
- курьера.

Используй:
- `order_type`;
- conditional form sections;
- services;
- route points;
- lifecycle.

---

# 5. ТЕХНОЛОГИИ

Используй согласованный stack:

```text
Next.js App Router
React
TypeScript strict
Tailwind CSS
shadcn/ui
Lucide Icons
React Hook Form
Zod
PostgreSQL
Drizzle ORM
Supabase Postgres / Storage
Vercel
```

Zustand:
только для подходящего UI/local state.

Не меняй стек без реальной технической причины.

---

# 6. DEMO AUTH

В Demo MVP реализуй seeded identities:

```text
client@demo.local
manager@demo.local
driver@demo.local
warehouse@demo.local
admin@demo.local
```

Создай Role Switcher.

Он должен:
- менять реальную current demo identity;
- менять permissions;
- менять navigation;
- сохранять общие business data.

Client-side role hiding НЕ является authorization.

Server mutations обязаны проверять permissions.

---

# 7. DATABASE

Собери Drizzle schema по Docs.

Создай:
- migrations;
- seed;
- deterministic demo data.

Dataset должен быть реалистичным:
- компании;
- пользователи;
- поставщики;
- водители;
- машины;
- склады;
- услуги;
- 24–30 заявок;
- cargo;
- route points;
- files;
- status history;
- comments;
- notifications;
- warehouse operations.

Не используй:
`Test User`, `Company 1`, `Lorem Ipsum`.

---

# 8. ORDER LIFECYCLE

Статус нельзя менять прямым update из UI.

Создай централизованную state machine.

Каждый status transition:
1. permission check;
2. transition validation;
3. Order update;
4. StatusHistory;
5. AuditLog;
6. notifications;
7. special timestamps when relevant.

---

# 9. ОСНОВНОЙ DEMO FLOW

Обязательно должен работать:

```text
Client создаёт Order
↓
Manager принимает
↓
Manager назначает Driver
↓
Driver забирает груз
↓
Warehouse принимает
↓
Warehouse обрабатывает
↓
Manager запускает доставку
↓
Driver доставляет
↓
Manager завершает
↓
Client видит полный timeline
```

Это ключевой acceptance scenario.

---

# 10. DESIGN

Визуальное направление:

# Dark Logistics OS

Используй `/Reference` и Docs 26–32.

Основные принципы:
- dark graphite;
- premium enterprise SaaS;
- controlled orange accent;
- thin borders;
- restrained shadows;
- subtle surfaces;
- high data clarity;
- modern typography;
- maps and timelines as first-class patterns.

НЕ делать:
- generic Bootstrap admin;
- Material-like bright UI;
- purple SaaS;
- neon cyberpunk;
- giant glass gradients;
- random colors;
- oversized radius everywhere.

---

# 11. DESIGN TOKENS

Используй значения из:
`28_DESIGN_SYSTEM.md`.

Не создавай локальные hex-цвета по всему проекту.

Централизуй:
- surfaces;
- text;
- border;
- accent;
- status semantics;
- spacing;
- radius.

---

# 12. MOBILE FIRST

Проект должен быть responsive с самого начала.

Особенно:

### Driver
Mobile-first обязательно.

### Client
Mobile-friendly обязательно.

### Warehouse
Phone/tablet обязательно.

### Manager/Admin
Desktop-primary, но responsive.

Проверяй минимум:
```text
375
390
430
768
1024
1440
```

Не допускай horizontal body overflow.

---

# 13. ROUTES

Используй route map из `20_ROUTE_MAP_AND_NAVIGATION.md`.

Основные namespaces:

```text
/client
/manager
/driver
/warehouse
/admin
```

Не придумывай альтернативную структуру без необходимости.

---

# 14. CREATE ORDER

Create Order должен быть wizard, а не огромная форма.

Dynamic sections зависят от `order_type`.

Поддержать:
- supplier;
- route;
- cargo;
- services;
- delivery;
- documents;
- insurance;
- review.

Поддержать:
- draft;
- submit;
- persistent data.

---

# 15. FILES

Использовать Supabase Storage.

Files:
- cargo photos;
- warehouse photos;
- documents;
- invoices;
- proof of delivery.

Хранить metadata в PostgreSQL.

Проверять:
- mime;
- size;
- permissions.

---

# 16. NOTIFICATIONS

Реализовать in-app notifications.

Domain events должны создавать реальные DB notifications.

Минимум:
- Order submitted;
- Driver assigned;
- Pickup;
- Warehouse received;
- Ready for delivery;
- Delivered;
- Issue.

Архитектура должна позволять позже подключить Telegram adapter, но Telegram сейчас не является обязательным core MVP.

---

# 17. FINANCE

Реализовать lightweight pricing:
- services;
- unit price;
- total;
- discount;
- tax;
- insurance;
- total.

Не строить сложный tariff engine.

Driver не видит finance.

---

# 18. MAPS

Для Demo:
- route data;
- dark map panel where appropriate;
- open external map action.

Не требуется:
- live GPS;
- route optimization;
- telematics.

Не имитируй live GPS фальшивой анимацией.

---

# 19. QUALITY RULES

Обязательно следуй `10_CODEX_DEVELOPMENT_RULES.md`.

В частности:

- TypeScript strict;
- no `any` без крайней причины;
- no duplicate components;
- no direct status update;
- no hardcoded Orders in React;
- no business authorization from client payload;
- loading/empty/error states;
- accessible controls;
- mobile QA.

---

# 20. ПОРЯДОК РАЗРАБОТКИ

Следуй строго:
`34_IMPLEMENTATION_STAGES_CODEX_ROADMAP.md`.

Не пытайся сделать всё одним pass.

После каждого Stage:

1. проверь код;
2. запусти lint;
3. запусти typecheck;
4. запусти build;
5. исправь ошибки;
6. только потом переходи дальше.

---

# 21. REPORT FORMAT AFTER EACH STAGE

После завершения каждого этапа выведи:

```text
STAGE N COMPLETE

Implemented:
- ...

Validated:
- lint: PASS
- typecheck: PASS
- build: PASS

Routes:
- ...

Database changes:
- ...

Known limitations:
- ...

Next:
- Stage N+1
```

Не объявляй Stage complete, если validation не проходит.

---

# 22. НЕ РАСШИРЯЙ SCOPE

Без отдельного запроса не добавляй:

- 1C;
- Диадок / СБИС;
- payment gateway;
- GPS tracking;
- route optimization;
- native apps;
- production Telegram bot;
- full WMS;
- QR/barcodes;
- light theme;
- advanced BI;
- loyalty;
- cashback.

Архитектура должна позволять добавить их позже.

---

# 23. НЕ ПЕРЕПИСЫВАЙ РАДИ ПЕРЕПИСЫВАНИЯ

Если репозиторий уже содержит рабочий код:
- сначала изучи его;
- сохрани совместимые решения;
- меняй минимально необходимое.

Не удаляй working code только потому, что предпочитаешь другой паттерн.

---

# 24. ВИЗУАЛЬНЫЙ PASS

После functional MVP обязательно выполни отдельный visual pass.

Сравни:
- Client Dashboard;
- Manager Dashboard;
- Manager Order;
- Fleet / Planning;
- Driver Job;
- Warehouse Intake;
- Admin Users;

с `/Reference`.

Добейся общего визуального языка, а не отдельных красивых экранов.

---

# 25. FINAL QA

Перед финальным отчётом полностью пройди:

```text
33_DEMO_SCENARIOS_AND_ACCEPTANCE_TESTS.md
35_QA_RELEASE_CHECKLIST.md
```

Все critical checks должны пройти.

---

# 26. FINAL OUTPUT

После завершения всего MVP выведи:

```text
MVP COMPLETE

Implemented modules:
...

Demo roles:
...

Primary demo scenario:
...

Routes:
...

Database:
...

Seed:
...

Storage:
...

Responsive QA:
...

Validation:
lint: PASS
typecheck: PASS
build: PASS

Known Demo limitations:
...

Future-ready integrations:
...

How to run locally:
...

How to reset demo:
...
```

---

# 27. ГЛАВНЫЙ ПРИНЦИП

При любом выборе приоритет:

```text
business correctness
→ permissions
→ clarity
→ usability
→ visual polish
```

Не жертвуй рабочей логикой ради красивой картинки.

Начинай с чтения всей документации и аудита репозитория.
После этого переходи к `STAGE 0` из roadmap.
