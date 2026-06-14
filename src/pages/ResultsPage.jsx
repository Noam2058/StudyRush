import { useNavigate, useLocation } from 'react-router-dom'
import { Trophy, Star, Flame } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'
import { useLang } from '../context/LanguageContext.jsx'

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
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, background: 'rgba(158,143,55,0.18)', color: 'var(--color-achievement)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
            <Trophy size={44} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-h1)', marginBottom: 'var(--space-2)' }}>
            {isHe ? 'סשן הסתיים!' : 'Session complete!'}
          </h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {isHe ? 'עבודה מצוינת, המשך להתאמן' : 'Great work, keep practicing'}
          </p>
        </div>

        <div className="card card--surface" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-2)' }}>
            {isHe ? 'ציון' : 'Score'}
          </p>
          <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 'var(--space-3)' }}>
            {score} / {total}
          </div>
          <div className="progress">
            <div className="progress__fill" style={{ width: `${percentage}%` }} />
          </div>
          <p style={{ marginTop: 'var(--space-2)', fontSize: 'var(--font-size-small)', color: 'var(--color-text-secondary)' }}>
            {percentage}%
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
              <div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>{score === total ? '🔥' : score > total / 2 ? '👍' : '💪'}</div>
              <div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>
                {score === total
                  ? (isHe ? 'מושלם!' : 'Perfect!')
                  : score > total / 2
                  ? (isHe ? 'כל הכבוד!' : 'Well done!')
                  : (isHe ? 'תמשיך להתאמן' : 'Keep going!')}
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
