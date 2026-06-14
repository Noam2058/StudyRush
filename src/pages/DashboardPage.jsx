import { Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Plus, ArrowLeft, Flame, Star, FileText } from 'lucide-react'
import { Sidebar } from '../components/Sidebar.jsx'
import { BottomNav } from '../components/BottomNav.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { useNotebooks } from '../context/NotebooksContext.jsx'

const COVER_ROTATE = ['var(--cover-peach)', 'var(--cover-blue)', 'var(--cover-cream)']

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user, loading } = useUser()
  const { t, lang } = useLang()
  const isHe = lang === 'he'
  const { notebooks } = useNotebooks()

  useEffect(() => {
    if (!loading && (!user || !user.email)) {
      navigate('/login')
    }
  }, [loading, user, navigate])

  const week = [
    { d: t('day.sun'), h: 25 }, { d: t('day.mon'), h: 55 }, { d: t('day.tue'), h: 35 },
    { d: t('day.wed'), h: 70 }, { d: t('day.thu'), h: 95, today: true },
    { d: t('day.fri'), h: 25 }, { d: t('day.sat'), h: 60 },
  ]

  const greeting = user.name
    ? t('dash.greetingNamed', { name: user.name, streak: user.streak })
    : t('dash.greeting', { streak: user.streak })

  const latestNotebook = notebooks[0] ?? null

  return (
    <div className="dash">
      <Sidebar />
      <div className="dash__main">
        <header className="dash__top">
          <p className="dash__greeting">{greeting}</p>
          <div className="dash__top-actions">
            <span className="stat-pill"><span className="stat-pill__dot" style={{ background: 'var(--cover-peach)' }} /><Flame size={16} color="var(--color-energy)" /> {user.streak}</span>
            <span className="stat-pill"><span className="stat-pill__dot" style={{ background: 'var(--cover-cream)' }} /><Star size={16} color="var(--color-achievement)" /> {user.xp.toLocaleString()}</span>
            <button className="btn btn--cta dash__upload-btn" onClick={() => navigate('/upload')}>
              <Plus size={18} /> {t('dash.uploadNew')}
            </button>
          </div>
        </header>

        <main className="dash__content">
          {latestNotebook ? (
            <section className="reco" onClick={() => navigate(`/quiz/${latestNotebook.id}`)}>
              <div className="reco__text">
                <p className="section-label">{t('dash.todayLabel')}</p>
                <h2 className="reco__title">{isHe ? `המשך: ${latestNotebook.title}` : `Continue: ${latestNotebook.title}`}</h2>
                <p className="reco__meta">{latestNotebook.questionCount} {isHe ? 'שאלות' : 'questions'} · {latestNotebook.category}</p>
                <div className="progress" style={{ marginTop: 'var(--space-3)', maxWidth: 480 }}>
                  <div className="progress__fill" style={{ width: '0%' }} />
                </div>
              </div>
              <button className="btn btn--cta reco__cta" onClick={(e) => { e.stopPropagation(); navigate(`/quiz/${latestNotebook.id}`) }}>
                {t('dash.startPractice')} <ArrowLeft size={16} className="icon-flip" />
              </button>
            </section>
          ) : (
            <section className="reco" onClick={() => navigate('/upload')}>
              <div className="reco__text">
                <p className="section-label">{t('dash.todayLabel')}</p>
                <h2 className="reco__title">{isHe ? 'העלה את החומר הראשון שלך' : 'Upload your first material'}</h2>
                <p className="reco__meta">{isHe ? 'ה-AI ייצר עבורך שאלות תוך שניות' : 'AI will build your quiz in seconds'}</p>
              </div>
              <button className="btn btn--cta reco__cta" onClick={(e) => { e.stopPropagation(); navigate('/upload') }}>
                <Plus size={16} /> {t('dash.uploadNew')}
              </button>
            </section>
          )}

          <section>
            <div className="dash__section-head">
              <span className="section-label">{t('dash.myCourses')}</span>
              <Link to="/courses" className="dash__view-all">{t('common.viewAll')}</Link>
            </div>
            <div className="course-grid">
              {notebooks.slice(0, 3).map((nb, i) => {
                const cover = COVER_ROTATE[i % COVER_ROTATE.length]
                return (
                  <button key={nb.id} className="course" onClick={() => navigate(`/notebooks/${nb.id}`)}>
                    <div className="course__cover" style={{ background: `repeating-linear-gradient(135deg, ${cover} 0 12px, color-mix(in oklab, ${cover} 80%, white) 12px 14px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <FileText size={26} color="var(--color-primary)" />
                    </div>
                    <div className="course__title">{nb.title}</div>
                    <div className="course__meta">{nb.category} · {nb.questionCount}q</div>
                  </button>
                )
              })}
              <button className="course course--add" onClick={() => navigate('/upload')}>
                <div className="course__add-inner"><Plus size={28} /><span>{t('dash.newCourse')}</span></div>
              </button>
            </div>
          </section>

          <section className="weekly">
            <p className="section-label" style={{ marginBottom: 'var(--space-5)' }}>{t('dash.weekly')}</p>
            <div className="weekly__chart">
              {week.map((w, i) => (
                <div key={i} className="weekly__col">
                  <div className="weekly__bar" style={{ height: `${w.h}%`, background: w.today ? 'var(--color-energy)' : 'var(--cover-cream)' }} />
                  <span className="weekly__label">{w.d}</span>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
