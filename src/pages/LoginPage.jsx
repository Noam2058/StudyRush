import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Trophy, Zap } from 'lucide-react'
import { InputField } from '../components/InputField.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { Logo } from '../components/Logo.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

function nameFromEmail(email) {
  const local = email.split('@')[0] || ''
  return local.split(/[._-]/).filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(' ') || 'User'
}

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useUser()
  const { t } = useLang()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const submit = (e) => {
    e.preventDefault()
    if (!email || !password) return
    login({ name: nameFromEmail(email), email })
    navigate('/dashboard')
  }

  return (
    <div className="auth">
      <aside className="auth__brand" aria-hidden>
        <div className="auth__brand-inner">
          <div className="auth__brand-logo" style={{ marginBottom: 'var(--space-8)' }}>
            <Logo height={64} />
          </div>
          <h2 className="auth__brand-title">{t('login.brandTitle.1')}<br />{t('login.brandTitle.2')}</h2>
          <p className="auth__brand-sub">{t('login.brandSub')}</p>
          <ul className="auth__brand-features">
            <li className="auth__brand-feature"><span><Sparkles size={16} /></span>{t('login.feat.1')}</li>
            <li className="auth__brand-feature"><span><Zap size={16} /></span>{t('login.feat.2')}</li>
            <li className="auth__brand-feature"><span><Trophy size={16} /></span>{t('login.feat.3')}</li>
          </ul>
        </div>
      </aside>
      <main className="auth__panel">
        <div className="auth__top">
          <Link to="/" className="page-header__back" aria-label={t('common.back')}>
            <ArrowRight className="icon-flip" size={22} />
          </Link>
          <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
            <LanguageToggle variant="light" />
            <Link to="/register" className="auth__top-link">
              {t('login.noAccount')} <strong style={{ color: 'var(--color-energy)' }}>{t('nav.signup')}</strong>
            </Link>
          </div>
        </div>
        <div className="auth__card">
          <div className="auth__card-head">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
              <Logo height={64} />
            </div>
            <h1>{t('login.title')}</h1>
            <p>{t('login.sub')}</p>
          </div>
          <form onSubmit={submit}>
            <InputField label={t('common.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            <InputField label={t('common.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            <div style={{ textAlign: 'start', marginBottom: 'var(--space-5)' }}>
              <a href="#" style={{ color: 'var(--color-action)', fontSize: 'var(--font-size-small)', fontWeight: 500 }}>{t('login.forgot')}</a>
            </div>
            <PrimaryButton type="submit" variant="primary" fullWidth>{t('login.submit')}</PrimaryButton>
            <div className="auth__divider"><hr />{t('common.or')}<hr /></div>
            <PrimaryButton variant="secondary" fullWidth>{t('login.google')}</PrimaryButton>
            <p className="auth__foot">{t('login.noAccount')} <Link to="/register">{t('login.signupNow')}</Link></p>
          </form>
        </div>
      </main>
    </div>
  )
}
