import { NavLink } from 'react-router-dom'
import { Home, Medal, Upload, User } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'

export function BottomNav() {
  const { t } = useLang()
  const items = [
    { to: '/dashboard', label: t('bn.home'), Icon: Home },
    { to: '/leaderboard', label: t('bn.leaderboard'), Icon: Medal },
    { to: '/upload', label: t('bn.upload'), Icon: Upload },
    { to: '/profile', label: t('bn.profile'), Icon: User },
  ]

  return (
    <nav className="bottom-nav" style={{ position: 'fixed', bottom: 0, insetInline: 0, height: 'var(--bottom-nav-height)', background: 'var(--color-bg)', borderTop: '1px solid var(--color-border)', display: 'flex', zIndex: 50, boxShadow: '0 -2px 8px rgba(14,62,92,0.05)' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: 'var(--content-max-desktop)', margin: '0 auto' }}>
        {items.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)', fontWeight: isActive ? 700 : 500, fontSize: 'var(--font-size-caption)' })}>
            {({ isActive }) => <><Icon size={22} strokeWidth={isActive ? 2.4 : 2} />{label}</>}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
