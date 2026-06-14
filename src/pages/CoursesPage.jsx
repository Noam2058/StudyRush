import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { Plus, BookOpen, FileText, Trash2, Search } from 'lucide-react'
import { Sidebar } from '../components/Sidebar.jsx'
import { BottomNav } from '../components/BottomNav.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { useNotebooks } from '../context/NotebooksContext.jsx'

export default function CoursesPage() {
  const { t, lang } = useLang()
  const isHe = lang === 'he'
  const navigate = useNavigate()
  const { notebooks, removeNotebook } = useNotebooks()
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? notebooks.filter((nb) =>
        nb.title.toLowerCase().includes(query.toLowerCase()) ||
        nb.category.toLowerCase().includes(query.toLowerCase())
      )
    : notebooks

  return (
    <div className="dash">
      <Sidebar />
      <div className="dash__main">
        <header className="dash__top">
          <p className="dash__greeting">{t('side.myCourses')}</p>
          <div className="dash__top-actions">
            <button className="btn btn--cta dash__upload-btn" onClick={() => navigate('/upload')}>
              <Plus size={18} /> {t('dash.uploadNew')}
            </button>
          </div>
        </header>
        <main className="dash__content">
          {notebooks.length === 0 ? (
            <section style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8)', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 72, height: 72, borderRadius: 'var(--radius-lg)', background: 'var(--cover-blue)', color: 'var(--color-action)', marginBottom: 'var(--space-4)' }}>
                <BookOpen size={32} />
              </div>
              <h2 style={{ marginBottom: 'var(--space-2)' }}>{isHe ? 'עדיין אין לך קורסים' : "You don't have any courses yet"}</h2>
              <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-5)' }}>{isHe ? 'העלה חומר לימוד ראשון כדי להתחיל' : 'Upload your first study material to begin'}</p>
              <Link to="/upload" className="btn btn--cta"><Plus size={18} /> {isHe ? 'העלה חומר' : 'Upload material'}</Link>
            </section>
          ) : (
            <section>
              <div className="dash__section-head" style={{ marginBottom: 'var(--space-4)' }}>
                <span className="section-label">{notebooks.length} {isHe ? 'מחברות' : 'notebooks'}</span>
              </div>

              <div style={{ position: 'relative', marginBottom: 'var(--space-4)' }}>
                <Search size={16} style={{ position: 'absolute', insetInlineStart: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)', pointerEvents: 'none' }} />
                <input
                  className="input"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={isHe ? 'חפש לפי שם או קטגוריה...' : 'Search by name or category...'}
                  style={{ paddingInlineStart: 36 }}
                />
              </div>

              {filtered.length === 0 ? (
                <p style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: 'var(--space-8) 0' }}>
                  {isHe ? 'לא נמצאו תוצאות' : 'No results found'}
                </p>
              ) : (
                <div className="course-grid">
                  {filtered.map((nb) => (
                    <div key={nb.id} className="course" style={{ position: 'relative', textAlign: 'start' }}>
                      <button onClick={() => navigate(`/notebooks/${nb.id}`)} style={{ all: 'unset', cursor: 'pointer', display: 'block', width: '100%' }}>
                        <div className="course__cover" style={{ background: `repeating-linear-gradient(135deg, var(--cover-blue) 0 12px, color-mix(in oklab, var(--cover-blue) 80%, white) 12px 14px)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <FileText size={28} color="var(--color-primary)" />
                        </div>
                        <div className="course__title">{nb.title}</div>
                        <div className="course__meta" style={{ marginTop: 4 }}>{nb.category} · {nb.sources.length} {isHe ? 'קבצים' : 'files'} · {nb.questionCount}q</div>
                      </button>
                      <button onClick={() => { if (confirm(isHe ? 'למחוק את המחברת?' : 'Delete this notebook?')) removeNotebook(nb.id) }} aria-label="delete" style={{ position: 'absolute', top: 8, insetInlineEnd: 8, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-pill)', width: 32, height: 32, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-error-accent)', cursor: 'pointer' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button className="course course--add" onClick={() => navigate('/upload')}>
                    <div className="course__add-inner"><Plus size={28} /><span>{t('dash.newCourse')}</span></div>
                  </button>
                </div>
              )}
            </section>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
