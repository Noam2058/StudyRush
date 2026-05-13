# StudyRush — Design System

**Version:** 1.0
**Last Updated:** April 2026
**Direction:** RTL (Hebrew primary), LTR (English secondary)

---

## Brand Identity

**App Name:** StudyRush
**Tagline:** הפוך את הלמידה שלך למשחק (Turn your learning into a game)
**Personality:** Professional yet energetic, academic with a competitive edge — Notion-meets-Duolingo for students.

**Logo Concept:** A navy square containing a gold lightning bolt — symbolizing knowledge (the container) struck by energy and momentum (the lightning).

---

## Color Palette

### Brand Colors

| Token | Hex | RGB | Usage |
|---|---|---|---|
| `--color-primary` | `#0E3E5C` | rgb(14, 62, 92) | Headings, primary text, primary buttons, navigation bar, logo background |
| `--color-action` | `#4A96D9` | rgb(74, 150, 217) | Progress bars, active icons, secondary accents, success accents |
| `--color-energy` | `#D95A11` | rgb(217, 90, 17) | Main CTA buttons (Upload), error indicators, attention-grabbing actions |
| `--color-achievement` | `#9E8F37` | rgb(158, 143, 55) | XP badges, streaks, achievements, medal-like elements |

### Neutral Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-bg` | `#FFFFFF` | Main background |
| `--color-surface` | `#F5F6F8` | Cards, input fields, secondary surfaces |
| `--color-border` | `#E5E7EB` | Dividers, input borders, subtle separations |

### Semantic Colors

| Token | Hex | Usage |
|---|---|---|
| `--color-success-bg` | `#EFF7FE` | Success alert background (light blue tint) |
| `--color-success-accent` | `#4A96D9` | Success alert border and icon |
| `--color-error-bg` | `#FDF1EA` | Error alert background (light orange tint) |
| `--color-error-accent` | `#D95A11` | Error alert border, text, and icon |

### Text Colors

| Token | Value | Usage |
|---|---|---|
| `--color-text-primary` | `#0E3E5C` | Main body text, headings |
| `--color-text-secondary` | `rgba(14, 62, 92, 0.7)` | Subtitles, helper text |
| `--color-text-tertiary` | `rgba(14, 62, 92, 0.5)` | Placeholders, disabled text |
| `--color-text-on-primary` | `#FFFFFF` | Text on dark/colored backgrounds |

### Accessibility

- All text/background combinations pass WCAG AA contrast (4.5:1 minimum for body text, 3:1 for large text).
- Primary text on white: 12.6:1 ✅
- Energy CTA (white on `#D95A11`): 4.7:1 ✅
- Action color (white on `#4A96D9`): 3.5:1 — used only for large text and UI elements, not body copy.

---

## Typography

**Font Family:** Heebo (Google Fonts)
**Fallback Stack:** `'Heebo', 'Rubik', system-ui, -apple-system, sans-serif`

**Why Heebo:** Clean, highly readable in Hebrew and English, with excellent weight variations. Works well for both UI and academic content.

### Type Scale

| Style | Size | Weight | Line Height | Use Case |
|---|---|---|---|---|
| Heading 1 | 32px | 700 (Bold) | 1.2 | Page titles, hero text |
| Heading 2 | 24px | 600 (Semibold) | 1.3 | Section titles |
| Heading 3 | 20px | 600 (Semibold) | 1.4 | Card titles, subsections |
| Body | 16px | 400 (Regular) | 1.6 | Paragraphs, default body text |
| Body Small | 14px | 400 (Regular) | 1.5 | Secondary information |
| Caption / Label | 12px | 500 (Medium) | 1.4 | Labels, metadata, captions |
| Button | 16px | 600 (Semibold) | 1 | Button labels |

**Minimum body text size:** 16px (accessibility requirement).

---

## Spacing

**Base Unit:** 8px
**Scale:** 4 / 8 / 12 / 16 / 24 / 32 / 48 / 64 px

### Common Spacing Patterns

