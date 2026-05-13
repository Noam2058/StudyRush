import { Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import RegisterPage from './pages/RegisterPage.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import UploadPage from './pages/UploadPage.jsx'
import QuizPage from './pages/QuizPage.jsx'
import ResultsPage from './pages/ResultsPage.jsx'
import LeaderboardPage from './pages/LeaderboardPage.jsx'
import ProfilePage from './pages/ProfilePage.jsx'
import CoursesPage from './pages/CoursesPage.jsx'
import NotebookPage from './pages/NotebookPage.jsx'

function NotFound() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <h1 style={{ fontSize: 72, color: 'var(--color-primary)' }}>404</h1>
      <p style={{ color: 'var(--color-text-secondary)' }}>הדף לא נמצא</p>
      <a href="/" className="btn btn--primary">חזרה לבית</a>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/courses" element={<CoursesPage />} />
      <Route path="/upload" element={<UploadPage />} />
      <Route path="/notebooks/:id" element={<NotebookPage />} />
      <Route path="/quiz/:sessionId" element={<QuizPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="/leaderboard" element={<LeaderboardPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
