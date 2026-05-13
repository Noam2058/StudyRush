import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronLeft, Settings, Trophy, LogOut, Star, Flame, BookOpen } from 'lucide-react'
import { BottomNav } from '../components/BottomNav.jsx'
import { useUser } from '../context/UserContext.jsx'

function Stat({ Icon, color, value, label }) {
  return (
    <div className="card" style={{ textAlign: 'center', padding: 'var(--space-4) var(--space-2)' }}>
      <Icon size={22} color={color} style={{ margin: '0 auto var(--space-2)' }} />
      <div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>{value}</div>
      <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>{label}</div>
    </div>
  )
}

function MenuItem({ Icon, label, danger, onClick, last }) {
  return (
    <button onClick={onClick} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4) var(--space-5)', borderBottom: last ? 'none' : '1px solid var(--color-border)', color: danger ? 'var(--color-energy)' : 'var(--color-text-primary)', fontWeight: 600, textAlign: 'start' }}>
      <Icon size={20} /><span style={{ flex: 1 }}>{label}</span><ChevronLeft size={18} className="icon-flip" />
    </button>
  )
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { user, logout } = useUser()
  const initial = (user.name || '?').charAt(0).toUpperCase()

  return (
    <div className="app-container app-container--with-nav">
      <header className="page-header">
        <Link to="/dashboard" className="page-header__back" aria-label="חזרה"><ArrowRight className="icon-flip" size={22} /></Link>
        <h1 className="page-header__title">הפרופיל שלי</h1>
      </header>
      <main style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 88, height: 88, borderRadius: '50%', background: 'var(--color-primary)', color: 'var(--color-achievement)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            {initial}
          </div>
          <h2 style={{ marginBottom: 'var(--space-1)' }}>{user.name || 'אורח'}</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-3)' }}>{user.email || 'guest@studyrush.app'}</p>
          <span className="chip">{user.plan}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-3)' }}>
          <Stat Icon={Star} color="var(--color-achievement)" value={user.xp.toLocaleString()} label="XP כולל" />
          <Stat Icon={Flame} color="var(--color-energy)" value={user.streak} label="סטריק" />
          <Stat Icon={BookOpen} color="var(--color-action)" value={4} label="קורסים" />
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <MenuItem Icon={Settings} label="הגדרות" />
          <MenuItem Icon={Trophy} label="הישגים" />
          <MenuItem Icon={LogOut} label="יציאה מהחשבון" danger onClick={() => { logout(); navigate('/') }} last />
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