| Context | Spacing |
|---|---|
| Inside small components (chips, badges) | 4px / 8px |
| Inside cards and inputs | 16px |
| Between elements in a card | 12px |
| Between cards | 16px |
| Page padding (mobile) | 20px |
| Section spacing | 24px / 32px |
| Major separation | 48px / 64px |

### Border Radius

| Token | Value | Use Case |
|---|---|---|
| `--radius-sm` | 8px | Alerts, small chips |
| `--radius-md` | 12px | Inputs, small cards |
| `--radius-lg` | 16px | Large cards, modals |
| `--radius-pill` | 999px | CTA buttons, status chips |

---

## Components

### Buttons

#### Primary Button
```css
background: #0E3E5C;
color: #FFFFFF;
height: 48px;
padding: 0 24px;
border: none;
border-radius: 999px;
font-weight: 600;
font-size: 16px;
```
- **Hover:** Darken background by 10%
- **Active:** `transform: scale(0.98)`
- **Disabled:** Opacity 0.5

#### CTA Button (Energy)
```css
background: #D95A11;
color: #FFFFFF;
/* Same dimensions as Primary */
```
- Used for the most important action on screen (e.g., "Upload new material")
- One per screen maximum

#### Secondary Button
```css
background: #FFFFFF;
color: #0E3E5C;
border: 1.5px solid #0E3E5C;
border-radius: 999px;
height: 48px;
```

#### Ghost / Text Button
```css
background: transparent;
color: #0E3E5C;
border: none;
```
- **Hover:** Background `#F5F6F8`

### Cards

```css
background: #F5F6F8;  /* or #FFFFFF on a colored page */
border-radius: 16px;
padding: 16px;
border: none;  /* surface variant */
```

**Outlined card variant:**
```css
background: #FFFFFF;
border: 1px solid #E5E7EB;
border-radius: 16px;
padding: 16px;
```

### Input Fields

```css
background: #F5F6F8;
border: 1px solid #E5E7EB;
border-radius: 12px;
height: 48px;
padding: 0 16px;
font-size: 16px;
color: #0E3E5C;
```

- **Focus:** `border: 2px solid #4A96D9` and remove inner padding by 1px to compensate
- **Error:** `border: 2px solid #D95A11`
- **Placeholder color:** `rgba(14, 62, 92, 0.5)`

### Navigation

#### Bottom Navigation (Mobile)
```css
background: #FFFFFF;
border-top: 1px solid #E5E7EB;
height: 64px;
```
- 4 icon buttons (Home, Courses, Leaderboard, Profile)
- **Active:** Filled icon in `#0E3E5C`
- **Inactive:** Outline icon in `rgba(14, 62, 92, 0.5)`
- Active label below icon, 12px medium weight

### Progress Bar

```css
background: #E5E7EB;
height: 8px;
border-radius: 4px;
overflow: hidden;
```
**Fill:**
```css
background: #4A96D9;
height: 100%;
border-radius: 4px;
transition: width 300ms ease;
```

### Chip / Badge

#### XP Badge (Achievement)
```css
background: #9E8F37;
color: #FFFFFF;
padding: 6px 14px;
border-radius: 999px;
font-size: 13px;
font-weight: 600;
```

#### Status Chip (Neutral)
```css
background: #F5F6F8;
color: #0E3E5C;
border: 1px solid #E5E7EB;
padding: 4px 12px;
border-radius: 999px;
font-size: 12px;
font-weight: 500;
```

### Alerts

#### Success Alert
```css
background: #EFF7FE;
border-right: 4px solid #4A96D9;  /* RTL: right side */
border-radius: 8px;
padding: 12px 16px;
color: #0E3E5C;
font-size: 14px;
font-weight: 500;
```

#### Error Alert
```css
background: #FDF1EA;
border-right: 4px solid #D95A11;
border-radius: 8px;
padding: 12px 16px;
color: #D95A11;
font-size: 14px;
font-weight: 500;
```

---

## Icons

**Library:** Lucide React (`lucide-react`)
**Default size:** 20px in body, 24px in headers, 16px in chips
**Default stroke width:** 2px
**Default color:** Inherits from parent (`currentColor`)

