import { useNavigate } from 'react-router-dom'
import { Trophy, Star, Flame } from 'lucide-react'
import { PrimaryButton } from '../components/PrimaryButton.jsx'

export default function ResultsPage() {
  const navigate = useNavigate()
  return (
    <div className="app-container">
      <main style={{ padding: 'var(--space-8) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 96, height: 96, background: 'rgba(158,143,55,0.18)', color: 'var(--color-achievement)', borderRadius: '50%', marginBottom: 'var(--space-4)' }}>
            <Trophy size={44} />
          </div>
          <h1 style={{ fontSize: 'var(--font-size-h1)', marginBottom: 'var(--space-2)' }}>סשן הסתיים!</h1>
          <p style={{ color: 'var(--color-text-secondary)' }}>עבודה מצוינת, המשך להתאמן</p>
        </div>
        <div className="card card--surface" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-small)', marginBottom: 'var(--space-2)' }}>ציון</p>
          <div style={{ fontSize: 56, fontWeight: 800, marginBottom: 'var(--space-3)' }}>7 / 10</div>
          <div className="progress"><div className="progress__fill" style={{ width: '70%' }} /></div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Star size={26} color="var(--color-achievement)" fill="var(--color-achievement)" />
            <div><div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>+70</div><div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>XP שהרווחת</div></div>
          </div>
          <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <Flame size={26} color="var(--color-energy)" fill="var(--color-energy)" />
            <div><div style={{ fontWeight: 700, fontSize: 'var(--font-size-h3)' }}>13</div><div style={{ fontSize: 'var(--font-size-caption)', color: 'var(--color-text-secondary)' }}>ימי סטריק</div></div>
          </div>
        </div>
        <div className="card">
          <p className="section-label" style={{ marginBottom: 'var(--space-3)' }}>נושאים לחיזוק</p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <li style={{ padding: 'var(--space-2) 0', borderBottom: '1px solid var(--color-border)' }}>פוטוסינתזה</li>
            <li style={{ padding: 'var(--space-2) 0' }}>הפרדה מיוטית</li>
          </ul>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <PrimaryButton variant="cta" fullWidth onClick={() => navigate('/quiz/biology-3')}>סבב נוסף</PrimaryButton>
          <PrimaryButton variant="secondary" fullWidth onClick={() => navigate('/dashboard')}>חזרה ללוח הבקרה</PrimaryButton>
        </div>
      </main>
    </div>
  )
}
