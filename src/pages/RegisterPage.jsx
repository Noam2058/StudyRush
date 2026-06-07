import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Rocket, BookOpen, Users } from 'lucide-react'
import { InputField } from '../components/InputField.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { Logo } from '../components/Logo.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { supabase } from '../lib/supabase.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { login } = useUser()
  const { t } = useLang()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!name || !email || !password) {
      setError('יש למלא את כל השדות')
      return
    }
    setLoading(true)

    // 1. Register in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({ email, password })

    if (authError) {
      setError(authError.message || 'ההרשמה נכשלה, נסה שוב')
      setLoading(false)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError('שגיאה ביצירת המשתמש')
      setLoading(false)
      return
    }

    // 2. Insert profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        user_id: userId,
        name: name.trim(),
        email,
        plan: 'Free plan',
        streak: 0,
        xp: 0,
        weekly_xp: 0,
        weekly_goal: 1000,
      })

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // 3. Update local context immediately
    login({
      name: name.trim(),
      email,
      plan: 'Free plan',
      streak: 0,
      xp: 0,
      weeklyXP: 0,
      weeklyGoal: 1000,
    })

    setLoading(false)
    navigate('/dashboard')
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
            <InputField label={t('common.fullName')} value={name} onChange={(e) => setName(e.target.value)} placeholder="ישראל ישראלי" required />
            <InputField label={t('common.email')} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" required />
            <InputField label={t('common.password')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            {error && (
              <div role="alert" style={{ color: 'var(--color-error-accent)', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-4)', textAlign: 'right' }}>
                {error}
              </div>
            )}
            <PrimaryButton type="submit" variant="cta" fullWidth disabled={loading}>
              {loading ? 'נרשם...' : t('register.submit')}
            </PrimaryButton>
            <p className="auth__foot">{t('register.haveAccount')} <Link to="/login">{t('nav.login')}</Link></p>
          </form>
        </div>
      </main>
    </div>
  )
}
