# 33 — DEMO SCENARIOS & ACCEPTANCE TESTS

## 1. Назначение

Этот документ фиксирует, что именно должно работать в Demo MVP и как проверять готовность проекта.

Demo считается успешным, если заказчик может увидеть один и тот же реальный бизнес-процесс глазами разных ролей:

**Client → Manager → Driver → Warehouse → Manager → Client**

Все сценарии должны работать на общей БД и изменять реальные данные, а не переключать заранее нарисованные состояния.

---

# 2. Главный Demo Flow A — Полный цикл через склад

## Стартовые условия

Есть:
- Client: Алексей Морозов;
- Company: ООО «СтальПром»;
- Manager: Анна Смирнова;
- Driver: Сергей Волков;
- Vehicle: Газель / seeded vehicle;
- Warehouse: Основной склад;
- поставщик;
- тестовый груз.

---

## A1. Client создаёт заявку

Client:
1. переключается на роль Client;
2. открывает `Создать заявку`;
3. выбирает `Забрать груз и привезти на склад`;
4. выбирает / создаёт поставщика;
5. указывает адрес забора;
6. добавляет груз;
7. выбирает склад;
8. выбирает услуги:
   - разгрузка;
   - упаковка;
   - фотоотчёт;
9. прикладывает документ;
10. открывает Review;
11. отправляет заявку.

### Acceptance

- [ ] создаётся реальная запись Order;
- [ ] создаются Cargo;
- [ ] создаются RoutePoint;
- [ ] сохраняются Services;
- [ ] Attachment связан с Order;
- [ ] Order получает `SUBMITTED`;
- [ ] StatusHistory содержит событие;
- [ ] Manager получает notification;
- [ ] Client видит заявку в списке;
- [ ] после refresh данные не исчезают.

---

## A2. Manager принимает заявку

Manager:
1. переключается на Manager;
2. видит заявку во `Входящих`;
3. открывает её;
4. переводит в `REVIEW`;
5. проверяет маршрут и груз;
6. задаёт стоимость;
7. подтверждает услуги;
8. переводит в `CONFIRMED`;
9. назначает Driver;
10. назначает Vehicle.

### Acceptance

- [ ] Client data доступны Manager;
- [ ] internal controls не видны Client;
- [ ] цена сохраняется;
- [ ] назначение Driver сохраняется;
- [ ] назначение Vehicle сохраняется;
- [ ] статус становится `DRIVER_ASSIGNED`;
- [ ] Driver получает notification;
- [ ] Client получает notification;
- [ ] Audit содержит назначение;
- [ ] Timeline обновляется.

---

## A3. Driver забирает груз

Driver:
1. переключается на Driver;
2. видит назначенный рейс на главной;
3. открывает Job;
4. нажимает `Начать поездку`;
5. статус → `PICKUP_IN_PROGRESS`;
6. открывает адрес в карте / видит route data;
7. после погрузки прикладывает фото;
8. нажимает `Груз забран`;
9. статус → `PICKED_UP`.

### Acceptance

- [ ] Driver видит только свои задания;
- [ ] Driver не видит финансовую часть;
- [ ] статус меняется только на разрешённый;
- [ ] фото сохраняется;
- [ ] StatusHistory обновляется;
- [ ] Manager видит изменение;
- [ ] Client видит публичное milestone-событие;
- [ ] mobile UI usable на 375px.

---

## A4. Warehouse принимает груз

Warehouse:
1. переключается на Warehouse;
2. видит ожидаемую заявку;
3. ищет её по номеру;
4. открывает приёмку;
5. видит ожидаемый вес / места;
6. вводит фактические данные;
7. добавляет фото;
8. подтверждает приёмку.

Фото передаётся вместе с формой приёмки и связывается с созданной операцией `INTAKE`; при ошибке записи временная загрузка удаляется.

### Acceptance

- [ ] создаётся WarehouseOperation `INTAKE`;
- [ ] фиксируются фактические данные;
- [ ] attachment сохраняется;
- [ ] status → `AT_WAREHOUSE`;
- [ ] Manager получает notification;
- [ ] Client получает публичное обновление;
- [ ] данные не пропадают после refresh.

