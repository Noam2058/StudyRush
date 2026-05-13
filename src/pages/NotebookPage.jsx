import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Play, FileText } from 'lucide-react'
import { BottomNav } from '../components/BottomNav.jsx'
import { useNotebooks } from '../context/NotebooksContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

export default function NotebookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getNotebook } = useNotebooks()
  const { lang } = useLang()
  const isHe = lang === 'he'
  const nb = getNotebook(id)

  if (!nb) return (
    <div className="app-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
      <h2>{isHe ? 'מחברת לא נמצאה' : 'Notebook not found'}</h2>
      <Link to="/courses" className="btn btn--primary" style={{ marginTop: 'var(--space-4)', display: 'inline-flex' }}>{isHe ? 'חזרה לקורסים' : 'Back to courses'}</Link>
    </div>
  )

  return (
    <div className="app-container app-container--with-nav">
      <header className="page-header">
        <Link to="/courses" className="page-header__back" aria-label={isHe ? 'חזרה' : 'Back'}><ArrowRight className="icon-flip" size={22} /></Link>
        <h1 className="page-header__title">{nb.title}</h1>
      </header>
      <main style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div className="card card--surface">
          <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap', marginBottom: 'var(--space-4)' }}>
            <span className="chip">{nb.category}</span>
            <span className="chip">{nb.questionCount} {isHe ? 'שאלות' : 'questions'}</span>
            <span className="chip">{nb.language === 'he' ? 'עברית' : 'English'}</span>
          </div>
          <button className="btn btn--cta btn--full" onClick={() => navigate(`/quiz/${nb.id}`)}>
            <Play size={18} /> {isHe ? 'התחל חידון' : 'Start quiz'}
          </button>
        </div>

        {nb.includeSummary && nb.content.summary && (
          <div className="card">
            <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>{isHe ? 'סיכום AI' : 'AI Summary'}</p>
            <p style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-size-small)', lineHeight: 1.7, color: 'var(--color-text-secondary)' }}>{nb.content.summary}</p>
          </div>
        )}

        <div className="card">
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>{isHe ? 'קבצים שהועלו' : 'Uploaded files'} ({nb.sources.length})</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {nb.sources.map((s, i) => (
              <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                <FileText size={18} color="var(--color-action)" />
                <span style={{ flex: 1, fontSize: 'var(--font-size-small)', fontWeight: 500 }}>{s.fileName}</span>
                <span className="chip" style={{ textTransform: 'uppercase' }}>{s.kind}</span>
              </li>
            ))}
          </ul>
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
