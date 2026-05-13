import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Medal } from 'lucide-react'
import { BottomNav } from '../components/BottomNav.jsx'
import { useUser } from '../context/UserContext.jsx'

const MEDAL_COLORS = ['#9E8F37', '#A8A8A8', '#B26A2E']

export default function LeaderboardPage() {
  const { user } = useUser()
  const [tab, setTab] = useState('friends')

  const rows = [
    { rank: 1, name: 'דניאל לוי', xp: 3120 },
    { rank: 2, name: 'מיכל ברק', xp: 2890 },
    { rank: 3, name: user.name || 'משתמש', xp: user.xp || 2450, isMe: true },
    { rank: 4, name: 'יואב שמש', xp: 1980 },
    { rank: 5, name: 'שירה אבני', xp: 1650 },
  ]

  return (
    <div className="app-container app-container--with-nav">
      <header className="page-header">
        <Link to="/dashboard" className="page-header__back" aria-label="חזרה"><ArrowRight className="icon-flip" size={22} /></Link>
        <h1 className="page-header__title">לוח מובילים</h1>
      </header>
      <main style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ display: 'flex', gap: 'var(--space-2)', padding: 'var(--space-1)', background: 'var(--color-surface)', borderRadius: 'var(--radius-pill)' }}>
          {['friends', 'global'].map((t) => (
            <button key={t} onClick={() => setTab(t)} style={{ flex: 1, padding: 'var(--space-3)', borderRadius: 'var(--radius-pill)', background: tab === t ? 'var(--color-primary)' : 'transparent', color: tab === t ? 'white' : 'var(--color-text-secondary)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>
              {t === 'friends' ? 'החברים שלי' : 'גלובלי'}
            </button>
          ))}
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          {rows.map((r) => (
            <li key={r.rank} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: r.isMe ? 'var(--color-success-bg)' : 'var(--color-bg)', border: `1px solid ${r.isMe ? 'var(--color-action)' : 'var(--color-border)'}`, borderRadius: 'var(--radius-md)' }}>
              <div style={{ width: 32, display: 'flex', justifyContent: 'center' }}>
                {r.rank <= 3 ? <Medal size={22} color={MEDAL_COLORS[r.rank - 1]} fill={MEDAL_COLORS[r.rank - 1]} /> : <span style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>{r.rank}</span>}
              </div>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.isMe ? 'var(--color-action)' : 'var(--color-surface)', color: r.isMe ? 'white' : 'var(--color-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                {r.name.charAt(0)}
              </div>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <span style={{ fontWeight: 600 }}>{r.name}</span>
                {r.isMe && <span style={{ fontSize: 'var(--font-size-caption)', padding: '2px 8px', background: 'var(--color-action)', color: 'white', borderRadius: 'var(--radius-pill)', fontWeight: 700 }}>אני</span>}
              </div>
              <span style={{ fontWeight: 700, color: 'var(--color-achievement)' }}>{r.xp.toLocaleString()} XP</span>
            </li>
          ))}
        </ul>
      </main>
      <BottomNav />
    </div>
  )
}
