# 25 — RESPONSIVE AND MOBILE UX

## 1. Principle

Проект проектируется Mobile First, но не одинаково для всех ролей.

### Mobile-primary
- Driver
- Client status tracking
- Warehouse quick operations

### Desktop-primary
- Manager
- Admin

---

## 2. Breakpoints

Ориентиры:
```text
360
375
390
430
768
1024
1280
1440+
```

Не проектировать UI только под один iPhone.

---

## 3. Desktop shell

- compact sidebar / icon rail;
- top context area;
- main content;
- optional secondary panel.

Референсы:
- `REF_06_INVOICES_DASHBOARD`
- `REF_10_FLEET_MAP`

---

## 4. Mobile shell

- top bar;
- scrollable content;
- bottom navigation;
- sticky contextual action.

Bottom nav:
3–5 items максимум.

---

## 5. Lists

Desktop:
- table / dense list.

Mobile:
- cards / stacked rows.

Каждый mobile card:
- main identity;
- status;
- 2–4 key facts;
- next action.

---

## 6. Forms

Mobile:
- one column;
- controls full width;
- native-friendly date/time where reasonable;
- fixed bottom submit / continue when safe.

Desktop:
- 2-column only when fields logically related.

Не делать широкую 4-column form только потому что есть место.

---

## 7. Maps

Desktop:
- split list + map допустим.

Mobile:
- map не должен вытеснять operational details;
- map can be collapsible / separate tab.

Референсы:
- `REF_04_LOGISTICS_MAP_CARD`
- `REF_10_FLEET_MAP`

---

## 8. Timeline

Mobile-friendly вертикальная структура.

Использовать:
- dot;
- line;
- timestamp;
- event title;
- muted meta.

Референс:
- `REF_08_TRACKING_TIMELINE`.

---

## 9. Tap targets

Минимум:
- comfortable 44px target where practical.

Primary buttons:
- не мельчить.

Icons without labels:
- только очевидные;
- accessible label обязателен.

---

## 10. Sticky actions

Driver:
- обязательно для текущего действия.

Client wizard:
- Continue / Submit может быть sticky.

Manager mobile:
- sticky только для критической action, не для панели из 7 кнопок.

---

## 11. Overflow

Запрещено:
- body horizontal scroll;
- обрезанные статус-pill;
- невидимые table actions;
- dropdown за viewport.

---

## 12. Mobile QA matrix

Обязательно проверить:
- Client Dashboard 375;
- Client Order Details 375;
- Create Order 375;
- Driver Today 375;
- Driver Job 375;
- Warehouse Intake 390;
- Manager Order 430 / 768;
- Admin lists 768.
