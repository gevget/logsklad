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

- [ ] Client switch работает;
- [ ] Manager switch работает;
- [ ] Driver switch работает;
- [ ] Warehouse switch работает;
- [ ] Admin switch работает;
- [ ] refresh сохраняет identity;
- [ ] logout / reset behavior понятен.

---

# 6. Permissions

## Client
- [ ] только company data;
- [ ] no internal notes;
- [ ] no admin pages;
- [ ] no arbitrary status mutation.

## Manager
- [ ] operational access;
- [ ] no role management.

## Driver
- [ ] only assigned jobs;
- [ ] no finance;
- [ ] no unrelated orders.

## Warehouse
- [ ] only relevant warehouse operations;
- [ ] no pricing management.

## Admin
- [ ] system access;
- [ ] audit read-only.

---

# 7. Lifecycle

- [ ] DRAFT → SUBMITTED;
- [ ] SUBMITTED → REVIEW;
- [ ] REVIEW → CONFIRMED;
- [ ] CONFIRMED → DRIVER_ASSIGNED;
- [ ] Driver transitions valid;
- [ ] Warehouse transitions valid;
- [ ] direct delivery skips warehouse;
- [ ] COMPLETED terminal;
- [ ] CANCELLED terminal;
- [ ] invalid transitions return clear error;
- [ ] every transition creates StatusHistory.

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

- [ ] incoming visible;
- [ ] review;
- [ ] pricing;
- [ ] assign driver;
- [ ] assign vehicle;
- [ ] internal comment;
- [ ] client-visible comment;
- [ ] issue;
- [ ] status;
- [ ] filters.

---

# 11. Driver

- [ ] Today;
- [ ] assignment;
- [ ] pickup;
- [ ] route;
- [ ] phone link;
- [ ] map link;
- [ ] upload photo;
- [ ] status action;
- [ ] issue;
- [ ] history;
- [ ] mobile sticky CTA.

---

# 12. Warehouse

- [ ] Expected;
- [ ] search by order number;
- [ ] intake;
- [ ] expected values;
- [ ] actual values;
- [ ] discrepancy;
- [ ] photos;
- [ ] operations;
- [ ] ready for delivery;
- [ ] release.

---

# 13. Admin

- [ ] users;
- [ ] companies;
- [ ] drivers;
- [ ] vehicles;
- [ ] warehouses;
- [ ] services;
- [ ] orders;
- [ ] audit;
- [ ] demo reset protected.

---

# 14. Documents / Files

- [ ] upload;
- [ ] preview;
- [ ] download;
- [ ] categories;
- [ ] uploader;
- [ ] timestamp;
- [ ] permission;
- [ ] invalid type rejected;
- [ ] oversized file rejected;
- [ ] no broken seeded file.

---

# 15. Notifications

- [ ] unread count;
- [ ] list;
- [ ] read;
- [ ] deep link;
- [ ] order submitted;
- [ ] driver assigned;
- [ ] pickup;
- [ ] warehouse received;
- [ ] delivery;
- [ ] issue.

---

# 16. Finance

- [ ] service pricing;
- [ ] totals;
- [ ] formatting ₽;
- [ ] Client sees approved total;
- [ ] Driver sees no finance;
- [ ] Manager price changes audit.

---

# 17. Visual

- [ ] Dark Logistics OS;
- [ ] graphite surfaces;
- [ ] orange controlled accent;
- [ ] no random color palette;
- [ ] one icon family;
- [ ] typography consistent;
- [ ] cards consistent;
- [ ] status tokens centralized;
- [ ] map styling consistent;
- [ ] timeline consistent.

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
- [ ] no horizontal body overflow;
- [ ] no clipped action;
- [ ] dialogs fit;
- [ ] navigation usable;
- [ ] text readable.

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
- [ ] PASS

If tests exist:
```bash
npm test
```

- [ ] PASS

---

# 23. Demo Test

Полностью пройти:
`33_DEMO_SCENARIOS_AND_ACCEPTANCE_TESTS.md`

- [ ] Flow A
- [ ] Flow B
- [ ] Flow C
- [ ] Flow D
- [ ] Flow E
- [ ] Permissions
- [ ] Role Switcher

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
