# 10 — CODEX DEVELOPMENT RULES

## 1. Перед изменениями
Перед крупным изменением Codex должен:
1. прочитать `01_MASTER_PRODUCT_SPEC.md`;
2. прочитать релевантные docs;
3. изучить существующую реализацию;
4. только после этого менять код.

Не заменять согласованную архитектуру «более привычной» без причины.

## 2. Базовые правила
- TypeScript strict.
- Не использовать `any`, кроме документированного крайнего случая.
- Не отключать TS/ESLint rules ради build.
- Не оставлять `TODO` вместо критического функционала.
- Не создавать duplicate components и duplicate domain types.
- Не добавлять библиотеку, если задача решается текущим stack.
- Не переписывать рабочий модуль целиком ради локального fix.

## 3. Mobile First
Проверять каждый новый экран минимум на:
- 375px;
- 430px;
- 768px;
- 1280px.

Нельзя:
- горизонтальный overflow;
- desktop table без mobile alternative там, где таблица критична;
- действия только на hover;
- слишком маленькие tap targets.

Driver UX проектировать прежде всего для телефона.

## 4. Role-aware UX
Каждый route/action учитывает роль.

Нельзя:
- только скрыть кнопку, оставив mutation доступной;
- Driver показывать full finance;
- Client показывать internal comments;
- использовать один и тот же dashboard без role-specific priorities.

## 5. Order is the core
Не создавать `DeliveryRequest`, `WarehouseRequest`, `CourierRequest`, если это может быть `Order` + `order_type`.

Новые сценарии добавлять через:
- type;
- sections;
- services;
- rules.

## 6. Status changes
Никогда не менять `orders.status` напрямую из UI mutation.

Использовать lifecycle service.

Каждое изменение статуса:
- permission check;
- transition check;
- status history;
- audit;
- notification при необходимости.

## 7. Forms
Использовать React Hook Form + Zod.

Обязательно:
- labels;
- errors;
- disabled submitting state;
- success feedback;
- sensible defaults;
- draft preservation, где уместно.

Большие формы делить на steps / sections.

## 8. Loading / Empty / Error
Каждый data screen должен иметь:
- loading/skeleton при необходимости;
- empty state;
- error state;
- normal state.

Пустой белый экран не является empty state.

## 9. Lists / tables
Desktop — tables допустимы.
Mobile — cards / stacked rows; horizontal scroll только при явной необходимости.

Фильтры сохранять в URL, если это улучшает back/navigation behavior.

## 10. Design system discipline
До появления design pack:
- нейтральный shadcn-based UI;
- не придумывать финальный бренд;
- не добавлять случайные gradients, glass, neon;
- clean enterprise presentation.

После design docs — следовать им.

## 11. Data
Не хардкодить demo orders в React.
Core business data идёт из БД через typed queries.

Hardcoded config допустим для:
- labels;
- status map;
- nav config;
- order type config.

## 12. Database changes
При изменении schema:
- обновить Drizzle schema;
- создать migration;
- обновить seed;
- обновить docs, если меняется domain contract.

Не удалять поля без анализа использования.

## 13. Security baseline
Любая mutation:
- server-side user resolution;
- permission check;
- validated input.

Uploads:
- size limit;
- mime validation;
- safe path/filename.

Нельзя доверять `role`, `companyId`, `userId` из client body как основанию authorization.

## 14. Accessibility baseline
- semantic buttons;
- labels;
- keyboard navigation;
- focus states;
- dialog focus management;
- достаточные touch targets;
- accessible labels для icon-only actions.

## 15. Performance
- избегать N+1 queries;
- не грузить все attachments в list view;
- paginate/limit большие списки;
- разумно использовать server rendering;
- оптимизировать изображения.

## 16. Проверки перед завершением этапа

```text
npm run lint
npm run typecheck
npm run build
```

Если есть test suite:
`npm test`

Исправлять причины ошибок, а не подавлять их.

## 17. Route stability
После согласования routes:
- не переименовывать без необходимости;
- не ломать deep links;
- active navigation должна работать корректно.

## 18. Comments in code
Комментарии нужны для неочевидной бизнес-логики, ограничений и workaround.
Не комментировать очевидное.

## 19. No fake completion
Нельзя считать feature завершённой, если:
- экран есть, action не работает;
- вместо БД hardcoded data;
- mobile layout сломан;
- build не проходит;
- permission checks отсутствуют.

## 20. Definition of Done
Feature завершена, если:
- UI реализован;
- server logic работает;
- permissions проверены;
- validation есть;
- данные сохраняются;
- loading/empty/error states есть;
- mobile проверен;
- desktop проверен;
- typecheck/build проходят;
- seed/demo flow не сломан.

## 21. Неоднозначность
Если документация допускает несколько реализаций:
1. выбирать более простую;
2. не расширять scope;
3. сохранять extensibility;
4. не придумывать новый бизнес-процесс.

Если решение существенно меняет domain model — запросить уточнение, а не принимать скрытое необратимое решение.
