# 17 — NOTIFICATIONS

## 1. Цель

Уведомления должны уменьшать количество ручных звонков и сообщений.

В Demo MVP реализовать in-app notifications как основной канал.

Telegram / email могут быть подключены позже к тем же domain events.

---

## 2. In-app notifications

Каждое уведомление:
- recipient user;
- optional order;
- type;
- title;
- body;
- createdAt;
- read state.

UI:
- badge count;
- список;
- mark as read;
- переход в заявку.

---

## 3. События для Client

Создавать уведомление, когда:
- заявка отправлена / принята в работу;
- запросили уточнение;
- заявка согласована;
- назначен водитель;
- груз забран;
- груз принят на склад;
- груз готов к доставке;
- доставка началась;
- доставлено;
- заявка завершена;
- возник issue;
- появился клиентский документ.

---

## 4. События для Manager

- новая заявка;
- груз принят на склад;
- driver reported issue;
- warehouse discrepancy;
- order ready for delivery;
- critical document uploaded;
- planned action overdue if simple overdue logic implemented.

---

## 5. События для Driver

- назначено новое задание;
- изменено время;
- изменён маршрут;
- назначение отменено;
- message requiring attention.

---

## 6. События для Warehouse

- ожидается новое поступление;
- arrival soon, если timing реализован;
- требуется складская операция;
- груз готов к выдаче;
- изменён outbound plan.

События склада отправляются только по заявкам с назначенным складом. Так прямые рейсы и курьерские заявки не создают складской шум; назначение водителя, забор, приёмка и готовность к выдаче дают складу соответствующее обновление.

---

## 7. Notification service

Создать централизованный модуль:

```text
features/notifications/
```

Концептуально:

```ts
notifyUser(...)
notifyOrderParticipants(...)
createNotificationFromDomainEvent(...)
```

Не создавать notification strings вручную в каждом component.

---

## 8. Domain event concept

Даже без полноценной event bus архитектуры полезно мыслить событиями:

```text
ORDER_SUBMITTED
ORDER_CONFIRMED
DRIVER_ASSIGNED
CARGO_PICKED_UP
WAREHOUSE_RECEIVED
ORDER_READY_FOR_DELIVERY
DELIVERY_STARTED
DELIVERY_COMPLETED
ORDER_ISSUE_REPORTED
DOCUMENT_ADDED
```

Один domain action может:
- изменить данные;
- записать audit;
- создать notification.

В Demo MVP запись уведомлений и правила адресатов событий статуса собраны в `features/notifications/service.ts`. Действия создания заявки, назначения исходящего рейса, загрузки документа и складской выдачи используют общий метод записи уведомлений.

---

## 9. Read state

Поддержать:
- unread;
- read.

Опционально:
- mark all as read.

Не нужно:
- сложные notification preferences в Demo MVP.

---

## 10. Deep links

Уведомление должно вести:
- на нужную заявку;
- желательно на релевантный tab / section.

Пример:
`/client/orders/{id}?tab=documents`

---

## 11. Telegram-ready architecture

В будущем тот же domain event может отправлять:
- in-app;
- Telegram;
- email.

Не связывать lifecycle напрямую с Telegram SDK.

Правильнее:

```text
Order event
↓
Notification service
├─ In-app
├─ Telegram adapter (future)
└─ Email adapter (future)
```

---

## 12. Demo behavior

В Demo MVP уведомления должны реально появляться после действий.

Пример:
Manager назначает driver
→ Driver получает notification
→ Client получает notification
→ Manager action audit записывается.

Это важный wow-effect demo.