---

## A5. Warehouse выполняет операции

Warehouse:
1. открывает груз;
2. переводит в `WAREHOUSE_PROCESSING`;
3. отмечает упаковку;
4. отмечает фотоотчёт;
5. добавляет результат;
6. переводит в `READY_FOR_DELIVERY`.

### Acceptance

- [ ] OrderService completion сохраняется;
- [ ] WarehouseOperation сохраняются;
- [ ] тип, исполнитель, время, результат, заметка и измерения видны в журнале;
- [ ] фото операции связано с WarehouseOperation;
- [ ] timeline обновляется;
- [ ] Manager видит `Готов к отправке`;
- [ ] Client видит понятный публичный статус.

---

## A6. Manager запускает доставку

Manager:
1. открывает заявку;
2. назначает outbound driver / подтверждает существующего;
3. подтверждает автомобиль; до складской выдачи заявка остаётся в `READY_FOR_DELIVERY`.

Warehouse:
1. записывает получателя и количество мест;
2. указывает адрес доставки и при необходимости телефон получателя;
3. сверяет назначенных водителя и автомобиль;
4. при необходимости прикладывает фото подтверждения;
5. создаёт `WarehouseOperation.RELEASE` и отдельную точку маршрута `DELIVERY`.

Driver:
1. получает назначение;
2. начинает доставку;
3. status → `DELIVERY_IN_PROGRESS`;
4. доставляет;
5. прикладывает Proof of Delivery;
6. status → `DELIVERED`.

Сервер не разрешает водителю установить `DELIVERED` без клиентского файла категории `PROOF_OF_DELIVERY`; интерфейс показывает путь к загрузке и блокирует действие до появления файла.

Manager:
1. проверяет;
2. завершает заявку;
3. status → `COMPLETED`.

### Acceptance

- [ ] полный lifecycle валиден;
- [ ] операция выдачи содержит получателя, водителя, автомобиль, количество, время и комментарий;
- [ ] исходящий адрес сохранён отдельной точкой `DELIVERY` и показан назначенному водителю;
- [ ] фото выдачи связано с операцией и доступно клиенту;
- [ ] proof attachment связан с Order;
- [ ] Client видит завершение;
- [ ] `completed_at` установлен;
- [ ] после COMPLETED обычный Driver не может менять status;
- [ ] документы доступны по permissions.

---

# 3. Demo Flow B — Прямая доставка своим транспортом

Order type:
`DELIVERY_OWN_TRANSPORT`

Flow:

```text
DRAFT
→ SUBMITTED
→ REVIEW
→ CONFIRMED
→ DRIVER_ASSIGNED
→ PICKUP_IN_PROGRESS
→ PICKED_UP
→ DELIVERY_IN_PROGRESS
→ DELIVERED
→ COMPLETED
```

### Acceptance

- [ ] складские статусы не обязательны;
- [ ] Warehouse не получает нерелевантную заявку;
- [ ] Driver видит pickup + delivery;
- [ ] Client видит маршрут и timeline;
- [ ] Manager может завершить процесс.

Уведомления склада фильтруются по назначенному складу и типу заявки; это правило всё ещё нужно подтвердить сквозным прогоном этого сценария.

---

# 4. Demo Flow C — Транспортная компания

Order type:
`DELIVERY_TRANSPORT_COMPANY`

Проверить:
- sender;
- recipient;
- city;
- transport company;
- payer;
- packaging;
- insurance;
- documents.

### Acceptance

- [ ] transport company сохраняется;
- [ ] форма показывает только релевантные поля;
- [ ] нет обязательного Driver, если собственный водитель не используется;
- [ ] Order Details корректно отображает тип.

---

# 5. Demo Flow D — Документы / курьер

Order type:
`COURIER_DOCUMENTS`

Проверить:
- дата;
- время;
- получатель;
- телефон;
- адрес;
- количество экземпляров;
- возврат документов;
- attachments.

### Acceptance

