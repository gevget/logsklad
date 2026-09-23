# 28 — DESIGN SYSTEM

## 1. Цель

Зафиксировать базовые design tokens.

Все значения могут быть слегка уточнены после первого визуального pass, но Codex не должен создавать альтернативную палитру или spacing system без причины.

---

# 2. Colors

## Canvas

```text
bg.canvas        #0B0B0D
bg.sidebar       #0E0F12
bg.surface.1     #121318
bg.surface.2     #17181E
bg.surface.3     #1D1F26
bg.elevated      #202229
```

---

## 3. Borders

```text
border.subtle    rgba(255,255,255,0.06)
border.default   rgba(255,255,255,0.09)
border.strong    rgba(255,255,255,0.14)
```

---

## 4. Text

```text
text.primary     #F5F6F8
text.secondary   #A8ADB7
text.tertiary    #737A87
text.disabled    #545A65
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
success.primary   #2CCB7F
success.soft      rgba(44,203,127,0.14)

warning.primary   #F4B740
warning.soft      rgba(244,183,64,0.14)

danger.primary    #FF5159
danger.soft       rgba(255,81,89,0.14)

info.primary      #45B8FF
info.soft         rgba(69,184,255,0.14)
```

---

## 7. Map / Operational Secondary

```text
location.cyan     #35C2F4
tracking.blue     #4D8CFF
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
32 / 38
font-weight: 600
```

### H1
```text
28 / 34
600
```

### H2
```text
22 / 28
600
```

### H3
```text
18 / 24
600
```

### Body L
```text
16 / 24
400–500
```

### Body M
```text
14 / 20
400–500
```

### Body S
```text
13 / 18
400–500
```

### Caption
```text
12 / 16
400–500
```

### Micro
```text
11 / 14
500
```

Micro не использовать для основной информации.

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
0 0 24px rgba(255,106,26,0.12)
```

Не делать glow default state.

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
24–32px
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
  --bg-canvas: #0B0B0D;
  --bg-surface-1: #121318;
  --bg-surface-2: #17181E;
  --bg-surface-3: #1D1F26;

  --text-primary: #F5F6F8;
  --text-secondary: #A8ADB7;
  --text-tertiary: #737A87;

  --border-default: rgba(255,255,255,.09);

  --accent: #FF6A1A;
  --success: #2CCB7F;
  --warning: #F4B740;
  --danger: #FF5159;
  --info: #45B8FF;
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
- readable contrast.

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
