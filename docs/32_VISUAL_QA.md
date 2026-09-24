# 32 — VISUAL QA

## Протокол проверки 24.09.2026

- После последней правки глобальных стилей выполнено 297 браузерных проверок: 33 маршрута пяти ролей × 9 размеров от 360×800 до 1920×1080.
- Горизонтальный overflow не найден; на ширине 390 px карточки показателей полностью видны в двухколоночной сетке.
- Минимальный вычисленный размер видимого текста — 13 px для каждой роли; браузерных ошибок и оверлеев Next.js нет.
- Сняты мобильные кадры: кабинеты всех ролей, мастер клиента, карточки менеджера/водителя, приёмка склада, справочники пользователей/услуг. Складской экран осмотрен после исправления сетки.
- Проверка клавиатурной доступности, формального контраста, всех loading/empty/error-состояний и полного набора desktop-снимков остаётся открытой.

---

## 1. Цель

Этот документ используется после каждого крупного UI pass.

Нельзя считать экран готовым только потому, что он «похож на референс».

Он должен быть:
- функциональным;
- адаптивным;
- консистентным;
- читаемым;
- role-appropriate.

---

# 2. Global Visual QA

Проверить:

- [x] фон соответствует Dark Logistics OS;
- [ ] нет случайных чисто чёрных / серых блоков;
- [x] surface hierarchy читается;
- [x] borders тонкие, но заметны на каждом surface level;
- [ ] shadows используются только при необходимости;
- [x] orange accent дозирован;
- [x] orange, green, and cyan glow appear only on meaningful interaction or status states;
- [x] semantic colors имеют смысл;
- [x] нет случайных purple / pink / blue accents;
- [x] radius консистентны;
- [x] иконки из одной библиотеки;
- [x] typography hierarchy стабильна.
- [x] ни один видимый текст не меньше 13px.

---

# 3. Typography QA

- [x] нет thin weights;
- [x] body text и метаданные читаемы; минимальный видимый текст — 13px;
- [x] muted text читается;
- [x] browser-scaled small text and semantic headings stay at or above 13px;
- [x] page title не oversized;
- [ ] numbers / prices выровнены;
- [x] Russian strings не ломают layout;
- [x] long company names wrap correctly.

---

# 4. Layout QA

- [ ] main content не прилипает к sidebar;
- [ ] cards имеют одинаковую систему padding;
- [ ] форма и вложения сгруппированы, выбранные файлы видны отдельной строкой;
- [ ] grids align;
- [ ] forms не растянуты на 1600px без причины;
- [ ] large desktop имеет max-width strategy;
- [ ] detail screens имеют ясную hierarchy.

---

# 5. Mobile QA

На 375px:

- [x] no horizontal overflow;
- [x] bottom nav не перекрывает контент;
- [x] sticky CTA учитывает safe area;
- [x] текст не становится слишком мелким; подписи навигации переносятся на две строки и не обрезаются;
- [x] buttons ≥ comfortable touch size;
- [ ] table превращается в cards / responsive rows;
- [ ] modal не выходит за viewport;
- [ ] dropdown не обрезается;
- [ ] file upload работает;
- [ ] long address читается.

---

# 6. Client QA

- [ ] создать заявку можно без обучения;
- [ ] active order виден сразу;
- [ ] status понятен;
- [ ] timeline не показывает internal events;
- [ ] водитель отображается только когда релевантно;
- [ ] цена читаема;
- [ ] documents доступны;
- [ ] нет operational clutter.

---

# 7. Manager QA

- [ ] новые заявки заметны;
- [ ] unassigned orders заметны;
- [ ] issue заметны;
- [ ] filters работают;
- [ ] driver assignment быстрый;
- [ ] current status + next action очевидны;
- [ ] internal/client comment scopes не путаются;
- [ ] finance visible;
- [ ] table density не мешает readability.

---

# 8. Driver QA

На 375px:

- [ ] current job — главный объект;
- [ ] address visible;
- [ ] phone clickable;
- [ ] map CTA доступен;
- [ ] current action sticky;
- [ ] photo upload camera-friendly;
- [ ] issue CTA понятен;
- [ ] нет финансовой информации;
- [ ] можно пройти demo flow одной рукой.

---

# 9. Warehouse QA

- [ ] поиск по номеру заявки заметен;
- [ ] expected vs actual хорошо различимы;
- [ ] discrepancy виден;
- [ ] фото можно добавить быстро;
- [ ] services можно отметить;
- [ ] release flow понятен;
- [ ] mobile/tablet удобны.

---

# 10. Admin QA

- [ ] users manageable;
- [ ] roles visible;
- [ ] active/inactive consistent;
- [ ] destructive actions подтверждаются;
- [ ] audit read-only;
- [ ] demo tools скрыты вне demo mode.

---

# 11. Status QA

- [ ] один status = один централизованный token;
- [ ] label одинаковый на всех экранах;
- [ ] статус не передаётся только цветом;
- [ ] ISSUE / CANCELLED / COMPLETED визуально различимы;
- [ ] milestone stepper не показывает все internal statuses.

---

# 12. Component QA

Для каждого:
- [ ] default;
- [ ] hover;
- [ ] focus;
- [ ] active;
- [ ] disabled;
- [ ] loading;
- [ ] error where relevant.

---

# 13. Empty / Loading / Error QA

Каждый data screen:
- [ ] skeleton/loading;
- [ ] empty state;
- [ ] error state;
- [ ] retry where appropriate.

---

# 14. Reference Alignment QA

Сравнить с reference pack.

Должны сохраниться:
- dark premium density;
- subtle lines;
- orange accent;
- professional map UI;
- timeline language;
- compact SaaS cards.

Не должно появиться:
- generic Bootstrap admin;
- giant white cards;
- Material-like bright colors;
- excessive gradient UI;
- random shadows.

---

# 15. Functional Visual QA

Не принимать красивый экран, если:
- [ ] кнопка ничего не делает;
- [ ] status не обновляется;
- [ ] modal не сохраняет;
- [ ] mobile action inaccessible;
- [ ] route point не связан с data;
- [ ] demo role switcher ломает state.

---

# 16. Screenshot QA Set

Перед финальным pass сделать screenshots:

### Client
- Dashboard desktop
- Order desktop
- Create Order mobile
- Order mobile

### Manager
- Dashboard desktop
- Orders desktop
- Order desktop
- Fleet/Planning desktop

### Driver
- Today mobile
- Job mobile

### Warehouse
- Dashboard tablet/mobile
- Intake mobile

### Admin
- Users desktop
- Services desktop

---

# 17. Visual acceptance

Экран считается принятым, если:

1. соответствует domain logic;
2. соответствует role;
3. использует design tokens;
4. mobile / desktop ведут себя правильно;
5. нет overflow;
6. нет случайных visual patterns;
7. primary action понятен;
8. status понятен;
9. empty/loading/error предусмотрены;
10. визуально ощущается частью одного продукта.

---

# 18. Final principle

Если есть выбор между:
- более эффектным;
- более понятным;

выбирать более понятное.

Если оба решения одинаково понятны —
выбирать более аккуратное и технологичное.
