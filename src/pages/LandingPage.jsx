import { Link } from 'react-router-dom'
import { Upload, Zap, Trophy, ArrowLeft, Quote } from 'lucide-react'
import { useLang } from '../context/LanguageContext.jsx'
import { LanguageToggle } from '../components/LanguageToggle.jsx'
import { Logo } from '../components/Logo.jsx'

export default function LandingPage() {
  const { t, dir } = useLang()

  const FEATURES = [
    { Icon: Upload, title: t('feat.upload.title'), desc: t('feat.upload.desc') },
    { Icon: Zap, title: t('feat.ai.title'), desc: t('feat.ai.desc') },
    { Icon: Trophy, title: t('feat.compete.title'), desc: t('feat.compete.desc') },
  ]

  const TESTIMONIALS = dir === 'rtl'
    ? [
        { name: 'נועה ל.', role: 'סטודנטית לרפואה', quote: 'תוך שבוע הציונים שלי קפצו. החידונים מדויקים בטירוף לחומר.' },
        { name: 'איתי ב.', role: 'תלמיד תיכון', quote: 'הסטריק היומי גורם לי לפתוח את האפליקציה כל יום בלי תירוצים.' },
        { name: 'מאיה ק.', role: 'סטודנטית למשפטים', quote: 'סוף סוף שיטה שגורמת לחזרה על חומר להרגיש כמו משחק.' },
      ]
    : [
        { name: 'Noa L.', role: 'Med student', quote: 'My grades jumped within a week. The quizzes are scary-accurate to the material.' },
        { name: 'Itai B.', role: 'High school senior', quote: 'The daily streak makes me open the app every single day, no excuses.' },
        { name: 'Maya K.', role: 'Law student', quote: 'Finally a method that makes reviewing material feel like a game.' },
      ]

  return (
    <div className="landing">
      <header className="landing__nav">
        <div className="landing__nav-inner">
          <Link to="/" className="landing__brand" style={{ display: 'flex', alignItems: 'center' }}>
            <Logo height={40} />
          </Link>
          <nav className="landing__menu" aria-label="Main">
            <a href="#features">{t('nav.features')}</a>
            <a href="#pricing">{t('nav.pricing')}</a>
            <a href="#about">{t('nav.about')}</a>
          </nav>
          <div className="landing__nav-actions">
            <LanguageToggle variant="dark" />
            <Link to="/login" className="btn btn--nav-ghost">{t('nav.login')}</Link>
            <Link to="/register" className="btn btn--nav-cta">
              {t('nav.startFree')} <ArrowLeft size={16} className="icon-flip" />
            </Link>
          </div>
        </div>
      </header>

      <section className="landing__hero">
        <div className="landing__hero-inner">
          <div className="landing__hero-text">
            <p className="landing__eyebrow">{t('landing.eyebrow')}</p>
            <h1 className="landing__title">{t('landing.title.1')}<br />{t('landing.title.2')}<br />{t('landing.title.3')}</h1>
            <p className="landing__subtitle">{t('landing.subtitle')}</p>
            <div className="landing__cta-row">
              <Link to="/register" className="btn btn--cta btn--lg">{t('landing.cta.primary')}</Link>
              <Link to="/login" className="btn btn--secondary btn--lg">{t('landing.cta.login')}</Link>
            </div>
            <div className="landing__chips">
              <span className="chip chip--feature">{t('landing.chip.upload')}</span>
              <span className="chip chip--feature">{t('landing.chip.aiQuiz')}</span>
              <span className="chip chip--feature">{t('landing.chip.streak')}</span>
              <span className="chip chip--feature">{t('landing.chip.compete')}</span>
            </div>
          </div>
          <div className="landing__hero-visual" aria-hidden>
            <div className="phone-mock">
              <div className="phone-mock__inner">
                <div className="phone-mock__notch" />
                <div className="phone-mock__screen">
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 8 }}>
                    <img src="/logo.png" alt="" height={48} style={{ objectFit: 'contain' }} />
                  </div>
                  <div className="phone-mock__bar phone-mock__bar--energy" style={{ width: '70%' }} />
                  <div className="phone-mock__card">
                    <div className="phone-mock__pill" />
                    <div className="phone-mock__line" />
                    <div className="phone-mock__line phone-mock__line--short" />
                  </div>
                  <div className="phone-mock__card phone-mock__card--alt">
                    <div className="phone-mock__pill phone-mock__pill--blue" />
                    <div className="phone-mock__line" />
                  </div>
                  <div className="phone-mock__cta">▶</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="landing__strip">
        <div className="landing__strip-inner">
          {FEATURES.map(({ Icon, title, desc }, i) => (
            <article key={i} className="feature-card">
              <span className={`feature-card__icon feature-card__icon--${i}`}><Icon size={22} /></span>
              <div>
                <h3 className="feature-card__title">{title}</h3>
                <p className="feature-card__desc">{desc}</p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="about" className="landing__testimonials">
        <div className="landing__testimonials-inner">
          <p className="section-label">{t('testi.label')}</p>
          <h2 className="landing__h2">{t('testi.title')}</h2>
          <div className="testi-grid">
            {TESTIMONIALS.map((tst, i) => (
              <article key={i} className="testi-card">
                <Quote size={28} className="testi-card__quote" />
                <p className="testi-card__text">{tst.quote}</p>
                <div className="testi-card__author">
                  <div className="testi-card__avatar">{tst.name.charAt(0)}</div>
                  <div>
                    <div className="testi-card__name">{tst.name}</div>
                    <div className="testi-card__role">{tst.role}</div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="landing__final">
        <div className="landing__final-inner">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-6)' }}>
            <Logo height={72} />
          </div>
          <h2 className="landing__h2">{t('final.title')}</h2>
          <p className="landing__final-sub">{t('final.sub')}</p>
          <Link to="/register" className="btn btn--cta btn--lg">{t('final.cta')}</Link>
        </div>
      </section>

      <footer className="landing__footer">
        <Logo height={32} />
        <span>{t('footer.tagline')}</span>
        <nav style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
          <Link to="/profile">{t('footer.privacy')}</Link>
          <Link to="/profile">{t('footer.terms')}</Link>
        </nav>
      </footer>
    </div>
  )
}
