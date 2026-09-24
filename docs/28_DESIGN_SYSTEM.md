# 28 — DESIGN SYSTEM

## 1. Цель

Зафиксировать базовые design tokens.

Все значения могут быть слегка уточнены после первого визуального pass, но Codex не должен создавать альтернативную палитру или spacing system без причины.

---

# 2. Colors

## Canvas

```text
bg.canvas        #0B0C10
bg.sidebar       #101116
bg.surface.1     #14161B
bg.surface.2     #1A1D23
bg.surface.3     #22252D
bg.elevated      #252932
```

---

## 3. Borders

```text
border.subtle    rgba(255,255,255,0.07)
border.default   rgba(255,255,255,0.11)
border.strong    rgba(255,255,255,0.17)
```

---

## 4. Text

```text
text.primary     #FAFBFD
text.secondary   #B9C0CB
text.tertiary    #929BA9
text.disabled    #707987
text.inverse     #111216
```

---

## 5. Primary Accent

```text
accent.primary        #FF6A1A
accent.hover          #FF7A2E
accent.pressed        #E95B0C
accent.soft           rgba(255,106,26,0.14)
accent.soft.hover     rgba(255,106,26,0.20)
accent.border         rgba(255,106,26,0.36)
```

---

## 6. Semantic

```text
success.primary   #35D58A
success.soft      rgba(53,213,138,0.14)

warning.primary   #F4B740
warning.soft      rgba(244,183,64,0.14)

danger.primary    #FF5159
danger.soft       rgba(255,81,89,0.14)

info.primary      #54C4FF
info.soft         rgba(84,196,255,0.14)
```

---

## 7. Map / Operational Secondary

```text
location.cyan     #50CEF5
tracking.blue     #63A0FF
```

Использовать очень дозированно.

---

# 8. Typography

Primary:
```text
Geist
```

Fallback:
```text
Inter, system-ui, sans-serif
```

Не использовать больше одного основного UI font.

---

## 9. Type Scale

### Display / large metric
```text
36 / 44
font-weight: 600
```

### H1
```text
32 / 40
600
```

### H2
```text
24 / 32
600
```

### H3
```text
20 / 28
600
```

### Body L
```text
17 / 25
400–500
```

### Body M
```text
15 / 23
400–500
```

### Body S
```text
14 / 21
400–500
```

### Caption
```text
13 / 19
400–500
```

### Minimum text size
```text
13px for every visible label, caption, badge, and metadata value
```

Не уменьшать текст ниже 13px. Плотность интерфейса регулировать отступами, строками и группировкой.

---

## 10. Font weights

```text
Regular   400
Medium    500
Semibold  600
```

700 использовать редко.

---

# 11. Spacing

4px grid.

```text
space.1   4
space.2   8
space.3   12
space.4   16
space.5   20
space.6   24
space.8   32
space.10  40
space.12  48
space.16  64
```

---

# 12. Radius

```text
radius.sm     8
radius.md     10
radius.lg     14
radius.xl     18
radius.full   999
```

---

# 13. Heights

Buttons:
```text
sm  32
md  40
lg  48
```

Inputs:
```text
desktop default 40
mobile primary  44–48
```

Icon buttons:
```text
32 / 36 / 40 / 44
```

---

# 14. Shadows

### Floating
```text
0 12px 32px rgba(0,0,0,0.32)
```

### Modal
```text
0 24px 64px rgba(0,0,0,0.48)
```

### Accent glow
Только selected / key CTA:
```text
0 0 28px rgba(255,106,26,0.18)
```

Дополнительные состояния:
```text
glow.success  0 0 22px rgba(53,213,138,0.14)
glow.info     0 0 24px rgba(84,196,255,0.14)
surface.line  inset 0 1px rgba(255,255,255,0.05)
```

Glow применять только к выбранному состоянию, primary CTA, фокусу, текущей точке маршрута или критичному сигналу. Не делать glow default state.

---

# 15. Blur

Backdrop blur:
- 12–20px только floating surfaces;
- не применять ко всему интерфейсу.

Main cards:
- opaque / near-opaque.

---

# 16. Layout Grid

## Desktop
Max content width:
```text
1440–1600px
```

Main padding:
```text
36–40px desktop
18–24px mobile
```

Gutter:
```text
16–24px
```

## Tablet
Padding:
```text
20–24px
```

## Mobile
Padding:
```text
16px
```

---

# 17. Sidebar

Desktop widths:

```text
Collapsed rail: 64–72px
Expanded:       224–248px
```

Manager/Admin могут использовать expanded sidebar.
Narrow screens — drawer.

---

# 18. Status token mapping

Пример:

```text
DRAFT                 neutral
SUBMITTED             info
REVIEW                info
CONFIRMED             accent
DRIVER_ASSIGNED       accent
PICKUP_IN_PROGRESS    warning
PICKED_UP             info
AT_WAREHOUSE          info
WAREHOUSE_PROCESSING  warning
READY_FOR_DELIVERY    accent
DELIVERY_IN_PROGRESS  warning
DELIVERED             success
COMPLETED             success
ON_HOLD               warning
ISSUE                 danger
CANCELLED             neutral
```

Не создавать уникальный цвет для каждого статуса.

---

# 19. Iconography

Основная библиотека:
```text
Lucide
```

Правила:
- 16px внутри compact controls;
- 18–20px standard;
- 22–24px feature icon.

Stroke:
- default library stroke;
- визуально единообразно.

Не смешивать outline + filled packs случайно.

---

# 20. CSS variable direction

Рекомендуется определить CSS variables:

```css
:root {
  --bg-canvas: #0B0C10;
  --bg-sidebar: #101116;
  --bg-surface-1: #14161B;
  --bg-surface-2: #1A1D23;
  --bg-surface-3: #22252D;
  --bg-elevated: #252932;

  --text-primary: #FAFBFD;
  --text-secondary: #B9C0CB;
  --text-tertiary: #929BA9;

  --border-default: rgba(255,255,255,.11);

  --accent: #FF6A1A;
  --success: #35D58A;
  --warning: #F4B740;
  --danger: #FF5159;
  --info: #54C4FF;

  --type-caption: 13px;
  --type-body-small: 14px;
  --type-body: 15px;
  --type-body-large: 17px;
  --space-page: 40px;
  --space-section: 24px;
  --space-panel: 24px;
  --glow-accent: 0 0 28px rgba(255,106,26,.18);
  --glow-success: 0 0 22px rgba(53,213,138,.14);
  --glow-info: 0 0 24px rgba(84,196,255,.14);
}
```

---

# 21. Light theme

Demo MVP:
- dark theme first;
- light theme не обязателен.

Не тратить scope на две темы, если клиент не требует.
Архитектура токенов должна позволять добавить light theme позже.

---

# 22. Accessibility

Цвет не является единственным способом передать состояние.

Обязательно:
- текст статуса;
- icon/dot;
- focus state;
- keyboard-visible outline;
- readable contrast;
- видимый текст не меньше 13px.

---

# 23. Density modes

Не строить пользовательский переключатель density в MVP.

Но компоненты должны поддерживать:
- `compact`
- `default`
- `comfortable`

где это полезно для:
- tables;
- list rows;
- form rows.

Manager/Admin:
`compact/default`.

Driver:
`comfortable`.
