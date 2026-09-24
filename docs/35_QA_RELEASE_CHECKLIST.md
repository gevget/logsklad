# 35 — QA & RELEASE CHECKLIST

## 1. Использование

Запустить этот checklist перед финальным demo deploy.

Критический failure в секциях:
- Database;
- Permissions;
- Order lifecycle;
- Core demo scenarios;
- Build;

блокирует релиз.

---

## Фактический срез приёмки — 24.09.2026

- Локальная PostgreSQL на 5435 здорова; Next.js отвечает на 3001.
- Flow A и B пройдены через UI и роли на сохранённых записях. Формы и карточки Flow C/D проверены; E (проблема с фото и продолжение маршрута) пройден.
- Права пяти ролей проверены в принятых сценариях; счётчик уведомлений, отметка прочтения и переход на нужную заявку работают.
- Все 11 локальных файлов присутствуют и совпадают по размеру с метаданными. Три заглушки заказа A заменены на изображения 960×600; клиентский API вернул 200 для каждого.
- После мобильной правки проверены 297 сочетаний маршрута и viewport. Нет горизонтального overflow, обрезанных метрик, видимого текста меньше 13 px или браузерных ошибок.
- pnpm lint, pnpm typecheck и pnpm build проходят.
- Полный reset-run, все административные CRUD-мутации, все loading/empty/error и accessibility-состояния, invalid/oversized uploads и внешнее Vercel/Supabase окружение не выдаются за проверенные. Для локального показа эти пункты не блокируют принятые сценарии; для полного release/deploy их нужно закрыть отдельно.
- Инструкция для показа: [38_LOCAL_DEMO_RUNBOOK.md](38_LOCAL_DEMO_RUNBOOK.md).

---

# 2. Repository

- [ ] структура соответствует проектной архитектуре;
- [ ] нет случайных duplicate folders;
- [ ] Docs не смешаны с runtime code;
- [ ] Reference не импортируется как production assets без необходимости;
- [ ] `.env.example` актуален;
- [ ] secrets отсутствуют в git.

---

# 3. Dependencies

- [ ] нет двух библиотек для одной задачи без причины;
- [ ] нет unused major dependencies;
- [ ] versions совместимы;
- [ ] install проходит clean.

---

# 4. Database

- [ ] migration проходит;
- [ ] schema соответствует Docs;
- [ ] foreign keys работают;
- [ ] indexes добавлены;
- [ ] seed проходит;
- [ ] seed повторяемый;
- [ ] hero orders существуют;
- [ ] status history заполнен;
- [ ] notifications заполнены;
- [ ] demo files не broken.

---

# 5. Demo Auth

- [x] Client switch работает;
- [x] Manager switch работает;
- [x] Driver switch работает;
- [x] Warehouse switch работает;
- [x] Admin switch работает;
- [x] refresh сохраняет identity;
- [ ] logout / reset behavior понятен.

---

# 6. Permissions

## Client
- [ ] только company data;
- [x] no internal notes;
- [x] no admin pages;
- [ ] no arbitrary status mutation.

## Manager
- [x] operational access;
- [x] no role management.

## Driver
- [x] only assigned jobs;
- [x] no finance;
- [x] no unrelated orders.

## Warehouse
- [x] only relevant warehouse operations;
- [x] no pricing management.

## Admin
- [x] system access;
- [x] audit read-only.

---

# 7. Lifecycle

- [x] DRAFT → SUBMITTED;
- [x] SUBMITTED → REVIEW;
- [x] REVIEW → CONFIRMED;
- [x] CONFIRMED → DRIVER_ASSIGNED;
- [x] Driver transitions valid;
- [x] Warehouse transitions valid;
- [x] direct delivery skips warehouse;
- [x] COMPLETED terminal;
- [ ] CANCELLED terminal;
- [ ] invalid transitions return clear error;
- [x] every transition creates StatusHistory.

---

# 8. Orders

- [ ] list;
- [ ] search;
- [ ] filters;
- [ ] detail;
- [ ] route;
- [ ] cargo;
- [ ] services;
- [ ] timeline;
- [ ] documents;
- [ ] comments;
- [ ] finance permissions;
- [ ] issue state.

---

# 9. Create Order

- [ ] all order types selectable;
- [ ] dynamic steps;
- [ ] validation;
- [ ] back preserves values;
- [ ] draft works;
- [ ] multiple cargo works;
- [ ] multiple pickup works or UI clearly reflects current MVP limitation;
- [ ] file upload;
- [ ] review;
- [ ] submit;
- [ ] data persists after reload.

