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
          <NavLink
            key={to}
            to={to}
            style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2, position: 'relative', textDecoration: 'none', fontSize: 'var(--font-size-caption)' }}
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <span style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 28, height: 3, background: 'var(--color-primary)', borderRadius: '0 0 4px 4px' }} />
                )}
                <span style={{ width: 44, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-pill)', background: isActive ? 'var(--color-success-bg)' : 'transparent', transition: 'background var(--transition-base)' }}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} color={isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)'} />
                </span>
                <span style={{ fontWeight: isActive ? 700 : 500, color: isActive ? 'var(--color-primary)' : 'var(--color-text-tertiary)', transition: 'color var(--transition-base)' }}>
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
