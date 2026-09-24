/* eslint-disable @next/next/no-html-link-for-pages -- /demo is a cookie-setting GET route, so these links intentionally perform a full navigation. */
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight, ArrowUpRight, Boxes, Building2, Check, ClipboardCheck, FileCheck2,
  GitBranch, MapPinned, PackageCheck, ShieldCheck, Truck, UsersRound, Warehouse,
  Waypoints, Workflow,
} from "lucide-react";
import styles from "./landing.module.css";

export const metadata: Metadata = {
  title: "LogSklad — логистика и склад в одном процессе",
  description: "Российская платформа для управления заявками, перевозками и складскими операциями. Посмотрите демо LogSklad глазами пяти ролей.",
  openGraph: {
    title: "LogSklad — логистика и склад в одном процессе",
    description: "Заявки, перевозки, склад и документы связаны в едином операционном процессе.",
    locale: "ru_RU",
    type: "website",
  },
};

const tones = {
  orange: styles.toneOrange,
  cyan: styles.toneCyan,
  blue: styles.toneBlue,
  green: styles.toneGreen,
} as const;

const features = [
  { Icon: ClipboardCheck, tone: tones.orange, number: "01", tag: "ЕДИНЫЙ ЖИЗНЕННЫЙ ЦИКЛ", title: "Заявки и статусы", text: "Создание, проверка менеджером и общая история — от первого запроса до результата." },
  { Icon: Waypoints, tone: tones.blue, number: "02", tag: "УПРАВЛЕНИЕ РЕЙСОМ", title: "Маршрут и перевозка", text: "Точки забора, водитель и транспорт рядом с данными о грузе и текущим статусом." },
  { Icon: Warehouse, tone: tones.green, number: "03", tag: "СКЛАДСКОЙ КОНТУР", title: "Складские операции", text: "Приёмка, вес и количество мест, фото груза, обработка и выдача связаны с заявкой." },
  { Icon: FileCheck2, tone: tones.cyan, number: "04", tag: "ОБЩАЯ КАРТОЧКА", title: "Документы и история", text: "Файлы, комментарии, уведомления и события доступны в контексте одной операции." },
];

const roles = [
  { Icon: Building2, tone: tones.orange, label: "КЛИЕНТСКИЙ КАБИНЕТ", title: "Заказчик", text: "Создаёт заявки, следит за статусами своей компании, видит согласованную стоимость и документы.", result: "Понимает, где груз и какой этап следующий." },
  { Icon: Workflow, tone: tones.cyan, label: "УПРАВЛЕНИЕ ПРОЦЕССОМ", title: "Менеджер", text: "Проверяет данные, рассчитывает стоимость, назначает водителя и транспорт, решает вопросы.", result: "Ведёт заявку от запроса до завершения." },
  { Icon: Truck, tone: tones.blue, label: "МОБИЛЬНАЯ РАБОТА", title: "Водитель", text: "Получает свои задания и точки маршрута, обновляет статусы, добавляет фото и подтверждения.", result: "Фиксирует выполнение по ходу рейса." },
  { Icon: Boxes, tone: tones.green, label: "ПРИЁМКА И ОБРАБОТКА", title: "Склад", text: "Видит ожидаемые грузы, сверяет вес и количество, отмечает операции и готовность к выдаче.", result: "Работает с фактом, а не только с планом." },
  { Icon: ShieldCheck, tone: tones.orange, label: "НАСТРОЙКА СРЕДЫ", title: "Администратор", text: "Управляет пользователями, компаниями, услугами, транспортом и журналом действий.", result: "Поддерживает порядок в доступах и справочниках." },
];

const steps: readonly [string, string, string][] = [
  ["01", "Заявка", "Груз, услуга и точки"],
  ["02", "Планирование", "Проверка и назначение"],
  ["03", "Перевозка", "Задание и события рейса"],
  ["04", "Склад", "Приёмка и операции"],
  ["05", "Результат", "Статус и документы"],
];

const roadmap = [
  { Icon: GitBranch, title: "Интеграции с учётными системами", text: "Связь с 1С, ЭДО и корпоративными сервисами по приоритетам пилотных компаний." },
  { Icon: MapPinned, title: "Сопровождение рейсов", text: "Трекинг маршрутов, геособытия и дополнительные инструменты работы водителя." },
  { Icon: PackageCheck, title: "Развитие WMS-контура", text: "Адресное хранение, штрихкоды и более детальный контроль складских операций." },
  { Icon: UsersRound, title: "Аналитика и тарифы", text: "Отчёты по процессам, настраиваемые тарифы и финансовые интеграции." },
];