**Common icons used:**
- 🔥 Flame (streak) → `Flame`
- ⚡ Lightning (XP, energy) → `Zap`
- 📤 Upload → `Upload` or `UploadCloud`
- ✓ Check (correct answer) → `Check`
- ✗ Close / Wrong → `X`
- 🎯 Target (goals) → `Target`
- 🏆 Trophy (achievements) → `Trophy`
- 👤 Profile → `User`
- 🏠 Home → `Home`
- 📚 Courses → `BookOpen`
- 🥇 Leaderboard → `Medal` or `BarChart3`

---

## Layout

### Mobile First
- Default viewport: 380px wide
- Maximum content width on desktop: 480px (mobile-app feel even on web)
- Side padding: 20px on mobile, 24px on desktop

### RTL Considerations
- All layouts mirror for Hebrew (`dir="rtl"` on root)
- Icons that indicate direction (arrows, chevrons) flip
- Text alignment: right by default in RTL contexts
- Border accents on alerts go on the right side in RTL

### Z-Index Scale
| Layer | Z-Index |
|---|---|
| Base | 0 |
| Dropdown | 10 |
| Sticky header | 20 |
| Bottom navigation | 30 |
| Modal backdrop | 40 |
| Modal content | 50 |
| Toast / notification | 60 |

---

## Motion & Animation

**Default duration:** 200ms
**Default easing:** `ease-out` for entries, `ease-in` for exits

### Common Animations

| Element | Animation |
|---|---|
| Button press | `transform: scale(0.98)` over 100ms |
| Card hover | `translateY(-2px)` over 200ms |
| Modal entry | Fade in + scale from 0.95 to 1 over 250ms |
| Quiz answer feedback | Color flash 300ms, then settle |
| XP counter increment | Number rolls up over 600ms |
| Streak flame | Subtle scale pulse on milestone |

**Reduced motion:** Honor `prefers-reduced-motion: reduce` and disable non-essential animations.

---

## Brand Voice (UI Copy)

- **Encouraging, not patronizing** — "Great work!" not "You did it, big champ!"
- **Direct, not formal** — "המשך תרגול" not "אנא המשך בתרגול"
- **Celebratory but contained** — "+10 XP" not "🎉🎉 AMAZING +10 XP! 🎉🎉"
- **In Hebrew, use everyday language** — match how a student talks to a friend, not a textbook

### Common Strings

| Action | Hebrew | English |
|---|---|---|
| Start free | התחל בחינם | Start free |
| Login | התחבר | Login |
| Register | הירשם | Register |
| Upload material | העלה חומר חדש | Upload new material |
| Start practice | התחל תרגול | Start practice |
| My courses | הקורסים שלי | My courses |
| Streak | סטריק | Streak |
| Points / XP | נקודות | Points / XP |
| Correct! | נכון! | Correct! |
| Incorrect | לא נכון | Incorrect |
| Another round | סבב נוסף | Another round |
| Back to dashboard | חזרה ללוח הבקרה | Back to dashboard |

---

## Implementation Notes for Lovable / v0 / Cursor

When generating code from this design system:

1. **Use CSS custom properties** for all colors so theming is consistent.
2. **Set `dir="rtl"` on the root element** and use logical properties (`margin-inline-start` instead of `margin-left`) when possible.
3. **Load Heebo from Google Fonts:** `https://fonts.googleapis.com/css2?family=Heebo:wght@400;500;600;700&display=swap`
4. **Use Tailwind config** to map these tokens to utility classes if using Tailwind.
5. **Optimistic UI for Quiz** — render answer feedback instantly; sync to server in background.
6. **No hardcoded colors in components** — always reference tokens.

### Example Tailwind Config Snippet

```js
theme: {
  extend: {
    colors: {
      primary: '#0E3E5C',
      action: '#4A96D9',
      energy: '#D95A11',
      achievement: '#9E8F37',
      surface: '#F5F6F8',
      border: '#E5E7EB',
    },
    borderRadius: {
      sm: '8px',
      md: '12px',
      lg: '16px',
      pill: '999px',
    },
    fontFamily: {
      sans: ['Heebo', 'Rubik', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

**End of DESIGN.md** — This file is the bridge between design and code. Update as the system evolves.
