import { useState, useRef } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Play, FileText, Download, Sparkles, Loader2, Upload, X } from 'lucide-react'
import { BottomNav } from '../components/BottomNav.jsx'
import { useNotebooks, fileKindFromName } from '../context/NotebooksContext.jsx'
import { extractText } from '../lib/extractText.js'
import { useLang } from '../context/LanguageContext.jsx'
import { exportSummaryAsWord } from '../lib/exportWord.js'

const REGEN_COUNTS = [5, 10, 15, 20]

export default function NotebookPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getNotebook, regenerateQuestions, addMaterial, removeSource } = useNotebooks()
  const { lang } = useLang()
  const isHe = lang === 'he'
  const nb = getNotebook(id)

  const [regenCount, setRegenCount] = useState(10)
  const [regenBusy, setRegenBusy] = useState(false)
  const [regenSuccess, setRegenSuccess] = useState(null)
  const [regenError, setRegenError] = useState('')

  const addFileRef = useRef(null)
  const [addFiles, setAddFiles] = useState([])
  const [addBusy, setAddBusy] = useState(false)
  const [addSuccess, setAddSuccess] = useState(false)
  const [addError, setAddError] = useState('')

  const handleAddFiles = (e) => {
    const picked = Array.from(e.target.files || [])
    setAddFiles((prev) => [...prev, ...picked])
    e.target.value = ''
  }

  const handleAddMaterial = async () => {
    if (!addFiles.length) return
    setAddBusy(true)
    setAddSuccess(false)
    setAddError('')
    try {
      const sources = await Promise.all(
        addFiles.map(async (file) => ({
          fileName: file.name,
          kind: fileKindFromName(file.name),
          size: file.size,
          text: await extractText(file),
        }))
      )
      await addMaterial(id, sources)
      setAddFiles([])
      setAddSuccess(true)
    } catch (err) {
      console.error(err)
      setAddError(isHe ? 'שגיאה בעדכון הסיכום, נסה שוב' : 'Error updating summary, try again')
    } finally {
      setAddBusy(false)
    }
  }

  const [sourceBusy, setSourceBusy] = useState(null) // fileName being deleted
  const [sourceError, setSourceError] = useState('')

  const handleRemoveSource = async (fileName) => {
    if (!confirm(isHe ? `למחוק את "${fileName}" ולעדכן את הסיכום?` : `Delete "${fileName}" and update summary?`)) return
    setSourceBusy(fileName)
    setSourceError('')
    try {
      await removeSource(id, fileName)
    } catch (err) {
      console.error(err)
      setSourceError(isHe ? 'שגיאה במחיקת הקובץ, נסה שוב' : 'Error deleting file, try again')
    } finally {
      setSourceBusy(null)
    }
  }

  const handleRegen = async () => {
    setRegenBusy(true)
    setRegenSuccess(null)
    setRegenError('')
    try {
      const added = await regenerateQuestions(id, regenCount)
      setRegenSuccess(added)
    } catch (err) {
      console.error(err)
      setRegenError(isHe ? 'שגיאה בייצור שאלות, נסה שוב' : 'Error generating questions, try again')
    } finally {
      setRegenBusy(false)
    }
  }

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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-3)' }}>
              <p className="section-label" style={{ margin: 0 }}>{isHe ? 'סיכום AI' : 'AI Summary'}</p>
              <button
                onClick={() => exportSummaryAsWord(nb.title, nb.content.summary)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--font-size-small)', fontWeight: 600, color: 'var(--color-action)', background: 'var(--color-success-bg)', border: '1px solid var(--color-action)', borderRadius: 'var(--radius-pill)', padding: '6px 14px', cursor: 'pointer' }}
              >
                <Download size={14} /> {isHe ? 'ייצא ל-Word' : 'Export to Word'}
              </button>
            </div>
            <div style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-size-small)', lineHeight: 1.8, color: 'var(--color-text-secondary)' }}>
              {nb.content.summary.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h3 key={i} style={{ fontSize: 'var(--font-size-body)', fontWeight: 700, color: 'var(--color-text-primary)', margin: 'var(--space-4) 0 var(--space-2)', borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-1)' }}>{line.slice(3)}</h3>
                }
                if (line.startsWith('# ')) {
                  return <h2 key={i} style={{ fontSize: 'var(--font-size-h3)', fontWeight: 800, color: 'var(--color-text-primary)', margin: 'var(--space-3) 0 var(--space-2)' }}>{line.slice(2)}</h2>
                }
                if (line.trim() === '') return <br key={i} />
                const withBold = line.split(/\*\*(.+?)\*\*/g).map((part, j) =>
                  j % 2 === 1 ? <strong key={j} style={{ color: 'var(--color-text-primary)' }}>{part}</strong> : part
                )
                return <p key={i} style={{ margin: '4px 0' }}>{withBold}</p>
              })}
            </div>
          </div>
        )}

        <div className="card">
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>
            {isHe ? 'ייצור שאלות חדשות' : 'Generate new questions'}
          </p>
          <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
            {isHe
              ? `יש כרגע ${nb.questionCount} שאלות. בחר כמה שאלות חדשות לייצר מאותו חומר (בנושאים שטרם נכסו).`
              : `Currently ${nb.questionCount} questions. Choose how many new questions to generate from the same material.`}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
            {REGEN_COUNTS.map((n) => (
              <button
                key={n}
                onClick={() => setRegenCount(n)}
                style={{ flex: 1, padding: 'var(--space-3) var(--space-2)', borderRadius: 'var(--radius-pill)', border: `2px solid ${regenCount === n ? 'var(--color-primary)' : 'var(--color-border)'}`, background: regenCount === n ? 'var(--color-primary)' : 'var(--color-bg)', color: regenCount === n ? 'var(--color-text-on-primary)' : 'var(--color-text-primary)', fontWeight: 700, fontSize: 'var(--font-size-body)', cursor: 'pointer' }}
              >
                {n}
              </button>
            ))}
          </div>
          <button
            onClick={handleRegen}
            disabled={regenBusy}
            className="btn btn--cta btn--full"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          >
            {regenBusy
              ? <><Loader2 size={18} className="spin" /> {isHe ? 'מייצר שאלות…' : 'Generating…'}</>
              : <><Sparkles size={18} /> {isHe ? `ייצר ${regenCount} שאלות חדשות` : `Generate ${regenCount} new questions`}</>}
          </button>
          {regenSuccess !== null && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-correct)', fontWeight: 600, textAlign: 'center' }}>
              {isHe ? `נוספו ${regenSuccess} שאלות חדשות! סה"כ: ${nb.questionCount}` : `Added ${regenSuccess} new questions! Total: ${nb.questionCount}`}
            </p>
          )}
          {regenError && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-error-accent)', textAlign: 'center' }}>
              {regenError}
            </p>
          )}
        </div>

        {nb.includeSummary && (
          <div className="card">
            <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>
              {isHe ? 'הוסף חומר לסיכום' : 'Add material to summary'}
            </p>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              {isHe
                ? 'העלה קבצים נוספים כדי לעדכן את הסיכום על בסיס כל החומר.'
                : 'Upload additional files to regenerate the summary from all material.'}
            </p>
            <input
              ref={addFileRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
              style={{ display: 'none' }}
              onChange={handleAddFiles}
            />
            <button
              onClick={() => addFileRef.current?.click()}
              disabled={addBusy}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-pill)', border: '2px dashed var(--color-border)', background: 'var(--color-surface)', color: 'var(--color-action)', fontWeight: 600, fontSize: 'var(--font-size-small)', cursor: 'pointer', width: '100%', justifyContent: 'center', marginBottom: addFiles.length ? 'var(--space-3)' : 0 }}
            >
              <Upload size={16} /> {isHe ? 'בחר קבצים' : 'Choose files'}
            </button>
            {addFiles.length > 0 && (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
                {addFiles.map((f, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', background: 'var(--color-bg)', borderRadius: 'var(--radius-md)' }}>
                    <FileText size={16} color="var(--color-action)" />
                    <span style={{ flex: 1, fontSize: 'var(--font-size-small)', fontWeight: 500 }}>{f.name}</span>
                    <button
                      onClick={() => setAddFiles((prev) => prev.filter((_, j) => j !== i))}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-secondary)', display: 'flex' }}
                    >
                      <X size={16} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <button
              onClick={handleAddMaterial}
              disabled={addBusy || !addFiles.length}
              className="btn btn--cta btn--full"
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              {addBusy
                ? <><Loader2 size={18} className="spin" /> {isHe ? 'מעדכן סיכום…' : 'Updating summary…'}</>
                : <><Sparkles size={18} /> {isHe ? 'עדכן סיכום' : 'Update summary'}</>}
            </button>
            {addSuccess && (
              <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-correct)', fontWeight: 600, textAlign: 'center' }}>
                {isHe ? 'הסיכום עודכן בהצלחה!' : 'Summary updated successfully!'}
              </p>
            )}
            {addError && (
              <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-error-accent)', textAlign: 'center' }}>
                {addError}
              </p>
            )}
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
                <button
                  onClick={() => handleRemoveSource(s.fileName)}
                  disabled={sourceBusy !== null}
                  aria-label="delete source"
                  style={{ background: 'none', border: 'none', cursor: sourceBusy !== null ? 'not-allowed' : 'pointer', color: sourceBusy === s.fileName ? 'var(--color-text-secondary)' : 'var(--color-error-accent)', display: 'flex', opacity: sourceBusy !== null && sourceBusy !== s.fileName ? 0.4 : 1 }}
                >
                  {sourceBusy === s.fileName ? <Loader2 size={16} className="spin" /> : <X size={16} />}
                </button>
              </li>
            ))}
          </ul>
          {sourceError && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-error-accent)', textAlign: 'center' }}>
              {sourceError}
            </p>
          )}
          {sourceBusy && (
            <p style={{ marginTop: 'var(--space-3)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              {isHe ? 'מוחק ומעדכן סיכום…' : 'Deleting and updating summary…'}
            </p>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
