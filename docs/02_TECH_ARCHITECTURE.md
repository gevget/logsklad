# 02 — TECH ARCHITECTURE

## 1. Цель
Собрать Demo MVP как реальный full-stack web-продукт, который можно продолжать развивать после демонстрации.

Не использовать архитектуру «статический фронт + JSON mocks», если функция может быть реализована через реальную тестовую БД.

## 2. Рекомендуемый стек

### Core
- Next.js App Router
- React
- TypeScript `strict: true`
- Tailwind CSS
- shadcn/ui как техническая основа компонентов
- Lucide Icons

### Forms / validation
- React Hook Form
- Zod

### Database
- PostgreSQL
- Drizzle ORM
- Drizzle Kit

### Infrastructure
- Supabase Postgres
- Supabase Storage
- Vercel

### State
- server state — через server queries/actions;
- Zustand — только для лёгкого UI state и demo role switcher;
- URL search params — для фильтров, tabs и shareable state.

## 3. Архитектурная схема

```text
Browser
  ↓
Next.js App Router
  ↓
Server Components / Server Actions / Route Handlers
  ↓
Application / Domain layer
  ↓
Drizzle ORM
  ↓
PostgreSQL
```

Storage:

```text
Browser
  ↓
validated upload flow
  ↓
Supabase Storage
  ↓
Attachment metadata in PostgreSQL
```

## 4. Rendering strategy
- Server Components — по умолчанию для data-heavy screens.
- Client Components — только где нужна интерактивность.
- Server Actions / Route Handlers — для mutations.
- Не превращать весь dashboard в `"use client"`.
- Не дублировать server data в глобальном client store без причины.

## 5. Authentication strategy для Demo MVP

Создать seeded users:
- `client@demo.local`
- `manager@demo.local`
- `driver@demo.local`
- `warehouse@demo.local`
- `admin@demo.local`

Demo Role Switcher:
- меняет активную demo identity;
- хранит выбранного пользователя в cookie/session-compatible механизме;
- server side должен уметь определить текущего demo user.

Важно: role switcher не отменяет authorization. Все mutations проверяют permission на сервере.

### Production-ready path
Архитектура должна позволять позже заменить demo identity на Supabase Auth или другой auth provider без переписывания domain model.

## 6. Database architecture
PostgreSQL — единый источник бизнес-данных.

Обязательные scripts:
- `db:generate`
- `db:migrate`
- `db:seed`
- опционально `db:reset` только для development/demo

Нельзя строить core UI на hardcoded mock objects при наличии таблиц БД.

## 7. File storage
Bucket: `attachments`.

В БД хранить:
- storage path;
- filename;
- mime type;
- size;
- uploader;
- order relation;
- category.

Категории:
- cargo photo;
- warehouse photo;
- document;
- invoice;
- proof of delivery;
- other.

## 8. Mutation pipeline
Каждая mutation обязана:
1. получить input;
2. провалидировать Zod schema;
3. определить current user;
4. проверить permission;
5. выполнить domain operation;
6. создать history/audit event при необходимости;
7. вернуть типизированный результат;
8. revalidate affected views.

Сложную business logic не размещать внутри React component.

## 9. Error model
Domain errors:
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `VALIDATION_ERROR`
- `INVALID_STATUS_TRANSITION`
- `CONFLICT`
- `INTERNAL_ERROR`

UI:
- inline field errors;
- toast для mutation feedback;
- page error state;
- retry для recoverable actions.

## 10. Environments
Минимум:
- local;
- preview;
- production/demo.

`.env.example`:

```env
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=attachments
DEMO_MODE=true
```

Секреты никогда не коммитить.

## 11. Deployment
Target:
- Vercel
- Supabase

Перед deploy:
- lint;
- typecheck;
- build;
- migrations reviewed.

Seed не должен автоматически выполняться на production DB.

## 12. Mobile First
Проверять минимум:
- 360px
- 375px
- 390px
- 430px
- 768px
- 1024px
- 1280px+

Driver flow — в первую очередь mobile UX.
Manager/Admin — более плотный desktop UX, но с базовой адаптивностью.

## 13. Security baseline
Даже в demo:
- server-side permissions;
- validation;
- upload mime/size checks;
- secrets only server-side;
- безопасный rendering user content;
- audit-sensitive mutations;
- role нельзя принимать из client body как источник истины.

## 14. Не добавлять без отдельной необходимости
- Redux;
- GraphQL;
- Prisma параллельно Drizzle;
- Firebase;
- отдельный backend service;
- microservices;
- Kubernetes;
- realtime sockets без конкретного сценария;
- native mobile stack.

Цель — аккуратный, расширяемый, но не переусложнённый Demo MVP.
