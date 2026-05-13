# StudyRush ⚡

> הפוך את הלמידה שלך למשחק — Turn your learning into a game.

אפליקציית למידה מבוססת AI שהופכת חומרי לימוד (PDF, Word, PowerPoint) לחידונים אינטראקטיביים עם מערכת XP, סטריקים ולוח מובילים בסגנון Duolingo.

## 🛠 Tech Stack

- **Vite + React 18** — Frontend
- **React Router 6** — Routing (src/pages/ + App.jsx)
- **CSS Variables** — Design system (globals.css)
- **Lucide React** — Icons
- **Heebo** (Google Fonts) — Typography

## 🚀 התחלה מהירה

```bash
npm install
npm run dev
```

האפליקציה תהיה זמינה ב-`http://localhost:5173`.

## 📁 מבנה הפרויקט

```
studyrush/
├── DESIGN.md               # מערכת העיצוב המלאה
├── src/
│   ├── main.jsx
│   ├── App.jsx             # Routes
│   ├── styles/
│   │   └── globals.css     # CSS Variables + סגנונות גלובליים
│   ├── context/
│   │   ├── UserContext.jsx
│   │   ├── ThemeContext.jsx
│   │   ├── LanguageContext.jsx
│   │   └── NotebooksContext.jsx
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── BottomNav.jsx
│   │   ├── Sidebar.jsx
│   │   ├── PrimaryButton.jsx
│   │   ├── InputField.jsx
│   │   ├── StreakChip.jsx
│   │   ├── XPChip.jsx
│   │   └── FeedbackAlert.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   ├── DashboardPage.jsx
│   │   ├── CoursesPage.jsx
│   │   ├── UploadPage.jsx
│   │   ├── NotebookPage.jsx
│   │   ├── QuizPage.jsx
│   │   ├── ResultsPage.jsx
│   │   ├── LeaderboardPage.jsx
│   │   └── ProfilePage.jsx
│   ├── i18n/
│   │   └── translations.js
│   └── lib/
│       ├── dummyAI.js
│       └── extractText.js
```

## 🌍 ניווט (Routes)

| URL | עמוד |
|---|---|
| `/` | Landing |
| `/login` | Login |
| `/register` | Register |
| `/dashboard` | Dashboard |
| `/courses` | My Courses |
| `/upload` | Upload |
| `/notebooks/:id` | Notebook detail |
| `/quiz/:sessionId` | Quiz |
| `/results` | Results |
| `/leaderboard` | Leaderboard |
| `/profile` | Profile |

## 🎨 Design System

ראה DESIGN.md למלוא מערכת העיצוב.
כל הצבעים מוגדרים כ-CSS Variables ב-`src/styles/globals.css`.

**צבעים עיקריים:**
- Primary: `#0E3E5C` (Navy)
- Action: `#4A96D9` (Blue)
- Energy: `#D95A11` (Orange CTA)
- Achievement: `#9E8F37` (Gold)

## 📝 הערות

- כל הנתונים הם Frontend-only עם dummy data
- קבצים מעובדים לוקאלית עם מנוע AI דמה
- נתונים נשמרים ב-localStorage
