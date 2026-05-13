import { NavLink } from 'react-router-dom'
import { LayoutGrid, BookOpen, Upload, Medal, User } from 'lucide-react'
import { useUser } from '../context/UserContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { Logo } from './Logo.jsx'

export function Sidebar() {
  const { user } = useUser()
  const { t, lang, toggle } = useLang()
  const initial = (user.name || '?').trim().charAt(0).toUpperCase()

  const items = [
    { to: '/dashboard', label: t('side.dashboard'), Icon: LayoutGrid },
    { to: '/courses', label: t('side.myCourses'), Icon: BookOpen },
    { to: '/upload', label: t('side.upload'), Icon: Upload },
    { to: '/leaderboard', label: t('side.leaderboard'), Icon: Medal },
    { to: '/profile', label: t('side.profile'), Icon: User },
  ]

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <Logo height={52} />
      </div>
      <nav className="sidebar__nav" aria-label="Sidebar">
        {items.map(({ to, label, Icon }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}>
            <span className="sidebar__icon"><Icon size={18} /></span>
            {label}
          </NavLink>
        ))}
      </nav>
      <div style={{ padding: 'var(--space-2) var(--space-3) var(--space-3)' }}>
        <button onClick={toggle} className="lang-toggle lang-toggle--dark">
          {lang === 'he' ? 'EN' : 'עב'}
        </button>
      </div>
      <div className="sidebar__user">
        <div className="sidebar__avatar">{initial}</div>
        <div style={{ minWidth: 0 }}>
          <div className="sidebar__name">{user.name || t('side.guest')}</div>
          <div className="sidebar__plan">{user.plan}</div>
        </div>
      </div>
    </aside>
  )
}
