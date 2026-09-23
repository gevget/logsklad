# 13 — DRIVER WORKFLOWS

## 1. Роль

Driver — исполнитель перевозки.

Главный принцип:
> интерфейс должен работать одной рукой с телефона и показывать только то, что нужно для текущего рейса.

Это самый mobile-first контур продукта.

---

## 2. Главные разделы

```text
Сегодня
Мои задания
История
Уведомления
Профиль
```

Никакой сложной боковой навигации на mobile.

---

## 3. Dashboard «Сегодня»

Показать:
- текущий рейс;
- следующий рейс;
- количество заданий;
- urgent notifications.

Главный CTA зависит от состояния:
- Принять;
- Начать движение;
- Я на месте;
- Груз забран;
- Начать доставку;
- Доставлено.

---

## 4. Карточка задания

### Верх
- номер заявки;
- текущий status;
- тип;
- planned time.

### Pickup
- адрес;
- контакт;
- телефон;
- поставщик;
- комментарий.

### Cargo
- наименование;
- количество мест;
- вес;
- special requirements.

### Route
- ordered route points.

### Delivery
- адрес;
- получатель;
- телефон;
- комментарий.

### Attachments
Только релевантные водителю.

---

## 5. Статусы водителя

Типовой flow:

```text
DRIVER_ASSIGNED
↓
PICKUP_IN_PROGRESS
↓
PICKED_UP
↓
DELIVERY_IN_PROGRESS
↓
DELIVERED
```

Для warehouse flow:

```text
DRIVER_ASSIGNED
↓
PICKUP_IN_PROGRESS
↓
PICKED_UP
↓
AT_WAREHOUSE
```

Дальнейшая доставка может быть новым этапом той же заявки.

---

## 6. Подтверждение действий

Для критических действий:
- `Груз забран`;
- `Доставлено`;

показывать confirm dialog / bottom sheet.

После выполнения:
- создать status history;
- audit;
- notification.

---

## 7. Фото

Driver может добавлять:
- фото груза;
- фото при погрузке;
- фото документов;
- proof of delivery.

Для перехода водителя в `DELIVERED` требуется файл `PROOF_OF_DELIVERY`, видимый клиенту. Кнопка доставки ведёт к форме загрузки и остаётся отключённой, пока подтверждение не сохранено; сервер проверяет это условие независимо от интерфейса.

Upload UX:
- camera-first на mobile;
- preview;
- remove before submit;
- upload progress;
- retry.

---

## 8. Комментарий

На каждом ключевом действии допустимо:
- добавить короткий комментарий.

Пример:
- «Поставщик задерживает погрузку»
- «Принято 4 места вместо 5»

При проблеме:
CTA `Сообщить о проблеме`.

---

## 9. Issue from Driver

Driver не должен самостоятельно менять заявку на произвольный status.

Flow:
1. выбрать тип проблемы;
2. написать комментарий;
3. приложить фото;
4. система создаёт issue event / notification;
5. Manager получает alert.

Если бизнес-логика предусматривает:
- status может стать `ISSUE`.

---

## 10. Maps

В Demo MVP:
- адрес;
- кнопка «Открыть в картах».

Не требуется:
- встроенная navigation;
- GPS tracking;
- live route.

---

## 11. Connectivity

MVP не обязан быть offline-first.

Но UX должен:
- показывать загрузку;
- не позволять double submit;
- сохранять понятную ошибку при сетевом сбое.

---

## 12. Mobile layout

Обязательное:
- bottom navigation;
- большие tap targets;
- sticky primary action;
- минимум мелкого текста;
- важные контакты доступны без глубокого скролла;
- телефон clickable;
- адрес легко копируется.

---

## 13. Что Driver не видит

Скрыть:
- полную финансовую часть;
- margin;
- client billing;
- чужие заявки;
- internal notes, не относящиеся к исполнению;
- admin data.

---

## 14. Demo driver story

В seed обязательно создать задание, которое можно пройти:

```text
DRIVER_ASSIGNED
→ PICKUP_IN_PROGRESS
→ PICKED_UP
→ AT_WAREHOUSE
```

и отдельное direct delivery:

```text
DRIVER_ASSIGNED
→ PICKUP_IN_PROGRESS
→ PICKED_UP
→ DELIVERY_IN_PROGRESS
→ DELIVERED
```
