import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Star, Flame } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { useLang } from '../context/LanguageContext.jsx'

const RADIUS = 46
const CIRC = 2 * Math.PI * RADIUS

function ScoreRing({ percentage }) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => setProgress(percentage), 80)
    return () => clearTimeout(t)
  }, [percentage])

  const offset = CIRC - (progress / 100) * CIRC
  const color = percentage >= 80 ? 'var(--color-correct)' : percentage >= 50 ? 'var(--color-action)' : 'var(--color-energy)'

  return (
    <svg width="140" height="140" viewBox="0 0 108 108" style={{ display: 'block' }}>
      <circle cx="54" cy="54" r={RADIUS} fill="none" stroke="var(--color-border)" strokeWidth="9" />
      <circle
        cx="54" cy="54" r={RADIUS}
        fill="none"
        stroke={color}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={CIRC}
        strokeDashoffset={offset}
        transform="rotate(-90 54 54)"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.4,0,.2,1), stroke 0.4s' }}
      />
      <text x="54" y="50" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 22, fontWeight: 800, fill: 'var(--color-text-primary)', fontFamily: 'inherit' }}>
        {percentage}%
      </text>
      <text x="54" y="68" textAnchor="middle" dominantBaseline="middle" style={{ fontSize: 10, fill: 'var(--color-text-secondary)', fontFamily: 'inherit' }}>
        ציון
      </text>
    </svg>
  )
}

export default function ResultsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { lang } = useLang()
  const isHe = lang === 'he'

  const state = location.state || {}
  const score = state.score ?? 0
  const total = state.total ?? 0
  const wrongTopics = state.wrongTopics ?? []
  const sessionId = state.sessionId
  const xp = score * 10
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="app-container">
      <main style={{ padding: 'var(--space-8) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--space-3)' }}>
            <ScoreRing percentage={percentage} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-h1)', marginBottom: 'var(--space-2)' }}>
            {score} / {total}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {percentage === 100
              ? (isHe ? 'מושלם! כל הכבוד!' : 'Perfect score!')
              : percentage >= 80
              ? (isHe ? 'עבודה מצוינת!' : 'Great work!')
              : percentage >= 50
              ? (isHe ? 'לא רע, המשך להתאמן' : 'Not bad, keep practicing')
              : (isHe ? 'תמשיך להתאמן, תצליח!' : 'Keep going, you got this!')}
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Star size={26} color="var(--color-achievement)" fill="var(--color-achievement)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>+{xp}</div>
              <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>
                {isHe ? 'XP שהרווחת' : 'XP earned'}
              </div>
            </div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Flame size={26} color="var(--color-energy)" fill="var(--color-energy)" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>
                {score}/{total}
              </div>
              <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>
                {isHe ? 'תשובות נכונות' : 'Correct answers'}
              </div>
            </div>
          </div>
        </div>

        {wrongTopics.length > 0 && (
          <div className="card">
            <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>
              {isHe ? 'נושאים לחיזוק' : 'Topics to review'}
            </p>
            <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              {wrongTopics.map((topic, i) => (
                <li key={i} style={{ padding: 'var(--space-2) 0', borderBottom: i < wrongTopics.length - 1 ? '1px solid var(--color-border)' : 'none' }}>
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {sessionId && (
            <PrimaryButton variant="cta" fullWidth onClick={() => navigate(`/quiz/${sessionId}`)}>
              {isHe ? 'סבב נוסף' : 'Play again'}
            </PrimaryButton>
          )}
          <PrimaryButton variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>
            {isHe ? 'חזרה ללוח הבקרה' : 'Back to dashboard'}
          </PrimaryButton>
        </div>
      </main>
    </div>
  )
}