function Brand() {
  return (
    <Link className={styles.brand} href="/" aria-label="LogSklad — главная">
      <span className={styles.brandMark} aria-hidden="true"><i /><i /><i /></span>
      <span className={styles.brandName}><strong>LOGSKLAD</strong><small>ЛОГИСТИКА · СКЛАД</small></span>
    </Link>
  );
}

function DemoButton() {
  return <a className={[styles.button, styles.buttonPrimary].join(" ")} href="/demo">Открыть демо <ArrowUpRight size={17} /></a>;
}

function ProductPreview() {
  return (
    <div className={styles.previewStage} aria-label="Схема карточки логистической заявки">
      <div className={styles.previewGlow} />
      <div className={styles.previewFrame}>
        <div className={styles.previewTopbar}>
          <div className={styles.previewBrand}><span>L</span> LOGSKLAD</div>
          <span className={styles.previewEnvironment}>ЕДИНЫЙ ОПЕРАЦИОННЫЙ КОНТУР</span>
          <span className={styles.previewAvatar}>АМ</span>
        </div>
        <div className={styles.previewBody}>
          <div className={styles.previewHeading}>
            <div><span className={styles.previewEyebrow}>КАРТОЧКА ЗАЯВКИ</span><h2>Москва <i>→</i> Казань</h2><p>Забор груза · складская обработка · доставка</p></div>
            <span className={styles.liveStatus}><i /> В РАБОТЕ</span>
          </div>
          <div className={styles.previewDetails}>
            <div className={styles.routePanel}>
              <div className={styles.panelLabel}><span>МАРШРУТ ЗАЯВКИ</span><span>2 ТОЧКИ</span></div>
              <div className={styles.routeCanvas}>
                <div className={styles.routeGrid} />
                <svg viewBox="0 0 460 190" role="presentation" aria-hidden="true">
                  <path className={styles.routeBase} d="M42 137 C111 126 115 61 187 70 S281 141 331 105 S379 46 422 55" />
                  <path className={styles.routeActive} d="M42 137 C111 126 115 61 187 70 S281 141 331 105" />
                  <path className={styles.routeDash} d="M331 105 C379 76 379 46 422 55" />
                  <circle className={styles.routeStop} cx="42" cy="137" r="7" /><circle className={styles.routeHalo} cx="331" cy="105" r="15" />
                  <circle className={styles.routeCurrent} cx="331" cy="105" r="7" /><circle className={styles.routeEnd} cx="422" cy="55" r="7" />
                </svg>
                <span className={[styles.routeLabel, styles.routeOrigin].join(" ")}>ОТПРАВЛЕНИЕ</span>
                <span className={[styles.routeLabel, styles.routeNow].join(" ")}>ТЕКУЩИЙ ЭТАП</span>
                <span className={[styles.routeLabel, styles.routeDestination].join(" ")}>ДОСТАВКА</span>
                <div className={styles.mapLegend}><i /> Единая история маршрута</div>
              </div>
            </div>
            <div className={styles.activityPanel}>
              <div className={styles.panelLabel}>ИСТОРИЯ ЗАЯВКИ</div>
              <ol className={styles.activityList}>
                <li className={styles.activityDone}><span><Check size={12} /></span><div><strong>Заявка создана</strong><small>Данные и документы добавлены</small></div></li>
                <li className={styles.activityDone}><span><Check size={12} /></span><div><strong>Водитель назначен</strong><small>Задание передано в работу</small></div></li>
                <li className={styles.activityNow}><span><i /></span><div><strong>Груз на складе</strong><small>Идёт обработка поступления</small></div></li>
                <li className={styles.activityNext}><span /><div><strong>Следующий этап</strong><small>Подготовка к доставке</small></div></li>
              </ol>
            </div>
          </div>
          <div className={styles.previewFooter}><span><i className={styles.dotOrange} /> Одна заявка</span><span><i className={styles.dotBlue} /> Несколько ролей</span><span><i className={styles.dotGreen} /> Общая история</span></div>
        </div>
      </div>
      <div className={[styles.floatingChip, styles.chipTop].join(" ")}><span className={styles.chipOrange}><Workflow size={17} /></span><span><strong>Один процесс</strong><small>от запроса до результата</small></span></div>
      <div className={[styles.floatingChip, styles.chipBottom].join(" ")}><span className={styles.chipGreen}><Check size={17} /></span><span><strong>Статус прозрачен</strong><small>каждому участнику</small></span></div>
    </div>
  );
}

