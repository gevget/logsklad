# 03 — PROJECT STRUCTURE

## 1. Цель
Зафиксировать структуру репозитория до активной разработки, чтобы Codex не создавал альтернативные архитектуры для одинаковых задач.

## 2. Рекомендуемая структура

```text
/
├─ app/
│  ├─ (public)/
│  ├─ (app)/
│  │  ├─ client/
│  │  ├─ manager/
│  │  ├─ driver/
│  │  ├─ warehouse/
│  │  └─ admin/
│  ├─ api/
│  ├─ layout.tsx
│  └─ globals.css
├─ components/
│  ├─ ui/
│  ├─ layout/
│  ├─ navigation/
│  ├─ feedback/
│  └─ shared/
├─ features/
│  ├─ orders/
│  ├─ cargo/
│  ├─ companies/
│  ├─ suppliers/
│  ├─ drivers/
│  ├─ vehicles/
│  ├─ warehouse/
│  ├─ documents/
│  ├─ notifications/
│  ├─ pricing/
│  └─ demo/
├─ db/
│  ├─ schema/
│  ├─ migrations/
│  ├─ queries/
│  ├─ seed/
│  └─ index.ts
├─ lib/
│  ├─ auth/
│  ├─ permissions/
│  ├─ validation/
│  ├─ storage/
│  ├─ dates/
│  ├─ formatting/
│  └─ utils/
├─ types/
├─ config/
├─ hooks/
├─ public/
├─ scripts/
└─ docs/
```

## 3. Route roots

```text
/client
/client/orders
/client/orders/[id]
/client/orders/new

/manager
/manager/orders
/manager/orders/[id]

/driver
/driver/jobs
/driver/jobs/[id]

/warehouse
/warehouse/inbound
/warehouse/orders/[id]

/admin
/admin/users
/admin/companies
/admin/services
```

## 4. Feature-first logic
Business logic группировать в `features`, а не размазывать по route files.

Пример:

```text
features/orders/
├─ actions/
├─ components/
├─ queries/
├─ schemas/
├─ services/
├─ types/
└─ utils/
```

Route files должны оставаться orchestration layer, а не становиться монолитами.

## 5. Компоненты

### `components/ui`
Примитивы design system:
- Button
- Input
- Select
- Dialog
- Sheet
- Table
- Tabs
- Badge
- Card
- Tooltip
- DropdownMenu

### `components/shared`
Переиспользуемые app-level элементы:
- StatusBadge
- Money
- EmptyState
- FilePreview
- Timeline
- UserAvatar
- EntityMeta

### Feature components
Если компонент относится только к заказам:
`features/orders/components/OrderCard.tsx`.

## 6. DB schema layout

```text
db/schema/
├─ users.ts
├─ companies.ts
├─ orders.ts
├─ cargo.ts
├─ logistics.ts
├─ warehouse.ts
├─ files.ts
├─ finance.ts
├─ notifications.ts
└─ audit.ts
```

`db/schema/index.ts` экспортирует schema.

## 7. Validation
Zod schemas хранить рядом с feature:

```text
features/orders/schemas/create-order.ts
features/orders/schemas/update-order-status.ts
```

## 8. Queries / Actions / Services
Queries — чтение:
```text
features/orders/queries/get-order.ts
features/orders/queries/list-orders.ts
```

Actions — изменения:
```text
features/orders/actions/create-order.ts
features/orders/actions/assign-driver.ts
features/orders/actions/change-status.ts
```

Services — сложная domain logic:
```text
features/orders/services/order-status-machine.ts
```

## 9. Naming
- files: kebab-case;
- components: PascalCase;
- functions: camelCase;
- SQL: snake_case;
- enum values: SCREAMING_SNAKE_CASE.

## 10. Imports
Использовать aliases:

```ts
import { db } from "@/db";
import { Button } from "@/components/ui/button";
```

Избегать длинных `../../../../`.

## 11. Demo-only code
Хранить изолированно:

```text
features/demo/
lib/auth/demo-session.ts
```

Не смешивать role switcher и seed helpers с production domain logic.

## 12. Docs
Все проектные документы находятся в `/docs`.
Файлы `01–36` не переименовывать без причины.
Codex перед крупным этапом должен читать релевантные docs.
