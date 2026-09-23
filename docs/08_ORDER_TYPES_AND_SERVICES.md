# 08 — ORDER TYPES AND SERVICES

## 1. Принцип
В MVP не создавать отдельный продукт и отдельную сущность под каждый сценарий.

Использовать:
- одну сущность `Order`;
- поле `type`;
- набор services;
- conditional sections формы;
- lifecycle, адаптированный под type.

## 2. Типы заявок

### PICKUP_TO_WAREHOUSE
«Забрать у поставщика и привезти на наш склад».

Данные:
- supplier;
- pickup address;
- contact;
- cargo;
- desired date;
- warehouse;
- warehouse services;
- documents;
- insurance;
- comments.

### WAREHOUSE_INTAKE
«Принять груз на наш склад».

Данные:
- supplier / sender;
- expected date;
- cargo;
- warehouse;
- vehicle info optionally;
- warehouse services;
- documents;
- contact.

### DELIVERY_OWN_TRANSPORT
«Доставить нашим транспортом».

Данные:
- origin;
- destination;
- cargo;
- delivery contact;
- desired time;
- vehicle assignment;
- optional warehouse step;
- documents.

### DELIVERY_TRANSPORT_COMPANY
«Отправить сторонней транспортной компанией».

Данные:
- cargo;
- sender;
- destination city;
- recipient;
- transport company;
- payer;
- packaging;
- insurance;
- documents;
- terminal / delivery route point.

Transport company в Demo MVP — справочник, без API-интеграции.

### COURIER_DOCUMENTS
«Документы / курьерская доставка».

Данные:
- pickup / source;
- recipient;
- address;
- contact;
- date/time;
- number of document sets;
- return required;
- attachments;
- comment.

Не показывать грузовые поля, если они не нужны.

### WAREHOUSE_SERVICE
«Складская операция».

Примеры:
- упаковка;
- маркировка;
- резка;
- погрузка;
- разгрузка;
- хранение.

## 3. Services

| Code | Name | Unit |
|---|---|---|
| STORAGE | Хранение | день |
| LOADING | Погрузка | операция |
| UNLOADING | Разгрузка | операция |
| PACKAGING | Упаковка | операция |
| LABELING | Маркировка | операция |
| CUTTING | Резка / обработка | операция |
| PHOTO_REPORT | Фотоотчёт | услуга |
| INSURANCE | Страхование | услуга |
| FORWARDING | Экспедирование | услуга |
| DOCUMENT_DELIVERY | Доставка документов | услуга |

## 4. Dynamic form strategy
Create Order flow строить из переиспользуемых sections:

1. `OrderTypeSection`
2. `SupplierSection`
3. `PickupSection`
4. `CargoSection`
5. `WarehouseSection`
6. `ServicesSection`
7. `DeliverySection`
8. `DocumentsSection`
9. `InsuranceSection`
10. `ReviewSection`

Пример config:

```ts
{
  type: "PICKUP_TO_WAREHOUSE",
  sections: [
    "supplier",
    "pickup",
    "cargo",
    "warehouse",
    "services",
    "documents",
    "insurance",
    "review"
  ]
}
```

Не создавать шесть независимых form implementations, если sections можно переиспользовать.

## 5. Type-aware validation
Required fields зависят от order type.

Пример:
- `COURIER_DOCUMENTS`: recipient required, грузовые размеры отсутствуют;
- `PICKUP_TO_WAREHOUSE`: supplier, pickup, cargo и warehouse required.

Validation — через type-aware Zod schema.

## 6. Multi-pickup
Архитектура должна поддерживать несколько pickup route points.

В UI:
- «Добавить ещё адрес забора».

Точка содержит:
- address;
- contact;
- supplier optional;
- date/time optional;
- notes.

## 7. Multiple cargo items
Order поддерживает несколько cargo items.
UI: «Добавить груз».

Не моделировать весь груз одним textarea.

## 8. Transport company directory
Для demo seed можно использовать фиктивно-справочные значения известных типов перевозчиков. Это не интеграция.

## 9. Insurance
В MVP:
- selected service / boolean;
- declared cargo value;
- optional insurance amount;
- пояснение в UI.

Реальные страховые тарифы не реализовывать.

## 10. Pricing
OrderService может иметь:
- quantity;
- unitPrice;
- totalPrice.

Manager может корректировать итог.
Сложный pricing engine — вне Demo MVP.

## 11. UX implication
Несмотря на единую модель данных, клиент не должен видеть «ERP-полотно».

Создание заявки — короткий wizard, который показывает только релевантные поля текущему сценарию.
