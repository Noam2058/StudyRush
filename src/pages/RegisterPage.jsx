import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Rocket, BookOpen, Users } from 'lucide-react'
import { InputField } from '../components/InputField.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { Logo } from '../components/Logo.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { signUp } = useUser()
  const { t } = useLang()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) return setError(t('register.errors.required') || 'Please fill all fields')
    setLoading(true)
    try {
      const res = await signUp({ email, password, options: { data: { full_name: name } } })
      const session = res?.data?.session
      if (session) {
        navigate('/dashboard')
      } else {
        // likely requires email confirmation
        setError(t('register.checkEmail') || 'Please check your email to confirm your account')
      }
    } catch (err) {
      setError(err.message || t('register.errors.failed') || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth">
      <aside className="auth__brand" aria-hidden>
        <div className="auth__brand-inner">
          <div style={{ marginBottom: 'var(--space-8)' }}>
            <Logo height={64} />
          </div>
          <h2 className="auth__brand-title">{t('register.brandTitle.1')}<br />{t('register.brandTitle.2')}</h2>
          <p className="auth__brand-sub">{t('register.brandSub')}</p>
          <ul className="auth__brand-features">
            <li className="auth__brand-feature"><span><Rocket size={16} /></span>{t('register.feat.1')}</li>
            <li className="auth__brand-feature"><span><BookOpen size={16} /></span>{t('register.feat.2')}</li>
            <li className="auth__brand-feature"><span><Users size={16} /></span>{t('register.feat.3')}</li>
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
            <Link to="/login" className="auth__top-link">
              {t('register.haveAccount')} <strong style={{ color: 'var(--color-energy)' }}>{t('nav.login')}</strong>
            </Link>
          </div>
        </div>
        <div className="auth__card">
          <div className="auth__card-head">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-5)' }}>
              <Logo height={64} />
            </div>
            <h1>{t('register.title')}</h1>
            <p>{t('register.sub')}</p>
          </div>
          <form onSubmit={submit}>
            <InputField label={t('common.fullName')} value={name} onChange={(e) => setName(e.target.value)} placeholder="" required />
            <InputField label={t('common.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            <InputField label={t('common.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && <div role="alert" className="auth__error" style={{ color: 'var(--color-danger)', marginBottom: 'var(--space-4)' }}>{error}</div>}
            <PrimaryButton type="submit" variant="cta" fullWidth disabled={loading}>{loading ? t('common.loading') : t('register.submit')}</PrimaryButton>
            <p className="auth__foot">{t('register.haveAccount')} <Link to="/login">{t('nav.login')}</Link></p>
          </form>
        </div>
      </main>
    </div>
  )
}
