# 18 — FINANCE AND PRICING

## 1. Scope

Demo MVP не является бухгалтерской системой.

Цель финансового блока:
> показать клиенту понятную стоимость заявки, а менеджеру — возможность собрать её из услуг.

Не реализовывать сложный tariff engine без отдельного этапа.

---

## 2. Что хранит Order

```text
subtotal
services_total
insurance_total
discount_total
tax_total
total
currency
```

Default currency:
`RUB`.

---

## 3. OrderService pricing

Каждая услуга:
- quantity;
- unit;
- unitPrice;
- totalPrice.

Пример:

```text
Перевозка         1 × 18 000 = 18 000
Разгрузка         1 × 3 500  = 3 500
Хранение          3 × 900    = 2 700
Упаковка          1 × 2 200  = 2 200
```

---

## 4. Base service prices

`services.base_price` — подсказка / default.

Это не контрактная стоимость.

Когда услуга добавлена в Order:
- копировать актуальную цену в `order_services.unit_price`;
- дальнейшее изменение справочника не должно менять старую заявку.

---

## 5. Manager pricing flow

Manager:
1. открывает заявку;
2. видит список услуг;
3. вводит / корректирует цены;
4. при необходимости добавляет discount;
5. сохраняет;
6. Client видит итог после соответствующего этапа согласования.

---

## 6. Client visibility

### DRAFT
Цена может отсутствовать.

### SUBMITTED / REVIEW
Показывать:
- «Стоимость рассчитывается», если total не подтверждён.

### CONFIRMED+
Показывать:
- breakdown;
- total.

Не показывать:
- внутреннюю себестоимость;
- margin;
- internal notes.

---

## 7. Insurance

В Demo:
- selected insurance service;
- declared value;
- optional manual insurance total.

Не реализовывать страховой API / формулу.

---

## 8. Tax / VAT

Demo поддерживает поле:
- `tax_total`.

Если нужен UI:
- «в т.ч. НДС» / «без НДС» как configurable representation.

Не моделировать полноценный российский бухгалтерский учёт в Demo MVP.

---

## 9. Invoices

Документ `invoice` может существовать как Document.

В Demo:
- upload / attach PDF;
- показать статус наличия счёта.

Не обязательно:
- автоматически генерировать юридически корректный счёт;
- интегрировать оплату.

---

## 10. Payment status

Если полезно для demo, можно добавить lightweight enum:

```text
NOT_BILLED
BILLED
PAID
OVERDUE
```

Но добавлять его только если UI действительно использует этот статус.

Не смешивать payment status с order lifecycle.

---

## 11. Discounts

Поддержать:
- manual discount amount.

Не строить:
- loyalty engine;
- promo codes;
- cashback.

---

## 12. Calculation helper

Централизовать:

```ts
calculateOrderTotals(orderServices, insurance, discount, tax)
```

Никаких разных формул на Client и Manager screens.

---

## 13. Currency formatting

Использовать единый formatter:

```text
18 500 ₽
```

Не хардкодить форматирование строками по компонентам.

---

## 14. Audit

Изменение цены Manager/Admin:
- записывается в audit;
- payload может содержать before / after summary.

Client не видит audit финансовых изменений, только актуальный approved breakdown.

---

## 15. Future extensions

Отдельным этапом:
- tariff engine;
- distance-based calculation;
- vehicle class rates;
- storage day calculation;
- payment gateway;
- 1C;
- invoice generation;
- debts;
- acts;
- reconciliation.

Архитектура должна позволять это добавить без переписывания Order.
