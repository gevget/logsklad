# 24 — CREATE ORDER WIZARD

## 1. Цель

Заменить длинную ERP-форму понятным пошаговым процессом.

Пользователь должен видеть только релевантные поля.

При создании менеджером или администратором первым шагом становится выбор активной компании-заказчика. Сервер повторно проверяет доступность компании; заказчик всегда создаёт заявку только для своей компании.

---

## 2. Общий wizard

```text
1. Тип заявки
2. Отправитель / поставщик
3. Забор
4. Груз
5. Склад / услуги
6. Доставка
7. Документы / страхование
8. Проверка
```

Шаги динамические.

---

## 3. Step 1 — Type

Использовать крупные selectable cards:
- Забрать и привезти на склад
- Принять на склад
- Доставить нашим транспортом
- Отправить транспортной компанией
- Документы / курьер
- Складские услуги

Каждая card:
- icon;
- short title;
- one-line explanation.

---

## 4. Step 2 — Supplier / Sender

Поля:
- supplier select;
- create new supplier;
- contact;
- phone;
- address.

Если type не требует supplier — скрыть.

---

## 5. Step 3 — Pickup

- address;
- date/time;
- contact;
- phone;
- notes.

CTA:
`Добавить ещё адрес забора`.

---

## 6. Step 4 — Cargo

Card per cargo item:
- name;
- category;
- places;
- weight;
- dimensions;
- declared value;
- notes.

CTA:
`Добавить груз`.

---

## 7. Step 5 — Warehouse / Services

Показывать только если нужно.

Services как selectable rows/cards:
- packing;
- labeling;
- cutting;
- loading;
- unloading;
- storage;
- photo report;
- insurance.

---

## 8. Step 6 — Delivery

- destination;
- recipient;
- phone;
- planned time;
- transport company if relevant;
- payer if relevant.

---

## 9. Step 7 — Documents

- upload;
- document type;
- insurance;
- additional notes.

---

## 10. Step 8 — Review

Показать краткие блоки:
- route;
- cargo;
- services;
- contacts;
- files.

Каждый блок:
`Изменить`.

Primary:
`Отправить заявку`.

Secondary:
`Сохранить черновик`.

---

## 11. Draft autosave

Если технически просто:
- autosave after meaningful step.

Если нет:
- explicit `Сохранить черновик`.

Не создавать illusion autosave без реального сохранения.

---

## 12. Progress

Desktop:
- horizontal compact stepper.

Mobile:
- `Шаг 3 из 7`;
- progress bar;
- не пытаться уместить 8 названий в одну строку.

---

## 13. Validation

На каждом step:
- локальная validation;
- error scroll/focus;
- нельзя потерять уже заполненные данные.

---

## 14. Visual reference

Использовать плотность `REF_03_DENSE_DETAIL_MODAL`, но:
- больше воздуха;
- крупнее controls;
- меньше одновременных полей;
- clear grouping.
