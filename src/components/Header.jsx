import { useUser } from '../context/UserContext.jsx'
import { StreakChip } from './StreakChip.jsx'
import { XPChip } from './XPChip.jsx'

export function Header() {
  const { user } = useUser()
  const initial = (user.name || '?').trim().charAt(0).toUpperCase()
  const pct = Math.min(100, Math.round((user.weeklyXP / user.weeklyGoal) * 100))

  return (
    <header style={{ background: 'var(--color-primary)', color: 'var(--color-text-on-primary)', padding: 'var(--space-5) var(--space-5) var(--space-6)', borderBottomLeftRadius: 'var(--radius-xl)', borderBottomRightRadius: 'var(--radius-xl)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-achievement)', color: 'var(--color-text-on-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 'var(--font-size-h3)', flexShrink: 0 }}>
          {initial}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-body)' }}>{user.name || 'אורח'}</div>
          <div style={{ fontSize: 'var(--font-size-caption)', opacity: 0.7 }}>{user.plan}</div>
        </div>
        <StreakChip value={user.streak} onDark />
        <XPChip value={user.xp} onDark />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-2)', fontSize: 'var(--font-size-caption)', opacity: 0.85 }}>
        <span>השבוע: {user.weeklyXP} XP</span>
        <span>{user.weeklyGoal} XP</span>
      </div>
      <div className="progress progress--on-dark">
        <div className="progress__fill" style={{ width: `${pct}%` }} />
      </div>
    </header>
  )
}
