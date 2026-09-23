# 09 — DEMO DATA SPEC

## 1. Цель
Demo dataset должен выглядеть как реальный работающий бизнес.

Запрещены:
- `Test User`;
- `Company 1`;
- `Order 123`;
- одинаковые lorem ipsum записи;
- пустые dashboards.

После `db:seed` продукт должен быть сразу готов к презентации.

## 2. Объём seed

### Companies
5 client companies.

### Users
12–15 users:
- 4 Client;
- 2 Manager;
- 4 Driver;
- 2 Warehouse;
- 1 Admin.

### Vehicles
6–8.

### Warehouses
2.

### Suppliers
10–12.

### Orders
24–30.

### Cargo items
35–45.

### Services
10 core services.

### Documents / attachments
20+ metadata records.

### Status history
80+ events.

### Warehouse operations
15+.

### Comments
20+.

### Notifications
30+.

## 3. Основные demo identities

```text
client@demo.local
manager@demo.local
driver@demo.local
warehouse@demo.local
admin@demo.local
```

Использовать реалистичные русские имена.

Пример:
- Алексей Морозов — Client;
- Анна Смирнова — Manager;
- Сергей Волков — Driver;
- Михаил Орлов — Warehouse;
- Екатерина Лебедева — Admin.

## 4. Client companies
Использовать вымышленные компании разных отраслей:
- металлопрокат;
- оборудование;
- стройматериалы;
- инженерные системы;
- производство.

Примеры:
- ООО «СтальПром»
- ООО «Север Инжиниринг»
- ООО «ТехКомплект»
- ООО «Монолит Снаб»
- ООО «ПромЛайн»

Все компании fictional demo entities.

## 5. Cargo categories
Mix:
- металлический профиль;
- листовой металл;
- трубы;
- промышленное оборудование;
- электрика;
- строительные материалы;
- комплектующие;
- документы.

Примеры:
- Лист стальной 3 мм;
- Труба профильная 40×40;
- Насосное оборудование;
- Щит автоматики;
- Кабельные лотки.

## 6. Vehicles
Типы:
- Газель;
- фургон;
- тент 3 т;
- тент 5 т;
- длинномер / demo large truck.

Госномера — фиктивные.

## 7. Orders distribution
Покрыть все ключевые стадии. Ориентир:
- 2 `DRAFT`
- 3 `SUBMITTED`
- 2 `REVIEW`
- 2 `CONFIRMED`
- 3 `DRIVER_ASSIGNED`
- 2 `PICKUP_IN_PROGRESS`
- 2 `PICKED_UP`
- 3 `AT_WAREHOUSE`
- 2 `WAREHOUSE_PROCESSING`
- 2 `READY_FOR_DELIVERY`
- 2 `DELIVERY_IN_PROGRESS`
- 2 `DELIVERED`
- 4 `COMPLETED`
- 1 `ISSUE`
- 1 `ON_HOLD`
- 1 `CANCELLED`

Количество можно адаптировать под общий объём seed.

## 8. Order type coverage
Все типы должны присутствовать:
- PICKUP_TO_WAREHOUSE;
- WAREHOUSE_INTAKE;
- DELIVERY_OWN_TRANSPORT;
- DELIVERY_TRANSPORT_COMPANY;
- COURIER_DOCUMENTS;
- WAREHOUSE_SERVICE.

Логистических заявок должно быть больше, чем courier-only.

## 9. Showcase orders
Создать заранее продуманные hero cases.

### Hero A — полный flow через склад
- 2 pickup points;
- 2 cargo items;
- driver;
- vehicle;
- warehouse;
- packaging;
- labeling;
- photo report;
- status history;
- attachments.

### Hero B — direct delivery своим транспортом
Короткий маршрут без склада.

### Hero C — отправка через транспортную компанию
С recipient, terminal и документами.

### Hero D — проблемная заявка
Статус `ISSUE`, несоответствие груза/документов и internal comment.

## 10. Order numbers
Формат, например:
`TR-2026-00124`

Не показывать DB id пользователю как номер заявки.

## 11. Pricing data
Использовать разные реалистичные суммы, например:
- 4 500 ₽;
- 12 800 ₽;
- 28 500 ₽;
- 46 900 ₽;
- 83 000 ₽.

Не ставить всем `10000`.

## 12. Dates
Seed должен быть привязан к моменту запуска или configurable anchor date:
- часть заявок сегодня;
- часть вчера;
- часть в ближайшие 3–7 дней;
- completed — последние 30 дней.

## 13. Files
Если реальные binary demo files не подготовлены:
- использовать локальные placeholder assets в `/public/demo`;
- metadata должна быть валидной;
- не оставлять broken links.

Нужны примеры:
- cargo photos;
- warehouse photos;
- document/PDF placeholders;
- proof of delivery.

## 14. Notifications
Примеры:
- «Заявка TR-2026-00124 принята в работу»
- «Назначен водитель Сергей Волков»
- «Груз принят на склад»
- «Заявка готова к доставке»
- «Доставка завершена»

## 15. Deterministic seed
Seed должен быть повторяемым и не ломать тесты случайностью.

Команда:
`npm run db:seed`

Допустимо добавить dev-only:
`npm run db:reset`

Reset никогда не должен быть доступен в production без защиты.
