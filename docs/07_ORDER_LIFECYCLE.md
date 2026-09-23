# 07 — ORDER LIFECYCLE

## 1. Цель
Статус заявки — не декоративный badge. Он управляет действиями, уведомлениями, timeline и operational flow.

Все переходы идут через централизованную state machine.

## 2. Статусы

```text
DRAFT
SUBMITTED
REVIEW
CONFIRMED
DRIVER_ASSIGNED
PICKUP_IN_PROGRESS
PICKED_UP
AT_WAREHOUSE
WAREHOUSE_PROCESSING
READY_FOR_DELIVERY
DELIVERY_IN_PROGRESS
DELIVERED
COMPLETED
ON_HOLD
ISSUE
CANCELLED
```

## 3. Базовый flow через склад

```text
DRAFT
↓
SUBMITTED
↓
REVIEW
↓
CONFIRMED
↓
DRIVER_ASSIGNED
↓
PICKUP_IN_PROGRESS
↓
PICKED_UP
↓
AT_WAREHOUSE
↓
WAREHOUSE_PROCESSING
↓
READY_FOR_DELIVERY
↓
DELIVERY_IN_PROGRESS
↓
DELIVERED
↓
COMPLETED
```

Для `PICKUP_TO_WAREHOUSE` и `WAREHOUSE_INTAKE` статус остаётся `READY_FOR_DELIVERY`, пока склад не оформит операцию `RELEASE`. Перед выдачей менеджер подтверждает назначенных водителя и автомобиль. Склад фиксирует получателя, количество мест и при необходимости прикладывает подтверждение выдачи. После `RELEASE` назначенный водитель может перевести заявку в `DELIVERY_IN_PROGRESS`; менеджер не может обходить этот шаг. Операция `RELEASE` записывается в журнал склада и не создаёт отдельный статус.

## 4. Direct delivery flow

```text
DRAFT
↓
SUBMITTED
↓
REVIEW
↓
CONFIRMED
↓
DRIVER_ASSIGNED
↓
PICKUP_IN_PROGRESS
↓
PICKED_UP
↓
DELIVERY_IN_PROGRESS
↓
DELIVERED
↓
COMPLETED
```

Не заставлять direct-delivery заявки проходить складские статусы.

## 5. Warehouse intake only

```text
DRAFT
↓
SUBMITTED
↓
REVIEW
↓
CONFIRMED
↓
AT_WAREHOUSE
↓
WAREHOUSE_PROCESSING
↓
COMPLETED
```

Конкретный flow зависит от order type и selected services.

## 6. Exception statuses

### ON_HOLD
Временная остановка: ожидание документов, клиента, поставщика и т.п.

### ISSUE
Проблема: груз не готов, несоответствие количества, повреждение, ошибка документов, недоступен получатель.

### CANCELLED
Терминальное состояние. Сохраняются actor и причина. Заявка не удаляется.

## 7. Terminal statuses
- `COMPLETED`
- `CANCELLED`

После них обычные роли не продолжают lifecycle.

## 8. Actor rules

### Client
- `DRAFT -> SUBMITTED`
- `DRAFT -> CANCELLED`
- `SUBMITTED -> CANCELLED` только если бизнес-правило это разрешает.

### Manager
- `SUBMITTED -> REVIEW`
- `REVIEW -> CONFIRMED`
- `CONFIRMED -> DRIVER_ASSIGNED`
- operational transitions при необходимости;
- `* -> ON_HOLD`;
- `* -> ISSUE`;
- разрешённые возвраты из hold/issue.

### Driver
- `DRIVER_ASSIGNED -> PICKUP_IN_PROGRESS`
- `PICKUP_IN_PROGRESS -> PICKED_UP`
- `READY_FOR_DELIVERY -> DELIVERY_IN_PROGRESS` — для складских заявок только после `RELEASE`;
- `PICKED_UP -> DELIVERY_IN_PROGRESS` для direct delivery;
- `DELIVERY_IN_PROGRESS -> DELIVERED`

### Warehouse
- `PICKED_UP -> AT_WAREHOUSE`
- `AT_WAREHOUSE -> WAREHOUSE_PROCESSING`
- `WAREHOUSE_PROCESSING -> READY_FOR_DELIVERY`
- операция `RELEASE` при выдаче складского груза назначенному водителю;
- warehouse-only completion paths.

### Admin
Может выполнять все валидные переходы.

## 9. Central service
Создать:
`features/orders/services/order-status-machine.ts`

Концептуальный API:

```ts
getAllowedTransitions(order, user)
canTransition(order, nextStatus, user)
transitionOrderStatus({ orderId, nextStatus, actorId, note })
```

`transitionOrderStatus` обязан:
1. загрузить order;
2. проверить actor;
3. проверить transition;
4. обновить current status;
5. создать StatusHistory;
6. создать audit event;
7. создать notifications;
8. обновить специальные timestamps;
9. вернуть updated order.

## 10. Timeline
Client-facing timeline строится из StatusHistory и client-visible milestones.

Internal timeline может дополнительно включать driver assigned, service added, document uploaded, warehouse operation, price changed.

## 11. UI labels RU

```text
DRAFT — Черновик
SUBMITTED — Отправлена
REVIEW — На проверке
CONFIRMED — Согласована
DRIVER_ASSIGNED — Водитель назначен
PICKUP_IN_PROGRESS — Водитель едет на забор
PICKED_UP — Груз забран
AT_WAREHOUSE — Принят на склад
WAREHOUSE_PROCESSING — Обработка на складе
READY_FOR_DELIVERY — Готов к отправке
DELIVERY_IN_PROGRESS — В доставке
DELIVERED — Доставлен
COMPLETED — Завершена
ON_HOLD — Приостановлена
ISSUE — Требует внимания
CANCELLED — Отменена
```

Labels централизовать в config.

## 12. Demo requirement
Seed должен содержать заявки на разных этапах, чтобы dashboards выглядели живыми без ручной подготовки.
