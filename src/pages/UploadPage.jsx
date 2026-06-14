import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, FileText, X, Upload as UploadIcon, Loader2 } from 'lucide-react'
import { BottomNav } from '../components/BottomNav.jsx'
import { InputField } from '../components/InputField.jsx'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { useNotebooks, fileKindFromName } from '../context/NotebooksContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'
import { extractText, detectLangFromText } from '../lib/extractText.js'

const CATEGORIES_HE = ['מדעים', 'מתמטיקה', 'היסטוריה', 'שפות', 'מדעי המחשב', 'אחר']
const CATEGORIES_EN = ['Sciences', 'Mathematics', 'History', 'Languages', 'Computer Science', 'Other']
const COUNTS = [5, 10, 15, 20, 30]

export default function UploadPage() {
  const navigate = useNavigate()
  const { lang, t } = useLang()
  const isHe = lang === 'he'
  const { createNotebook } = useNotebooks()
  const fileInput = useRef(null)

  const [files, setFiles] = useState([])
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('')
  const [language, setLanguage] = useState('auto')
  const [count, setCount] = useState(10)
  const [includeSummary, setIncludeSummary] = useState(true)
  const [includeQuiz, setIncludeQuiz] = useState(true)
  const [busy, setBusy] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [textWarning, setTextWarning] = useState('')

  const ready = !busy && files.length > 0 && title && category && (includeSummary || includeQuiz)

  const submit = async () => {
    if (!ready) return
    setBusy(true)
    setError('')
    try {
      const sources = []
      let combined = ''
      for (let i = 0; i < files.length; i++) {
        const f = files[i]
        setProgress(isHe ? `מעבד ${i + 1}/${files.length}: ${f.name}` : `Processing ${i + 1}/${files.length}: ${f.name}`)
        const text = await extractText(f)
        combined += '\n\n' + text
        sources.push({ fileName: f.name, kind: fileKindFromName(f.name), size: f.size, addedAt: Date.now(), text })
      }
      const resolvedLang = language === 'auto' ? detectLangFromText(combined || title) : language
      if (combined.trim().length < 200) {
        setTextWarning(isHe
          ? 'לא נמצא מספיק טקסט בקבצים — ייתכן שמדובר ב-PDF סרוק (תמונות בלבד). השאלות עלולות להיות באיכות נמוכה.'
          : 'Very little text was extracted — the files may be image-only scans. Questions quality may be limited.')
      } else {
        setTextWarning('')
      }
      const nb = await createNotebook({ title, category, language: resolvedLang, questionCount: count, includeSummary, includeQuiz, sources })
      navigate(`/notebooks/${nb.id}`)
    } catch (err) {
      console.error('Upload error:', err)
      setError(isHe ? 'שגיאה ביצירת המחברת, נסה שוב' : 'Error creating notebook, please try again')
    } finally {
      setBusy(false)
      setProgress('')
    }
  }

  const cats = isHe ? CATEGORIES_HE : CATEGORIES_EN

  return (
    <div className="app-container app-container--with-nav">
      <header className="page-header">
        <Link to="/dashboard" className="page-header__back" aria-label={t('common.back')}>
          <ArrowRight className="icon-flip" size={22} />
        </Link>
        <h1 className="page-header__title">{isHe ? 'העלאת חומר חדש' : 'Upload new material'}</h1>
      </header>

      <main style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720, margin: '0 auto', width: '100%' }}>
        <div onClick={() => !busy && fileInput.current?.click()} style={{ border: '2px dashed var(--color-action)', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-8) var(--space-5)', textAlign: 'center', cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1 }}>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
            onChange={(e) => { setFiles((prev) => [...prev, ...Array.from(e.target.files || [])]); e.target.value = '' }}
            style={{ display: 'none' }}
          />
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, background: 'var(--cover-blue)', color: 'var(--color-action)', borderRadius: 'var(--radius-lg)', marginBottom: 'var(--space-4)' }}>
            <UploadIcon size={28} />
          </div>
          <h3 style={{ marginBottom: 'var(--space-1)' }}>{isHe ? 'גרור קבצים לכאן' : 'Drag files here'}</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-3)' }}>
            {isHe ? 'PDF · Word · PowerPoint · ניתן לבחור מספר קבצים' : 'PDF · Word · PowerPoint · multiple files allowed'}
          </p>
          <span className="btn btn--gold-outline">{isHe ? 'בחר קבצים' : 'Choose files'}</span>
        </div>

        {files.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {files.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)' }}>
                <FileText size={20} />
                <span style={{ flex: 1, fontSize: 'var(--font-size-small)', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.name}</span>
                <span className="chip" style={{ textTransform: 'uppercase' }}>{fileKindFromName(f.name)}</span>
                <button onClick={() => setFiles((p) => p.filter((_, k) => k !== i))} aria-label="remove"><X size={18} /></button>
              </div>
            ))}
          </div>
        )}

        <div>
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>{isHe ? 'פרטי המחברת' : 'Notebook details'}</p>
          <InputField
            label={isHe ? 'שם המחברת' : 'Notebook name'}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={isHe ? 'לדוגמה: ביולוגיה פרק 4' : 'e.g. Biology chapter 4'}
          />
          <label style={{ display: 'block' }}>
            <span style={{ display: 'block', fontSize: 'var(--font-size-small)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
              {isHe ? 'קטגוריה' : 'Category'}
            </span>
            <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">{isHe ? 'בחר קטגוריה' : 'Select category'}</option>
              {cats.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </label>
        </div>

        <div>
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>{isHe ? 'אפשרויות AI' : 'AI options'}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {[
              ['includeSummary', includeSummary, setIncludeSummary, isHe ? 'צור סיכום AI' : 'Generate AI summary'],
              ['includeQuiz', includeQuiz, setIncludeQuiz, isHe ? 'צור שאלות AI' : 'Generate AI quiz']
            ].map(([, val, setter, lbl]) => (
              <label key={lbl} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--color-surface)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}>
                <input type="checkbox" checked={val} onChange={(e) => setter(e.target.checked)} />
                <span style={{ fontWeight: 600 }}>{lbl}</span>
              </label>
            ))}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                disabled={!includeQuiz}
                onClick={() => setCount(n)}
                style={{ flex: '1 1 60px', minWidth: 60, padding: 'var(--space-3) var(--space-2)', borderRadius: 'var(--radius-pill)', border: `2px solid ${count === n ? 'var(--color-primary)' : 'var(--color-border)'}`, background: count === n ? 'var(--color-primary)' : 'var(--color-bg)', color: count === n ? 'var(--color-text-on-primary)' : 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--font-size-body)' }}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {busy && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3) var(--space-4)', background: 'var(--color-success-bg)', borderRadius: 'var(--radius-md)', color: 'var(--color-primary)', fontSize: 'var(--font-size-small)' }}>
            <Loader2 size={18} className="spin" />
            <span>{progress || (isHe ? 'מייצר תוכן…' : 'Generating content…')}</span>
          </div>
        )}

        {textWarning && (
          <div style={{ color: 'var(--color-achievement)', background: 'rgba(158,143,55,0.12)', border: '1px solid var(--color-achievement)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', fontSize: 'var(--font-size-small)' }}>
            ⚠️ {textWarning}
          </div>
        )}

        {error && (
          <div style={{ color: 'var(--color-error-accent)', background: 'var(--color-error-bg)', borderRadius: 'var(--radius-sm)', padding: 'var(--space-3)', fontSize: 'var(--font-size-small)', textAlign: 'right' }}>
            {error}
          </div>
        )}

        <PrimaryButton variant="cta" fullWidth disabled={!ready} onClick={submit}>
          {busy ? (isHe ? 'מעבד…' : 'Processing…') : (isHe ? 'צור מחברת' : 'Create notebook')}
        </PrimaryButton>
      </main>
      <BottomNav />
    </div>
  )
}