export default function LandingPage() {
  return (
    <main className={styles.landing} id="top">
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Brand />
          <nav className={styles.navigation} aria-label="Навигация по странице"><a href="#platform">Платформа</a><a href="#roles">Роли</a><a href="#process">Процесс</a><a href="#roadmap">Развитие</a></nav>
          <a className={styles.headerDemo} href="/demo">Демо <ArrowUpRight size={16} /></a>
        </div>
      </header>

      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroAtmosphere} />
        <div className={[styles.container, styles.heroGrid].join(" ")}>
          <div className={styles.heroCopy}>
            <div className={styles.eyebrow}><span /> B2B-ПЛАТФОРМА ДЛЯ ЛОГИСТИКИ И СКЛАДА</div>
            <h1 id="hero-title">Логистика<br />без <em>слепых зон.</em></h1>
            <p className={styles.heroLead}>Заявки, перевозки и складские операции связаны в один процесс. Клиент, логист, водитель и склад видят свою часть общей картины.</p>
            <div className={styles.heroActions}><DemoButton /><a className={styles.heroTextLink} href="#platform">Как это работает <ArrowRight size={16} /></a></div>
            <div className={styles.heroProof}><span><i className={styles.proofOrange} />Российская разработка</span><span><i className={styles.proofBlue} />5 ролей в одном контуре</span><span><i className={styles.proofGreen} />Демо уже доступно</span></div>
          </div>
          <ProductPreview />
        </div>
        <div className={styles.heroRule} />
      </section>

      <section className={styles.signalBar} aria-label="Ключевые принципы платформы">
        <div className={[styles.container, styles.signalInner].join(" ")}>
          <div><span className={styles.signalNumber}>01</span><strong>Единая заявка</strong><small>центр каждого процесса</small></div>
          <div><span className={styles.signalNumber}>05</span><strong>Ролей</strong><small>разные задачи и доступы</small></div>
          <div><span className={styles.signalNumber}><Waypoints size={23} /></span><strong>Сквозной путь</strong><small>от клиента до склада</small></div>
          <div><span className={styles.countryMark}>RU</span><strong>Создано в России</strong><small>развиваем свой продукт</small></div>
        </div>
      </section>

      <section className={styles.photoStory} aria-labelledby="photo-story-title">
        <div className={styles.container}>
          <div className={styles.photoStoryIntro}>
            <div className={styles.photoStoryHeading}>
              <div className={styles.sectionEyebrow}>ЛЮДИ · ГРУЗЫ · МАРШРУТЫ</div>
              <h2 id="photo-story-title">За каждым статусом —<br /><em>реальная работа.</em></h2>
            </div>
            <p>За перевозкой стоят люди, складские смены и десятки точных передач груза. LogSklad связывает их в один понятный процесс.</p>
          </div>
          <div className={styles.photoStoryGrid}>
            <article className={styles.photoCard}>
              <div className={styles.photoFrame}>
                <Image className={styles.photoImage} src="/landing/hub-manager-truck.webp" alt="Менеджер логистики на площадке распределительного центра рядом с грузовым автомобилем и подготовленным грузом" fill sizes="(max-width: 680px) 100vw, (max-width: 900px) 50vw, 34vw" />
                <div className={styles.photoShade} />
                <div className={styles.photoCaption}><span>01 / ПЕРЕВОЗКА</span><h3>Каждый рейс — в общей картине</h3></div>
              </div>
            </article>
            <article className={styles.photoCard}>
              <div className={styles.photoFrame}>
                <Image className={styles.photoImage} src="/landing/warehouse-operations.webp" alt="Сотрудница склада сканирует подготовленные к отгрузке коробки" fill sizes="(max-width: 680px) 100vw, (max-width: 900px) 50vw, 34vw" />
                <div className={styles.photoShade} />
                <div className={styles.photoCaption}><span>02 / СКЛАД</span><h3>Приёмка начинается с точных данных</h3></div>
              </div>
            </article>
            <article className={styles.photoCard}>
              <div className={styles.photoFrame}>
                <Image className={styles.photoImage} src="/landing/dispatch-team.webp" alt="Диспетчер и водитель сверяют сведения о грузе у открытого грузового автомобиля" fill sizes="(max-width: 680px) 100vw, (max-width: 900px) 50vw, 34vw" />
                <div className={styles.photoShade} />
                <div className={styles.photoCaption}><span>03 / КОМАНДА</span><h3>Передача груза без потери контекста</h3></div>
              </div>
            </article>
          </div>
        </div>
      </section>
      <section className={styles.section} id="platform" aria-labelledby="platform-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><div className={styles.sectionEyebrow}>ЗАЧЕМ НУЖНА ПЛАТФОРМА</div><h2 id="platform-title">Когда процесс живёт<br />в разных местах — теряется контроль.</h2></div><p>Чаты, таблицы, документы и складские отметки часто рассказывают о разных частях одной перевозки. LogSklad собирает работу вокруг общей заявки.</p></div>
          <div className={styles.problemGrid}>
            <article className={styles.problemCard}><span className={styles.cardIndex}>РАЗРЫВ 01</span><span className={[styles.problemIcon, styles.toneOrange].join(" ")}><Workflow size={21} /></span><h3>Статус выясняют вручную</h3><p>Чтобы понять, где груз и что делать дальше, приходится собирать ответы у нескольких участников.</p><div className={styles.problemFoot}><i />Время уходит на уточнения</div></article>
            <article className={styles.problemCard}><span className={styles.cardIndex}>РАЗРЫВ 02</span><span className={[styles.problemIcon, styles.toneCyan].join(" ")}><FileCheck2 size={21} /></span><h3>Контекст распадается</h3><p>Файлы, комментарии и договорённости оказываются в переписках и не видны следующей роли.</p><div className={styles.problemFoot}><i />Данные приходится дублировать</div></article>
            <article className={styles.problemCard}><span className={styles.cardIndex}>РАЗРЫВ 03</span><span className={[styles.problemIcon, styles.toneGreen].join(" ")}><Warehouse size={21} /></span><h3>Склад выпадает из цепочки</h3><p>Фактическая приёмка, обработка и готовность к выдаче становятся отдельным ручным процессом.</p><div className={styles.problemFoot}><i />Сложнее увидеть следующий шаг</div></article>
          </div>
          <div className={styles.solutionBand}><span className={styles.solutionGlyph}><GitBranch size={19} /></span><p><strong>LogSklad объединяет этапы вокруг одной заявки.</strong> У каждой роли своё рабочее место, а история процесса остаётся общей.</p><a href="#roles">Кому помогает <ArrowRight size={15} /></a></div>
        </div>
      </section>

      <section className={[styles.section, styles.featureSection].join(" ")} aria-labelledby="features-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><div className={styles.sectionEyebrow}>ОПЕРАЦИОННЫЙ КОНТУР</div><h2 id="features-title">Все важное —<br />в контексте одной заявки.</h2></div><p>Не отдельный трекер и не набор разрозненных кабинетов. Общая сущность связывает маршрут, склад, людей и документы.</p></div>
          <div className={styles.featureGrid}>{features.map((feature) => { const Icon = feature.Icon; return <article className={styles.featureCard} key={feature.number}><div className={styles.featureTop}><span className={[styles.featureIcon, feature.tone].join(" ")}><Icon size={22} strokeWidth={1.8} /></span><span className={styles.featureNumber}>{feature.number}</span></div><span className={styles.featureTag}>{feature.tag}</span><h3>{feature.title}</h3><p>{feature.text}</p><span className={styles.featureLine} /></article>; })}</div>
        </div>
      </section>

      <section className={[styles.section, styles.rolesSection].join(" ")} id="roles" aria-labelledby="roles-title">
        <div className={styles.container}>
          <div className={styles.sectionHeading}><div><div className={styles.sectionEyebrow}>ОДНА СИСТЕМА · ПЯТЬ РОЛЕЙ</div><h2 id="roles-title">Каждому — свой обзор.<br />Команде — общий процесс.</h2></div><p>Права и интерфейс учитывают работу человека: заказчик не видит внутренние данные, водитель — только свои задания, склад — свои операции.</p></div>
          <div className={styles.rolesGrid}>{roles.map((role, index) => { const Icon = role.Icon; return <article className={styles.roleCard} key={role.title}><div className={styles.roleTop}><span className={[styles.roleIcon, role.tone].join(" ")}><Icon size={22} strokeWidth={1.8} /></span><span className={styles.roleNumber}>0{index + 1}</span></div><span className={styles.roleLabel}>{role.label}</span><h3>{role.title}</h3><p>{role.text}</p><div className={styles.roleOutcome}><Check size={15} /><span>{role.result}</span></div></article>; })}</div>
          <div className={styles.rolesDemo}><div className={styles.roleAvatars} aria-hidden="true"><span>З</span><span>М</span><span>В</span><span>С</span><span>А</span></div><p><strong>Посмотрите один процесс глазами разных участников.</strong> В демо можно переключить роль в нижней части кабинета.</p><a href="/demo">Перейти в демо <ArrowUpRight size={16} /></a></div>
        </div>
      </section>

      <section className={[styles.section, styles.processSection].join(" ")} id="process" aria-labelledby="process-title">
        <div className={styles.container}>
          <div className={styles.processHeader}><div><div className={styles.sectionEyebrow}>СКВОЗНОЙ СЦЕНАРИЙ</div><h2 id="process-title">От первого запроса<br />до результата.</h2></div><p>Конкретные шаги зависят от типа заявки. Перевозка и складские услуги проходят в одном понятном потоке.</p></div>
          <div className={styles.processTrack}><div className={styles.processRail} aria-hidden="true" />{steps.map(([number, title, text], index) => <article className={styles.processStep} key={number}><span className={[styles.processNode, index === 2 ? styles.processNodeActive : ""].join(" ")}>{index === 2 ? <i /> : number}</span><span className={styles.processNumber}>{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className={styles.processNote}><span><ArrowRight size={16} /></span><p><strong>Если появляется исключение, оно не теряется.</strong> Менеджер может уточнить детали и продолжить работу с той же заявкой.</p></div>
        </div>
      </section>

      <section className={[styles.section, styles.visionSection].join(" ")} id="roadmap" aria-labelledby="roadmap-title">
        <div className={styles.container}>
          <div className={styles.visionGrid}>
            <div className={styles.visionCopy}><div className={styles.sectionEyebrow}>НАША РАЗРАБОТКА · НАШЕ НАПРАВЛЕНИЕ</div><h2 id="roadmap-title">Российский продукт<br />с потенциалом роста.</h2><p>LogSklad — собственная российская разработка для логистических компаний и их партнёров. Мы строим платформу как B2B SaaS: единый рабочий контур можно расширять вместе с процессами компании.</p><div className={styles.visionCallout}><span><Check size={17} /></span><div><strong>Что уже показывает демо</strong><small>Сценарий заявки, пять ролевых кабинетов, перевозка, приёмка груза и общая история.</small></div></div><div className={styles.saasLine}><i /><p><strong>Модель продукта:</strong> подписка для команды и процессов; состав модулей и условия уточняются с первыми партнёрами.</p></div></div>
            <div className={styles.roadmapPanel}><div className={styles.roadmapHeader}><div><span>СЛЕДУЮЩИЕ НАПРАВЛЕНИЯ</span><h3>Платформа растёт вместе с бизнесом</h3></div><span className={styles.roadmapBadge}>ROADMAP</span></div><div className={styles.roadmapList}>{roadmap.map((item, index) => { const Icon = item.Icon; return <article className={styles.roadmapItem} key={item.title}><span className={[styles.roadmapIcon, index % 2 ? styles.toneGreen : styles.toneCyan].join(" ")}><Icon size={19} /></span><div><h4>{item.title}</h4><p>{item.text}</p></div><ArrowUpRight className={styles.roadmapArrow} size={16} /></article>; })}</div><p className={styles.roadmapFootnote}>Это возможные направления развития, а не функции текущего MVP.</p></div>
          </div>
          <div className={styles.partnerStrip}><span className={styles.partnerIcon}><UsersRound size={20} /></span><div><strong>Для партнёров и пилотных компаний</strong><p>Можно начать с одного процесса и вместе определить, какие интеграции и модули дадут команде наибольшую пользу.</p></div><DemoButton /></div>
        </div>
      </section>

      <section className={styles.finalSection}>
        <div className={[styles.container, styles.finalCard].join(" ")}><div className={styles.finalGlow} /><div className={styles.finalCopy}><span className={styles.sectionEyebrow}>ПОСМОТРИТЕ НА ПРОЦЕСС ИЗНУТРИ</span><h2>Одна заявка.<br /><em>Пять перспектив.</em></h2><p>Откройте кабинет заказчика, пройдите демо и переключите роль — так проще всего увидеть, как LogSklad связывает команду.</p></div><div className={styles.finalAction}><DemoButton /><span><i />Демо откроется в кабинете заказчика</span></div><div className={styles.finalOrbit} aria-hidden="true"><i /><i /><i /><i /><i /></div></div>
      </section>

      <footer className={styles.footer}><div className={[styles.container, styles.footerInner].join(" ")}><Brand /><p>Российская платформа для управления логистикой и складом.</p><a href="#top">Наверх <ArrowUpRight size={15} /></a><a className={styles.footerCredit} href="https://tolk-usite.com/" target="_blank" rel="noopener noreferrer">Сделано ТОЛК+ЮСТ <ArrowUpRight size={14} /></a><span>© LogSklad · 2026</span></div></footer>
    </main>
  );
}