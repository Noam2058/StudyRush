import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { X, Check, Clock } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { StreakChip } from '../components/StreakChip.jsx'
import { FeedbackAlert } from '../components/FeedbackAlert.jsx'
import { useUser } from '../context/UserContext.jsx'
import { useNotebooks } from '../context/NotebooksContext.jsx'
import { useLang } from '../context/LanguageContext.jsx'

const TIME_PER_QUESTION = 20

export default function QuizPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useUser()
  const { lang } = useLang()
  const isHe = lang === 'he'
  const { getNotebook } = useNotebooks()
  const nb = getNotebook(sessionId)

  const [picked, setPicked] = useState(null)
  const [submitted, setSubmitted] = useState(false)
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [wrongTopics, setWrongTopics] = useState([])
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION)

  useEffect(() => {
    if (submitted) return
    setTimeLeft(TIME_PER_QUESTION)
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setSubmitted(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(id)
  }, [index, submitted])

  if (!nb) {
    return (
      <div className="app-container" style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <h2>{isHe ? 'החידון לא נמצא' : 'Quiz not found'}</h2>
        <button className="btn btn--primary" style={{ marginTop: 'var(--space-4)' }} onClick={() => navigate('/dashboard')}>
          {isHe ? 'חזרה' : 'Back'}
        </button>
      </div>
    )
  }

  const questions = nb.content.questions
  const total = questions.length
  const q = questions[index]
  const isCorrect = picked === q.correctId
  const timerDanger = timeLeft <= 5

  const optionStyle = (id) => {
    let bg = 'var(--color-bg)', border = 'var(--color-border)', badgeBg = 'var(--color-surface)', badgeColor = 'var(--color-text-secondary)'
    if (!submitted && picked === id) { bg = 'var(--color-success-bg)'; border = 'var(--color-primary)'; badgeBg = 'var(--color-primary)'; badgeColor = 'white' }
    if (submitted) {
      if (id === q.correctId) { bg = 'var(--color-correct-bg)'; border = 'var(--color-correct)'; badgeBg = 'var(--color-correct)'; badgeColor = 'white' }
      else if (id === picked) { bg = 'var(--color-error-bg)'; border = 'var(--color-error-accent)'; badgeBg = 'var(--color-error-accent)'; badgeColor = 'white' }
    }
    return { bg, border, badgeBg, badgeColor }
  }

  const next = () => {
    const finalScore = isCorrect ? score + 1 : score
    const finalWrongTopics = isCorrect
      ? wrongTopics
      : [...new Set([...wrongTopics, q.topic])]

    if (!isCorrect) setWrongTopics(finalWrongTopics)
    if (isCorrect) setScore(finalScore)

    if (index + 1 >= total) {
      navigate('/results', { state: { score: finalScore, total, wrongTopics: finalWrongTopics, sessionId } })
      return
    }
    setIndex((i) => i + 1)
    setPicked(null)
    setSubmitted(false)
  }

  const timedOut = submitted && !picked
  const correctText = q.options.find((o) => o.id === q.correctId)?.text
  const pickedOption = q.options.find((o) => o.id === picked)
  const pickedExplanation = pickedOption?.explanation

  return (
    <div className="app-container" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <button onClick={() => navigate(`/notebooks/${nb.id}`)} aria-label="close"><X size={22} /></button>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
            {index + 1} / {total} · {isHe ? 'ניקוד' : 'Score'} {score}
          </span>
          <div style={{ flex: 1 }} className="progress">
            <div className="progress__fill" style={{ width: `${((index + (submitted ? 1 : 0)) / total) * 100}%` }} />
          </div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--font-size-small)', fontWeight: 700, color: timerDanger ? 'var(--color-error-accent)' : 'var(--color-text-secondary)', minWidth: 36 }}>
            <Clock size={14} />{timeLeft}
          </span>
          <StreakChip value={user.streak || 3} />
        </div>
      </div>

      <main style={{ flex: 1, padding: 'var(--space-6) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)', maxWidth: 720, width: '100%', margin: '0 auto' }}>
        <span className="chip" style={{ alignSelf: 'flex-start' }}>{isHe ? 'נושא' : 'Topic'}: {q.topic}</span>
        <h2 style={{ fontSize: 26, lineHeight: 1.3 }}>{q.text}</h2>

        <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
          {q.options.map((opt) => {
            const s = optionStyle(opt.id)
            return (
              <button key={opt.id} disabled={submitted} onClick={() => setPicked(opt.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-4)', background: s.bg, border: `2px solid ${s.border}`, borderRadius: 'var(--radius-md)', textAlign: 'start', transition: 'all var(--transition-base)' }}>
                <span style={{ width: 36, height: 36, borderRadius: '50%', background: s.badgeBg, color: s.badgeColor, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>
                  {submitted && opt.id === q.correctId ? <Check size={18} /> : submitted && opt.id === picked ? <X size={18} /> : opt.id.toUpperCase()}
                </span>
                <span style={{ fontWeight: 500 }}>{opt.text}</span>
              </button>
            )
          })}
        </div>

        {submitted && (
          timedOut ? (
            <FeedbackAlert type="error">
              <strong>{isHe ? 'הזמן נגמר!' : 'Time\'s up!'}</strong>
              <div style={{ marginTop: 'var(--space-2)', fontWeight: 400 }}>{isHe ? 'התשובה הנכונה: ' : 'Correct answer: '}{correctText}</div>
            </FeedbackAlert>
          ) : isCorrect ? (
            <FeedbackAlert type="success">
              <strong>{isHe ? 'תשובה נכונה! +10 XP' : 'Correct! +10 XP'}</strong>
              <div style={{ marginTop: 'var(--space-2)', fontWeight: 400 }}>{isHe ? 'הסבר: ' : 'Explanation: '}{q.explanation}</div>
            </FeedbackAlert>
          ) : (
            <FeedbackAlert type="error">
              <strong>{isHe ? 'לא נכון' : 'Incorrect'}</strong>
              {pickedExplanation
                ? <div style={{ marginTop: 'var(--space-2)', fontWeight: 400 }}>{pickedExplanation}</div>
                : <div style={{ marginTop: 'var(--space-2)', fontWeight: 400 }}>{isHe ? 'התשובה הנכונה: ' : 'Correct answer: '}{correctText}</div>
              }
              {pickedExplanation && (
                <div style={{ marginTop: 'var(--space-2)', fontWeight: 600, fontSize: 'var(--font-size-small)' }}>
                  {isHe ? 'התשובה הנכונה: ' : 'Correct answer: '}{correctText}
                </div>
              )}
            </FeedbackAlert>
          )
        )}

        <div style={{ marginTop: 'auto', paddingTop: 'var(--space-5)' }}>
          {!submitted
            ? <PrimaryButton variant="primary" fullWidth disabled={!picked} onClick={() => setSubmitted(true)}>{isHe ? 'אמת תשובה' : 'Submit'}</PrimaryButton>
            : <PrimaryButton variant="cta" fullWidth onClick={next}>{index + 1 >= total ? (isHe ? 'סיים' : 'Finish') : (isHe ? 'הבא' : 'Next')} →</PrimaryButton>}
        </div>
      </main>
    </div>
  )
}