---

# 10. Manager

- [x] incoming visible;
- [x] review;
- [x] pricing;
- [x] assign driver;
- [x] assign vehicle;
- [x] internal comment;
- [x] client-visible comment;
- [x] issue;
- [x] status;
- [ ] filters.

---

# 11. Driver

- [x] Today;
- [x] assignment;
- [x] pickup;
- [x] route;
- [ ] phone link;
- [ ] map link;
- [x] upload photo;
- [x] status action;
- [x] issue;
- [x] history;
- [x] mobile sticky CTA.

---

# 12. Warehouse

- [x] Expected;
- [x] search by order number;
- [x] intake;
- [x] expected values;
- [x] actual values;
- [ ] discrepancy;
- [x] photos;
- [x] operations;
- [x] ready for delivery;
- [x] release.

---

# 13. Admin

- [x] users;
- [x] companies;
- [x] drivers;
- [x] vehicles;
- [x] warehouses;
- [x] services;
- [x] orders;
- [x] audit;
- [x] demo reset protected.

---

# 14. Documents / Files

- [x] upload;
- [x] preview;
- [ ] download;
- [x] categories;
- [x] uploader;
- [ ] timestamp;
- [x] permission;
- [ ] invalid type rejected;
- [ ] oversized file rejected;
- [x] no broken seeded file.

---

# 15. Notifications

- [x] unread count;
- [x] list;
- [x] read;
- [x] deep link;
- [x] order submitted;
- [x] driver assigned;
- [x] pickup;
- [x] warehouse received;
- [x] delivery;
- [x] issue.

---

# 16. Finance

- [x] service pricing;
- [x] totals;
- [x] formatting ₽;
- [x] Client sees approved total;
- [x] Driver sees no finance;
- [ ] Manager price changes audit.

---

# 17. Visual

- [x] Dark Logistics OS;
- [x] graphite surfaces;
- [x] orange controlled accent;
- [x] no random color palette;
- [x] one icon family;
- [x] typography consistent;
- [x] cards consistent;
- [x] status tokens centralized;
- [x] map styling consistent;
- [x] timeline consistent.

---

# 18. Responsive

Check:
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

For each:
- [x] no horizontal body overflow;
- [x] no clipped action;
- [ ] dialogs fit;
- [x] navigation usable;
- [x] text readable.

---

# 19. Accessibility

- [ ] input labels;
- [ ] visible focus;
- [ ] keyboard navigation;
- [ ] buttons semantic;
- [ ] icon-only button aria-label;
- [ ] status not only color;
- [ ] dialogs manage focus;
- [ ] contrast acceptable.

---

# 20. States

Every major screen:
- [ ] loading;
- [ ] empty;
- [ ] error;
- [ ] populated.

Every mutation:
- [ ] loading;
- [ ] success feedback;
- [ ] error feedback;
- [ ] double-submit prevented.

---

# 21. Performance

- [ ] no obvious N+1;
- [ ] order list does not load all file binaries;
- [ ] images optimized;
- [ ] no huge client bundle caused by whole-app `"use client"`;
- [ ] pagination / reasonable list limits.

---

# 22. Code Quality

Run:

```bash
npm run lint
npm run typecheck
npm run build
```

All:
- [x] PASS

If tests exist:
```bash
npm test
```

- [x] PASS

---

# 23. Demo Test

Полностью пройти:
`33_DEMO_SCENARIOS_AND_ACCEPTANCE_TESTS.md`

- [x] Flow A
- [x] Flow B
- [x] Flow C
- [x] Flow D
- [x] Flow E
- [x] Permissions
- [x] Role Switcher

---

# 24. Deploy

- [ ] Vercel project configured;
- [ ] Supabase project configured;
- [ ] env configured;
- [ ] DB migrated;
- [ ] Storage configured;
- [ ] seed loaded;
- [ ] demo URL accessible;
- [ ] reload deep links works;
- [ ] no console critical errors.

---

# 25. Release Notes

Перед передачей подготовить:

```text
Implemented
Demo accounts / role switch
Known limitations
Future integrations
How to reset demo
How to run locally
```

---

# 26. Stop-ship conditions

Не релизить, если:
- role permissions сломаны;
- Client видит чужие данные;
- Driver видит finance;
- build падает;
- core order flow не сохраняет данные;
- status history не создаётся;
- mobile Driver flow непроходим;
- seed broken;
- demo deploy не открывается.