- [ ] грузовые поля не являются обязательными;
- [ ] simplified wizard;
- [ ] заявка видна Manager;
- [ ] Client может отслеживать status.

---

# 6. Demo Flow E — Issue

Driver или Warehouse сообщает о проблеме.

Пример:
- ожидалось 5 мест;
- фактически 4.

### Acceptance

- [ ] создаётся issue;
- [ ] сервер требует описание проблемы и сохраняет его в истории статусов;
- [ ] можно приложить фото;
- [ ] Manager получает notification;
- [ ] UI показывает IssueBanner;
- [ ] Client не получает внутренние детали, если они internal;
- [ ] после resolution lifecycle может продолжиться.

---

# 7. Demo Flow F — Permissions

Проверить вручную:

### Client
- [ ] не видит чужую компанию;
- [ ] не видит internal comments;
- [ ] не назначает Driver;
- [ ] не меняет operational status напрямую.

### Driver
- [ ] не видит чужие рейсы;
- [ ] не видит finance;
- [ ] не видит Admin routes.

### Warehouse
- [ ] не меняет цену;
- [ ] не управляет users.

### Manager
- [ ] не меняет роли пользователей.

### Admin
- [ ] имеет полный административный доступ;
- [ ] audit остаётся read-only.

---

# 8. Demo Role Switcher

Проверить:
- [ ] доступны 5 ролей;
- [ ] switch меняет current demo identity;
- [ ] меняется navigation;
- [ ] shared data остаются общими;
- [ ] role switch не сбрасывает БД;
- [ ] unauthorized route redirects / blocks appropriately.

---

# 9. Notifications Acceptance

После relevant events:
- [ ] создаётся DB notification;
- [ ] unread counter обновляется;
- [ ] notification открывает Order;
- [ ] mark as read работает.

Непрочитанный счётчик в навигации читает актуальное число уведомлений пользователя из PostgreSQL. Складская роль получила страницу уведомлений; на мобильной ширине менеджер и склад открывают её из шапки. Критерий остаётся открытым до проверки после события и отметки уведомления прочитанным.

Минимальные события:
- order submitted;
- driver assigned;
- picked up;
- warehouse received;
- ready for delivery;
- delivered;
- issue.

---

# 10. Documents Acceptance

- [ ] upload работает;
- [ ] file metadata сохраняется;
- [ ] preview / download работает;
- [ ] uploader виден;
- [ ] category видна;
- [ ] permissions работают;
- [ ] completed order не позволяет обычному пользователю бесследно удалить operational file.

---

# 11. Responsive Acceptance

Обязательные реальные проверки:

```text
375x812
390x844
430x932
768x1024
1024x768
1440x900
```

### На mobile
- [ ] no horizontal overflow;
- [ ] bottom nav видна;
- [ ] sticky action не перекрывает контент;
- [ ] Create Order usable;
- [ ] Driver flow usable;
- [ ] Warehouse intake usable;
- [ ] dialogs / drawers не выходят за viewport.

---

# 12. Build Acceptance

Обязательно проходят:

```bash
npm run lint
npm run typecheck
npm run build
```

Если есть tests:
```bash
npm test
```

---

# 13. Demo Reset

Если `DEMO_MODE=true`:
- [ ] можно вернуть seeded state;
- [ ] reset защищён confirm;
- [ ] reset недоступен в production mode.

Сброс через `/admin/demo` и консольную команду реализован атомарно; критерии выше остаются непроверенными до отдельного приёмочного прогона. Сам сброс во время разработки без явного действия администратора не выполняется.

---

# 14. Финальный Demo Script

Рекомендуемый показ клиенту:

1. Client Dashboard.
2. Создать новую заявку.
3. Переключиться на Manager.
4. Принять заявку и назначить Driver.
5. Переключиться на Driver mobile.
6. Начать рейс и забрать груз.
7. Переключиться на Warehouse.
8. Принять груз и выполнить операцию.
9. Вернуться к Manager.
10. Отправить в доставку.
11. Driver подтверждает доставку.
12. Client открывает completed timeline.

Цель:
за 8–12 минут показать весь продукт как единую живую систему.
