(() => {
  "use strict";

  const roles = {
    client: { label: "Заказчик", name: "Алексей Морозов", company: "СтальПром", initials: "АМ" },
    manager: { label: "Менеджер", name: "Анна Смирнова", company: "Операционный отдел", initials: "АС" },
    driver: { label: "Водитель", name: "Сергей Волков", company: "Парк LogSklad", initials: "СВ" },
    warehouse: { label: "Склад", name: "Михаил Орлов", company: "Склад · Химки", initials: "МО" },
    admin: { label: "Администратор", name: "Екатерина Лебедева", company: "LogSklad", initials: "ЕЛ" },
  };

  const navigation = {
    client: [
      ["overview", "Обзор", "dashboard"], ["orders", "Заявки", "orders"], ["new", "Создать заявку", "plus"],
      ["documents", "Документы", "file"], ["notifications", "Уведомления", "bell"], ["profile", "Профиль", "user"],
    ],
    manager: [
      ["overview", "Обзор", "dashboard"], ["incoming", "Входящие", "inbox"], ["orders", "Все заявки", "orders"],
      ["planning", "Планирование", "calendar"], ["drivers", "Водители", "truck"], ["warehouse", "Склад", "warehouse"],
      ["documents", "Документы", "file"], ["notifications", "Уведомления", "bell"],
    ],
    driver: [
      ["overview", "Сегодня", "dashboard"], ["jobs", "Мои задания", "map"], ["history", "История", "history"],
      ["notifications", "Уведомления", "bell"], ["profile", "Профиль", "user"],
    ],
    warehouse: [
      ["overview", "Сегодня", "dashboard"], ["expected", "Ожидается", "calendar"], ["intake", "Приёмка", "package"],
      ["on-warehouse", "На складе", "warehouse"], ["processing", "Обработка", "settings"], ["ready", "К выдаче", "check"],
      ["history", "История", "history"], ["notifications", "Уведомления", "bell"],
    ],
    admin: [
      ["overview", "Обзор", "dashboard"], ["users", "Пользователи", "users"], ["companies", "Компании", "building"],
      ["drivers", "Водители", "truck"], ["vehicles", "Транспорт", "truck"], ["warehouse", "Склады", "warehouse"],
      ["services", "Услуги", "settings"], ["orders", "Заявки", "orders"], ["audit", "Журнал действий", "history"],
      ["demo", "Демо-режим", "eye"],
    ],
  };

  const statusMap = {
    DRAFT: ["Черновик", "neutral"],
    SUBMITTED: ["Отправлена", "info"],
    REVIEW: ["На проверке", "info"],
    CONFIRMED: ["Согласована", "accent"],
    DRIVER_ASSIGNED: ["Водитель назначен", "accent"],
    PICKUP_IN_PROGRESS: ["Забор груза", "warning"],
    PICKED_UP: ["Груз забран", "info"],
    AT_WAREHOUSE: ["Принят на склад", "info"],
    WAREHOUSE_PROCESSING: ["Обработка на складе", "warning"],
    READY_FOR_DELIVERY: ["Готов к отправке", "accent"],
    DELIVERY_IN_PROGRESS: ["В доставке", "warning"],
    DELIVERED: ["Доставлен", "success"],
    COMPLETED: ["Завершена", "success"],
    ON_HOLD: ["Приостановлена", "warning"],
    ISSUE: ["Требует внимания", "danger"],
    CANCELLED: ["Отменена", "neutral"],
  };

  const orders = [
    { id: "00134", number: "TR-2609-00134", title: "Модуль управления производственной линией", route: "Санкт-Петербург → Химки", status: "REVIEW", date: "23 сен · 11:30", amount: "42 100 ₽", next: "Проверка данных" },
    { id: "00133", number: "TR-2609-00133", title: "Промышленная арматура", route: "Москва → Воронеж", status: "READY_FOR_DELIVERY", date: "23 сен · 14:00", amount: "36 800 ₽", next: "Назначить доставку" },
    { id: "00132", number: "TR-2609-00132", title: "Электрощитовое оборудование", route: "Поставщик → Склад Химки", status: "AT_WAREHOUSE", date: "23 сен · 09:05", amount: "28 400 ₽", next: "Сверить количество мест" },
    { id: "00131", number: "TR-2609-00131", title: "Кабельные лотки · партия 3", route: "Москва → Химки", status: "PICKED_UP", date: "23 сен · 08:40", amount: "19 600 ₽", next: "Приёмка на складе" },
    { id: "00130", number: "TR-2609-00130", title: "Насосная станция для объекта Северный", route: "Москва → Химки", status: "CONFIRMED", date: "23 сен · 10:30", amount: "54 200 ₽", next: "Передать водителю" },
    { id: "00129", number: "TR-2609-00129", title: "Листовой металл · требуется уточнение", route: "Москва → Тула", status: "ISSUE", date: "Сегодня · 08:50", amount: "31 900 ₽", next: "Согласовать окно разгрузки" },
    { id: "00128", number: "TR-2609-00128", title: "Насосная станция на объект Северный", route: "Москва → Химки", status: "SUBMITTED", date: "Сегодня · 08:20", amount: "54 200 ₽", next: "Проверка заявки" },
    { id: "00127", number: "TR-2609-00127", title: "Комплект автоматики для склада", route: "Москва → Тверь", status: "DRIVER_ASSIGNED", date: "Сегодня · 07:00", amount: "26 500 ₽", next: "Забор груза" },
    { id: "00126", number: "TR-2609-00126", title: "Маркировка кабельных сборок", route: "Склад Химки", status: "WAREHOUSE_PROCESSING", date: "Вчера · 13:00", amount: "8 200 ₽", next: "Завершить обработку" },
    { id: "00125", number: "TR-2609-00125", title: "Поставка крепежа на объект", route: "Москва → Рязань", status: "DELIVERY_IN_PROGRESS", date: "Сегодня · 06:45", amount: "17 300 ₽", next: "Доставка получателю" },
    { id: "00124", number: "TR-2609-00124", title: "Профиль стальной для цеха №2", route: "Москва → Воронеж", status: "COMPLETED", date: "19 сен · 15:30", amount: "42 100 ₽", next: "Завершена" },
  ];

  const metrics = {
    client: [["Активные заявки", "6", "На разных этапах", "orders"], ["В пути", "2", "Обновлены сегодня", "truck"], ["На складе", "2", "Ожидают обработки", "warehouse"], ["За сентябрь", "14", "Перевозки компании", "chart"]],
    manager: [["В работе", "24", "Заявки на всех этапах", "orders"], ["Нужна проверка", "5", "Ожидают решения", "inbox"], ["Водители в рейсе", "8", "Из 12 доступных", "truck"], ["Открытые вопросы", "2", "Требуют внимания", "alert"]],
    driver: [["Задания сегодня", "3", "По текущему маршруту", "map"], ["Следующая точка", "10:30", "Забор у поставщика", "clock"], ["За неделю", "18", "Выполнено доставок", "check"], ["Документы", "2", "К подписи после рейса", "file"]],
    warehouse: [["Ожидается", "4", "Поставки на сегодня", "calendar"], ["Приёмка", "2", "Нужно сверить груз", "package"], ["Обработка", "3", "Операции в работе", "settings"], ["К выдаче", "2", "Готовые отправки", "check"]],
    admin: [["Заявки", "248", "За всё время", "orders"], ["Компании", "18", "Активные клиенты", "building"], ["Пользователи", "42", "Во всех ролях", "users"], ["Состояние", "Норма", "Демо-среда", "check"]],
  };

  const pageCopy = {
    overview: ["ОБЗОР", "Рабочий день под контролем", "Ключевые события и ближайшие действия в одной панели."],
    orders: ["ЗАЯВКИ", "Все заявки", "Статусы, маршрут и следующий шаг по каждой перевозке."],
    new: ["НОВАЯ ЗАЯВКА", "Создание заявки", "Пройдите демонстрационный сценарий. Данные останутся только на этой странице."],
    documents: ["ДОКУМЕНТЫ", "Документы и файлы", "Примеры файлов, прикреплённых к демонстрационным заявкам."],
    notifications: ["УВЕДОМЛЕНИЯ", "Центр уведомлений", "Важные обновления по заявкам и складским операциям."],
    profile: ["ПРОФИЛЬ", "Профиль пользователя", "Демонстрационный профиль выбранной роли."],
    incoming: ["ВХОДЯЩИЕ", "Новые заявки", "Заявки, которые ждут проверки менеджером."],
    planning: ["ПЛАНИРОВАНИЕ", "Планирование перевозок", "Маршруты, назначенные водители и ближайшие временные окна."],
    drivers: ["ВОДИТЕЛИ", "Водители и транспорт", "Доступность команды и активные назначения."],
    warehouse: ["СКЛАД", "Складские операции", "Поступления и грузы, находящиеся на складе."],
    jobs: ["МОИ ЗАДАНИЯ", "Маршрут на сегодня", "Точки маршрута и задания водителя."],
    history: ["ИСТОРИЯ", "История операций", "Завершённые этапы и последние изменения."],
    expected: ["ОЖИДАЕТСЯ", "Ожидаемые поставки", "Грузы, которые должны поступить на склад."],
    intake: ["ПРИЁМКА", "Приёмка грузов", "Сверка количества мест и веса по прибывшим грузам."],
    "on-warehouse": ["НА СКЛАДЕ", "Грузы на складе", "Текущий статус и план обработки поступлений."],
    processing: ["ОБРАБОТКА", "Операции обработки", "Упаковка, маркировка и подготовка к выдаче."],
    ready: ["К ВЫДАЧЕ", "Готовые к выдаче", "Заказы, подготовленные к следующему этапу."],
    users: ["ПОЛЬЗОВАТЕЛИ", "Пользователи платформы", "Демо-список профилей по ролям."],
    companies: ["КОМПАНИИ", "Компании-клиенты", "Демонстрационные карточки организаций."],
    vehicles: ["ТРАНСПОРТ", "Транспорт", "Пример карточки машины и её вместимости."],
    services: ["УСЛУГИ", "Складские услуги", "Примеры дополнительных услуг и операций."],
    audit: ["ЖУРНАЛ ДЕЙСТВИЙ", "История изменений", "Демонстрационные события в журнале аудита."],
    demo: ["ДЕМО-РЕЖИМ", "Просмотр без сохранения", "Все данные ниже предназначены только для ознакомления."],
  };

  const icons = {
    dashboard: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="5" rx="1.4"/><rect x="14" y="12" width="7" height="9" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/>',
    orders: '<path d="M8 4h10l3 3v13H8z"/><path d="M18 4v4h4M11 12h7M11 16h7M4 8v13h13"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    file: '<path d="M13 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10z"/><path d="M13 3v7h7M8 14h8M8 17h6"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    inbox: '<path d="M4 4h16l2 11H2z"/><path d="M2 15h6l2 3h4l2-3h6"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h3M8 17h7"/>',
    truck: '<path d="M3 6h11v12H3zM14 10h4l3 3v5h-7z"/><circle cx="7.5" cy="19" r="1.5"/><circle cx="17.5" cy="19" r="1.5"/>',
    warehouse: '<path d="m3 10 9-7 9 7v10H3z"/><path d="M7 20v-6h10v6M8 10h.01M12 10h.01M16 10h.01"/>',
    map: '<path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/><circle cx="15" cy="11" r="1.7"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    package: '<path d="m12 3 9 5-9 5-9-5zM3 8v9l9 5 9-5V8M12 13v9M7.5 5.5l9 5"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.5.9L16 21h-2.8l-.3-1.9a8 8 0 0 1-1.7-.6l-1.6 1-2-1.9.8-1.6a8 8 0 0 1-.6-1.7L6 13.8V11l1.9-.3a8 8 0 0 1 .6-1.7l-1-1.6 1.9-2 1.6.8a8 8 0 0 1 1.7-.6L13 3.7h2.8l.3 1.9a8 8 0 0 1 1.7.6l1.6-1 2 1.9-.8 1.6a8 8 0 0 1 .6 1.7l1.9.3v2.8l-1.9.3a8 8 0 0 1-.6 1.2z"/>',
    building: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h2M14 7h2M8 11h2M14 11h2M8 15h2M14 15h2M10 21v-3h4v3"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="10" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z"/><circle cx="12" cy="12" r="3"/>',
    alert: '<path d="m12 3 10 18H2L12 3z"/><path d="M12 9v5M12 17h.01"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 5 5"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    chart: '<path d="M4 19V5M4 19h17M8 15l4-4 3 2 5-6"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
    back: '<path d="m15 18-6-6 6-6M9 12h12"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  };

  const state = {
    role: "client",
    screen: "overview",
    orderId: "",
    filter: "all",
    wizardStep: 1,
    form: { cargo: "", pickup: "", destination: "", weight: "", date: "" },
    mobileNav: false,
  };
  const app = document.getElementById("app");
  let toastTimer = 0;

  function icon(name, extraClass) {
    return '<svg class="' + (extraClass || "") + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (icons[name] || icons.info) + "</svg>";
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function currentOrder() {
    return orders.find(function (order) { return order.id === state.orderId; }) || orders[0];
  }

  function visibleOrders(role) {
    if (role === "driver") return orders.filter(function (order) { return ["DRIVER_ASSIGNED", "PICKED_UP", "DELIVERY_IN_PROGRESS", "READY_FOR_DELIVERY"].includes(order.status); });
    if (role === "warehouse") return orders.filter(function (order) { return ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING", "READY_FOR_DELIVERY", "PICKED_UP"].includes(order.status); });
    if (role === "client") return orders.filter(function (order) { return order.status !== "CANCELLED"; });
    return orders;
  }

  function badge(status) {
    const item = statusMap[status] || ["В работе", "neutral"];
    return '<span class="status-pill tone-' + item[1] + '"><span class="status-dot"></span>' + escapeHtml(item[0]) + "</span>";
  }

  function pageHeading(screen, role) {
    const copy = pageCopy[screen] || ["РАБОЧИЙ РАЗДЕЛ", "Рабочая область", "Данные демонстрационной среды."];
    const createButton = role === "client" && screen === "overview"
      ? '<button class="button button-primary" type="button" data-nav="new">' + icon("plus") + " Создать заявку</button>"
      : "";
    return '<header class="page-heading"><div class="heading-copy"><span class="eyebrow">' + copy[0] + '</span><h1>' + copy[1] + '</h1><p class="page-description">' + copy[2] + "</p></div>" + createButton + "</header>";
  }

  function metricCards(role) {
    return '<section class="metrics" aria-label="Ключевые показатели">' + metrics[role].map(function (item) {
      return '<article class="metric-card"><div class="metric-head"><span>' + item[0] + '</span><span class="metric-icon">' + icon(item[3]) + "</span></div><strong>" + item[1] + "</strong><p>" + item[2] + "</p></article>";
    }).join("") + "</section>";
  }

  function tableRows(items, full) {
    if (!items.length) return '<tr><td colspan="5">Подходящих заявок нет.</td></tr>';
    return items.map(function (order) {
      return '<tr data-open-order="' + order.id + '" tabindex="0" role="button" aria-label="Открыть заявку ' + escapeHtml(order.number) + '">' +
        "<td><span class=\"order-number\">" + escapeHtml(order.number) + '</span><span class="order-subtitle">' + escapeHtml(order.title) + "</span></td>" +
        '<td><span class="route-copy">' + escapeHtml(order.route) + "</span></td>" +
        "<td>" + badge(order.status) + "</td>" +
        '<td><span class="amount">' + escapeHtml(order.date) + "</span></td>" +
        (full ? '<td><span class="amount">' + escapeHtml(order.amount) + "</span></td>" : "") +
        "</tr>";
    }).join("");
  }

  function orderTable(items, full) {
    return '<div class="order-table-wrap"><table class="order-table' + (full ? " full" : "") + '"><thead><tr><th>Заявка</th><th>Маршрут</th><th>Статус</th><th>Обновлена</th>' + (full ? "<th>Сумма</th>" : "") + '</tr></thead><tbody>' + tableRows(items, full) + "</tbody></table></div>";
  }

  function panelHeading(title, subtitle, iconName, trailing) {
    return '<div class="panel-heading"><div class="panel-title"><span class="panel-title-icon">' + icon(iconName || "orders") + '</span><div><h2>' + title + "</h2>" + (subtitle ? "<p>" + subtitle + "</p>" : "") + "</div></div>" + (trailing || "") + "</div>";
  }

  function timeline() {
    const items = [
      ["Заявка обновлена", "TR-2609-00132 · принятие на складе", "Сегодня, 09:05"],
      ["Водитель забрал груз", "TR-2609-00131 · маршрут продолжается", "Сегодня, 08:40"],
      ["Новая заявка отправлена", "TR-2609-00128 · ожидает проверки", "Сегодня, 08:20"],
    ];
    return '<div class="timeline">' + items.map(function (item) {
      return '<div class="timeline-item"><span class="timeline-mark">' + icon("check") + '</span><div class="timeline-copy"><strong>' + item[0] + "</strong><span>" + item[1] + "</span><time>" + item[2] + "</time></div></div>";
    }).join("") + "</div>";
  }

  function dashboard(role) {
    const list = visibleOrders(role);
    const focus = role === "driver" ? orders[7] : role === "warehouse" ? orders[2] : role === "manager" ? orders[5] : orders[6];
    const listTitle = role === "warehouse" ? "Поступления и выдачи" : role === "driver" ? "Задания на сегодня" : role === "manager" ? "Нужны действия" : role === "admin" ? "Последние события" : "Последние заявки";
    const action = role === "warehouse" ? "Сверить груз при приёмке" : role === "driver" ? "Забрать груз у поставщика" : role === "manager" ? "Уточнить окно разгрузки" : role === "admin" ? "Проверить журнал операций" : "Проверка данных заявки";
    return metricCards(role) +
      '<div class="workspace-grid"><section class="panel">' + panelHeading(listTitle, "Демонстрационные данные на 23 сентября", "orders", '<button class="button button-ghost" type="button" data-nav="' + (role === "driver" ? "jobs" : "orders") + '">Все записи ' + icon("arrow") + "</button>") +
      orderTable((role === "manager" ? [orders[5], orders[1], orders[6], orders[7]] : role === "warehouse" ? [orders[2], orders[8], orders[9], orders[3]] : role === "driver" ? [orders[7], orders[3], orders[9], orders[1]] : role === "admin" ? [orders[0], orders[1], orders[2], orders[3]] : list.slice(0, 4)), false) +
      '</section><div><section class="panel">' + panelHeading("Состояние перевозки", "В одном окне — путь и ответственный", "map", "") +
      '<div class="route-map"><div class="route-map-label"><span>АКТИВНЫЙ МАРШРУТ</span><span>В ПУТИ</span></div><svg class="route-graphic" viewBox="0 0 360 120" preserveAspectRatio="none" aria-hidden="true"><path class="route-line" d="M28 83 C72 81 77 34 127 46 S180 93 220 67 286 43 332 26"/><path class="route-progress" d="M28 83 C72 81 77 34 127 46 S180 93 220 67"/><circle class="route-point" cx="28" cy="83" r="6"/><circle class="route-point" cx="220" cy="67" r="6"/><circle class="route-point-secondary" cx="332" cy="26" r="6"/></svg></div>' +
      '<div class="route-labels"><div><small>ОТКУДА</small><strong>Москва</strong></div><div><small>КУДА</small><strong>Химки · склад</strong></div></div>' +
      '<div class="next-action"><span class="action-icon">' + icon("clock") + '</span><div><small>СЛЕДУЮЩЕЕ ДЕЙСТВИЕ</small><strong>' + action + "</strong><span>" + escapeHtml(focus.number) + " · " + escapeHtml(focus.date) + "</span></div></div></section>" +
      '<section class="panel" style="margin-top:13px">' + panelHeading("Последние события", "Единая история работы", "history", "") + timeline() + "</section></div></div>";
  }

  function listPage(screen, role) {
    let rows = visibleOrders(role);
    if (screen === "incoming") rows = orders.filter(function (order) { return ["SUBMITTED", "REVIEW"].includes(order.status); });
    if (screen === "expected") rows = orders.filter(function (order) { return ["CONFIRMED", "SUBMITTED", "DRIVER_ASSIGNED"].includes(order.status); });
    if (screen === "intake") rows = orders.filter(function (order) { return order.status === "AT_WAREHOUSE"; });
    if (screen === "on-warehouse") rows = orders.filter(function (order) { return ["AT_WAREHOUSE", "WAREHOUSE_PROCESSING"].includes(order.status); });
    if (screen === "processing") rows = orders.filter(function (order) { return order.status === "WAREHOUSE_PROCESSING"; });
    if (screen === "ready") rows = orders.filter(function (order) { return order.status === "READY_FOR_DELIVERY"; });
    if (screen === "history") rows = orders.filter(function (order) { return ["COMPLETED", "DELIVERED"].includes(order.status); });
    return '<section class="panel">' + panelHeading((pageCopy[screen] || pageCopy.orders)[1], rows.length + " демонстрационных записей", "orders", "") +
      '<div class="toolbar"><label class="search-box">' + icon("search") + '<input type="search" data-search placeholder="Номер, груз или маршрут" aria-label="Поиск заявок"></label><div class="filter-chips"><button type="button" class="filter-chip active" data-filter="all">Все</button><button type="button" class="filter-chip" data-filter="attention">Требуют внимания</button><button type="button" class="filter-chip" data-filter="active">В работе</button></div></div>' +
      '<div data-list-table>' + orderTable(rows, true) + "</div></section>";
  }

  function detailPage() {
    const order = currentOrder();
    return '<div class="detail-grid"><section class="panel"><div class="detail-hero"><div><span class="eyebrow">' + escapeHtml(order.number) + '</span><h2>' + escapeHtml(order.title) + '</h2><div class="detail-meta"><span>СтальПром</span><span>Создана 20 сентября</span><span>2 места · 240 кг</span></div></div>' + badge(order.status) + '</div><div class="detail-route"><div class="route-track"><span></span><span></span></div><div class="route-stops"><div><small>ПОСТАВЩИК · ЗАБОР</small><strong>МеталлТрейд</strong><span>Москва, ул. Промышленная, 7</span></div><div><small>ПОЛУЧАТЕЛЬ · ДОСТАВКА</small><strong>Склад LogSklad · Химки</strong><span>Вашутинское шоссе, 18</span></div></div></div></section><aside class="panel">' + panelHeading("Сводка заявки", "Демонстрационные параметры", "file", "") + '<dl class="detail-stat-list"><div><dt>Следующий этап</dt><dd>' + escapeHtml(order.next) + '</dd></div><div><dt>Плановое время</dt><dd>' + escapeHtml(order.date) + '</dd></div><div><dt>Стоимость</dt><dd>' + escapeHtml(order.amount) + '</dd></div><div><dt>Водитель</dt><dd>Сергей Волков</dd></div><div><dt>Автомобиль</dt><dd>Газель Next · А123ВС 799</dd></div></dl></aside></div><section class="panel">' + panelHeading("История заявки", "Статусы и действия по порядку", "history", "") + timeline() + "</section>";
  }

  function wizardPage() {
    const steps = ["Груз", "Маршрут", "Проверка"];
    const stepHead = '<div class="wizard-steps">' + steps.map(function (label, index) {
      const number = index + 1;
      return '<div class="wizard-step' + (state.wizardStep === number ? " active" : "") + '"><span>' + number + "</span>" + label + "</div>";
    }).join("") + "</div>";
    let fields = "";
    if (state.wizardStep === 1) {
      fields = '<div class="form-grid"><div class="field full"><label for="cargo">Что перевозим</label><input id="cargo" name="cargo" value="' + escapeHtml(state.form.cargo) + '" placeholder="Например, промышленное оборудование"></div><div class="field"><label for="weight">Вес, кг</label><input id="weight" name="weight" type="number" min="1" value="' + escapeHtml(state.form.weight) + '" placeholder="240"></div><div class="field"><label for="places">Количество мест</label><input id="places" name="places" type="number" min="1" value="2"></div><div class="field full"><label for="notes">Комментарий</label><textarea id="notes" name="notes" placeholder="Особые условия или требования"></textarea></div></div>';
    } else if (state.wizardStep === 2) {
      fields = '<div class="form-grid"><div class="field full"><label for="pickup">Адрес забора</label><input id="pickup" name="pickup" value="' + escapeHtml(state.form.pickup) + '" placeholder="Город, улица, дом"></div><div class="field full"><label for="destination">Адрес доставки</label><input id="destination" name="destination" value="' + escapeHtml(state.form.destination) + '" placeholder="Город, улица, дом"></div><div class="field"><label for="date">Дата забора</label><input id="date" name="date" type="date" value="' + escapeHtml(state.form.date) + '"></div><div class="field"><label for="service">Дополнительная услуга</label><select id="service" name="service"><option>Без дополнительных услуг</option><option>Фотоотчёт</option><option>Упаковка</option><option>Страхование</option></select></div></div>';
    } else {
      fields = '<div class="readonly-card"><h3>Заявка готова к отправке</h3><p><strong>Груз:</strong> ' + escapeHtml(state.form.cargo || "Промышленное оборудование") + "<br><strong>Маршрут:</strong> " + escapeHtml(state.form.pickup || "Москва, Промышленная, 7") + " → " + escapeHtml(state.form.destination || "Химки, Вашутинское шоссе, 18") + "<br><strong>Вес:</strong> " + escapeHtml(state.form.weight || "240") + " кг<br><strong>Забор:</strong> " + escapeHtml(state.form.date || "23 сентября") + "</p></div>";
    }
    const back = state.wizardStep > 1 ? '<button class="button button-secondary" type="button" data-wizard-back>' + icon("back") + " Назад</button>" : '<button class="button button-secondary" type="button" data-toast="Черновик в демонстрационном просмотре не сохраняется.">Сохранить черновик</button>';
    const nextLabel = state.wizardStep < 3 ? "Продолжить " + icon("arrow") : "Отправить на проверку " + icon("arrow");
    return '<div class="wizard"><section class="panel">' + stepHead + '<form data-wizard-form>' + fields + '<div class="wizard-actions">' + back + '<button class="button button-primary" type="submit">' + nextLabel + "</button></div></form></section><aside class=\"panel\">" + panelHeading("Как это работает", "Шаг за шагом", "info", "") + '<div class="readonly-card"><h3>Демо-сценарий</h3><p>Заполните форму и пройдите все шаги. Можно посмотреть, как устроен процесс создания заявки. Форма не отправляет и не сохраняет данные.</p></div><div class="next-action"><span class="action-icon">' + icon("check") + '</span><div><small>ПОСЛЕ ПРОВЕРКИ</small><strong>Менеджер согласует стоимость и сроки</strong><span>Изменения доступны в рабочей версии приложения</span></div></div></aside></div>';
  }

  function documentsPage() {
    const docs = [
      ["PDF", "Транспортная накладная", "TR-2609-00124 · 19 сентября", "file"],
      ["JPG", "Фото груза при приёмке", "TR-2609-00132 · сегодня, 09:05", "package"],
      ["PDF", "Подтверждение доставки", "TR-2609-00124 · 19 сентября", "check"],
    ];
    return '<section class="section-grid">' + docs.map(function (doc) {
      return '<article class="section-card"><div class="section-card-head"><span class="metric-icon">' + icon(doc[3]) + "</span><span>" + doc[0] + '</span></div><div><h2>' + doc[1] + "</h2><p>" + doc[2] + "</p></div></article>";
    }).join("") + "</section>";
  }

  function notificationsPage() {
    return '<section class="panel">' + panelHeading("Недавние уведомления", "Обновления демонстрационной среды", "bell", "") + timeline() + '<div class="next-action"><span class="action-icon">' + icon("info") + '</span><div><small>ПРОСМОТР</small><strong>Отметки о прочтении не сохраняются</strong><span>Здесь показаны примеры уведомлений по заявкам.</span></div></div></section>';
  }

  function profilePage(role) {
    const user = roles[role];
    return '<div class="detail-grid">' +
      '<section class="panel">' +
      '<div class="detail-hero"><div class="identity-chip"><span class="avatar">' + escapeHtml(user.initials) + '</span><div class="identity-copy"><strong>' + escapeHtml(user.name) + '</strong><small>' + escapeHtml(user.label) + '</small></div></div>' +
      '<span class="status-pill tone-success"><span class="status-dot"></span>Активный профиль</span></div>' +
      '<dl class="detail-stat-list" style="margin-top:16px">' +
      '<div><dt>Компания / подразделение</dt><dd>' + escapeHtml(user.company) + '</dd></div>' +
      '<div><dt>Рабочий номер</dt><dd>Демо-контакт</dd></div>' +
      '<div><dt>Уведомления</dt><dd>Включены в примере</dd></div>' +
      '</dl></section><aside class="panel">' +
      panelHeading("Роль в платформе", "Демо-идентичность", "user", "") +
      '<div class="readonly-card"><h3>' + escapeHtml(user.label) + '</h3><p>В боковом меню отображены разделы, предназначенные для этой роли. Переключите роль слева, чтобы посмотреть другие рабочие пространства.</p></div>' +
      '</aside></div>';
  }
  function planningPage() {
    return '<div class="workspace-grid"><section class="panel">' + panelHeading("Активные маршруты", "Назначения на 23 сентября", "map", "") + orderTable([orders[7], orders[3], orders[9]], false) + '</section><section class="panel">' + panelHeading("Доступность команды", "Короткая сводка", "truck", "") + '<dl class="detail-stat-list"><div><dt>Водители на линии</dt><dd>8 из 12</dd></div><div><dt>Свободный транспорт</dt><dd>4 автомобиля</dd></div><div><dt>Ближайшее окно</dt><dd>10:30 · Москва</dd></div><div><dt>Маршруты с вопросом</dt><dd>1 заявка</dd></div></dl><div class="next-action"><span class="action-icon">' + icon("alert") + '</span><div><small>ТРЕБУЕТ ВНИМАНИЯ</small><strong>Согласовать окно разгрузки</strong><span>TR-2609-00129 · Тула</span></div></div></section></div>';
  }

  function directoryPage(screen) {
    const cards = screen === "drivers"
      ? [["Сергей Волков", "В рейсе · Газель Next", "3 задания сегодня", "truck"], ["Дмитрий Крылов", "Свободен · тентованный фургон", "Доступен для назначения", "user"]]
      : screen === "vehicles"
        ? [["Газель Next · фургон", "А123ВС 799", "Грузоподъёмность 1 500 кг", "truck"], ["Фургон · удлинённый", "К451МР 799", "Грузоподъёмность 2 000 кг", "truck"]]
        : screen === "companies"
          ? [["СтальПром", "ООО · Москва", "Активная компания", "building"], ["СеверСнаб", "ООО · Санкт-Петербург", "Активная компания", "building"]]
          : screen === "services"
            ? [["Фотоотчёт", "Фото груза при приёмке и выдаче", "2 200 ₽ · услуга", "file"], ["Упаковка", "Подготовка к перевозке или хранению", "2 200 ₽ · операция", "package"]]
            : screen === "users"
              ? Object.keys(roles).map(function (key) { return [roles[key].name, roles[key].label, roles[key].company, "user"]; })
              : [["Поступление на склад", "TR-2609-00132 · Михаил Орлов", "Сегодня, 09:05", "package"], ["Назначение водителя", "TR-2609-00130 · Сергей Волков", "Сегодня, 08:15", "truck"]];
    return '<section class="section-grid">' + cards.map(function (card) {
      return '<article class="section-card"><div class="section-card-head"><span class="metric-icon">' + icon(card[3]) + '</span><span class="status-pill tone-success"><span class="status-dot"></span>Активно</span></div><div><h2>' + escapeHtml(card[0]) + "</h2><p>" + escapeHtml(card[1]) + "<br>" + escapeHtml(card[2]) + "</p></div></article>";
    }).join("") + "</section>";
  }

  function genericPage(screen, role) {
    if (screen === "documents") return documentsPage();
    if (screen === "notifications") return notificationsPage();
    if (screen === "profile") return profilePage(role);
    if (screen === "planning") return planningPage();
    if (["drivers", "vehicles", "companies", "services", "users", "audit", "warehouse", "demo"].includes(screen)) return directoryPage(screen);
    return listPage(screen, role);
  }

  function viewContent() {
    if (state.screen === "overview") return dashboard(state.role);
    if (state.screen === "new") return wizardPage();
    if (state.screen === "order-detail") return detailPage();
    return genericPage(state.screen, state.role);
  }

  function syncUrl(replace) {
    const params = new URLSearchParams();
    params.set("role", state.role);
    params.set("screen", state.screen);
    if (state.orderId) params.set("order", state.orderId);
    const nextUrl = window.location.pathname + "?" + params.toString();
    if (replace) window.history.replaceState({}, "", nextUrl);
    else window.history.pushState({}, "", nextUrl);
  }

  function render() {
    const role = roles[state.role] ? state.role : "client";
    state.role = role;
    const user = roles[role];
    const items = navigation[role];
    const title = state.screen === "order-detail" ? "Карточка заявки" : (pageCopy[state.screen] || ["", "LogSklad"])[1];
    const navLinks = items.map(function (item) {
      return '<a href="?role=' + role + '&screen=' + item[0] + '" class="nav-link' + (state.screen === item[0] ? " active" : "") + '" data-nav="' + item[0] + '">' + icon(item[2]) + "<span>" + item[1] + "</span></a>";
    }).join("");
    const roleOptions = Object.keys(roles).map(function (key) {
      return '<option value="' + key + '"' + (key === role ? " selected" : "") + ">" + roles[key].label + "</option>";
    }).join("");
    app.innerHTML =
      '<div class="shell">' +
        '<aside class="sidebar' + (state.mobileNav ? " open" : "") + '" id="sidebar">' +
          '<a class="brand" href="?role=client&screen=overview" data-nav="overview" data-role-link="client"><span class="brand-mark">L</span><span class="brand-copy"><strong>LOGSKLAD</strong><small>LOGISTICS PLATFORM</small></span></a>' +
          '<div class="sidebar-label">РАБОЧЕЕ ПРОСТРАНСТВО</div>' +
          '<nav class="side-nav" aria-label="Разделы">' + navLinks + '</nav>' +
          '<div class="nav-spacer"></div>' +
          '<div class="demo-note"><span class="demo-dot"></span><span>Демо-просмотр</span><small>PREVIEW</small></div>' +
          '<div class="identity-switcher"><label for="role-select">Посмотреть интерфейс роли</label><select id="role-select" data-role-select aria-label="Выбрать демо-роль">' + roleOptions + '</select>' +
          '<div class="switcher-person"><span class="avatar">' + escapeHtml(user.initials) + '</span><span>' + escapeHtml(user.name) + '</span></div></div>' +
        '</aside>' +
        '<div class="sidebar-backdrop' + (state.mobileNav ? " visible" : "") + '" data-close-menu></div>' +
        '<div class="main-column">' +
          '<header class="topbar">' +
            '<button class="menu-toggle" type="button" aria-label="Открыть меню" data-toggle-menu>' + icon(state.mobileNav ? "close" : "menu") + '</button>' +
            '<div class="breadcrumbs"><span>' + user.label + '</span><span>›</span><strong>' + title + '</strong></div>' +
            '<div class="topbar-actions"><span class="preview-chip"><span></span>ДЕМО-СРЕДА · БЕЗ СОХРАНЕНИЯ</span>' +
            '<div class="identity-chip"><span class="avatar">' + escapeHtml(user.initials) + '</span><span class="identity-copy"><strong>' + escapeHtml(user.name) + '</strong><small>' + escapeHtml(user.company) + '</small></span></div>' +
            '</div>' +
          '</header>' +
          '<main class="main-content"><div class="page-stack">' +
            '<div class="preview-notice">' + icon("eye") + '<span><strong>Предварительный просмотр.</strong> Показаны вымышленные примеры. Формы и действия не отправляют данные и ничего не сохраняют.</span></div>' +
            pageHeading(state.screen, role) + viewContent() +
            '<footer class="footer-note">LogSklad · демонстрационный интерфейс для ознакомления. Данные в этом просмотре не связаны с реальными заявками и базой.</footer>' +
          '</div></main>' +
        '</div>' +
        '<div class="toast" id="toast" role="status" aria-live="polite"></div>' +
      '</div>';
    document.title = "LogSklad — " + (title || "просмотр платформы");
  }
  function navigate(screen, orderId, role) {
    if (role && roles[role]) state.role = role;
    state.screen = screen || "overview";
    state.orderId = orderId || "";
    state.mobileNav = false;
    state.filter = "all";
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
    syncUrl(false);
  }

  function showToast(message) {
    const toast = document.getElementById("toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { toast.classList.remove("visible"); }, 3200);
  }

  function saveFormValues() {
    const form = document.querySelector("[data-wizard-form]");
    if (!form) return;
    ["cargo", "weight", "pickup", "destination", "date"].forEach(function (name) {
      const field = form.elements.namedItem(name);
      if (field) state.form[name] = field.value;
    });
  }

  app.addEventListener("click", function (event) {
    const nav = event.target.closest("[data-nav]");
    if (nav) {
      event.preventDefault();
      const roleLink = nav.getAttribute("data-role-link");
      const targetScreen = nav.getAttribute("data-nav");
      navigate(targetScreen, "", roleLink || "");
      return;
    }
    const row = event.target.closest("[data-open-order]");
    if (row) {
      navigate("order-detail", row.getAttribute("data-open-order"));
      return;
    }
    if (event.target.closest("[data-toggle-menu]")) {
      state.mobileNav = !state.mobileNav;
      render();
      return;
    }
    if (event.target.closest("[data-close-menu]")) {
      state.mobileNav = false;
      render();
      return;
    }
    const toastButton = event.target.closest("[data-toast]");
    if (toastButton) {
      showToast(toastButton.getAttribute("data-toast"));
      return;
    }
    const filter = event.target.closest("[data-filter]");
    if (filter) {
      state.filter = filter.getAttribute("data-filter");
      app.querySelectorAll("[data-filter]").forEach(function (button) { button.classList.toggle("active", button === filter); });
      applyFilters();
      return;
    }
    if (event.target.closest("[data-wizard-back]")) {
      saveFormValues();
      state.wizardStep = Math.max(1, state.wizardStep - 1);
      render();
      return;
    }
  });

  app.addEventListener("change", function (event) {
    if (event.target.matches("[data-role-select]")) {
      navigate("overview", "", event.target.value);
    }
  });

  app.addEventListener("input", function (event) {
    if (event.target.matches("[data-search]")) applyFilters();
    if (event.target.name && Object.prototype.hasOwnProperty.call(state.form, event.target.name)) state.form[event.target.name] = event.target.value;
  });

  app.addEventListener("submit", function (event) {
    if (!event.target.matches("[data-wizard-form]")) return;
    event.preventDefault();
    saveFormValues();
    if (state.wizardStep < 3) {
      state.wizardStep += 1;
      render();
      return;
    }
    showToast("Демо-просмотр: заявка не отправлена и не сохранена.");
  });

  app.addEventListener("keydown", function (event) {
    const row = event.target.closest && event.target.closest("[data-open-order]");
    if (row && (event.key === "Enter" || event.key === " ")) {
      event.preventDefault();
      navigate("order-detail", row.getAttribute("data-open-order"));
    }
  });

  function applyFilters() {
    const search = app.querySelector("[data-search]");
    const query = search ? search.value.trim().toLocaleLowerCase("ru") : "";
    const filter = state.filter;
    app.querySelectorAll("[data-list-table] tbody tr[data-open-order]").forEach(function (row) {
      const order = orders.find(function (item) { return item.id === row.getAttribute("data-open-order"); });
      if (!order) return;
      const haystack = [order.number, order.title, order.route, statusMap[order.status][0]].join(" ").toLocaleLowerCase("ru");
      const matchesSearch = !query || haystack.includes(query);
      const matchesFilter = filter === "all" || (filter === "attention" ? order.status === "ISSUE" : !["COMPLETED", "DELIVERED", "CANCELLED"].includes(order.status));
      row.hidden = !(matchesSearch && matchesFilter);
    });
  }

  window.addEventListener("popstate", function () {
    const params = new URLSearchParams(window.location.search);
    state.role = roles[params.get("role")] ? params.get("role") : "client";
    state.screen = params.get("screen") || "overview";
    state.orderId = params.get("order") || "";
    state.mobileNav = false;
    render();
  });

  const initial = new URLSearchParams(window.location.search);
  state.role = roles[initial.get("role")] ? initial.get("role") : "client";
  state.screen = initial.get("screen") || "overview";
  state.orderId = initial.get("order") || "";
  syncUrl(true);
  render();
})();
