const CATEGORY_STYLE = {
  'שפות':        { tint: 'var(--cover-mint)',  accent: '#1E9E6A' },
  'מדעים':       { tint: 'var(--cover-blue)',  accent: 'var(--color-action)' },
  'מדעי המחשב':  { tint: 'var(--cover-peach)', accent: 'var(--color-energy)' },
  'מתמטיקה':     { tint: 'var(--cover-cream)', accent: 'var(--color-achievement)' },
  'היסטוריה':    { tint: 'var(--cover-peach)', accent: '#B4541A' },
}

const FALLBACK = [
  { tint: 'var(--cover-mint)',  accent: '#1E9E6A' },
  { tint: 'var(--cover-blue)',  accent: 'var(--color-action)' },
  { tint: 'var(--cover-peach)', accent: 'var(--color-energy)' },
  { tint: 'var(--cover-cream)', accent: 'var(--color-achievement)' },
]

function hash(str) {
  let h = 2166136261
  str = String(str || '')
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) }
  return h >>> 0
}

function styleFor(category) {
  return CATEGORY_STYLE[category] || FALLBACK[hash(category) % 4]
}

export function NotebookCover({ notebook }) {
  const { category, questionCount, content } = notebook
  const { tint, accent } = styleFor(category)

  const topics = [...new Set((content?.questions || []).map((q) => q.topic).filter(Boolean))].slice(0, 3)
  const qc = questionCount ?? content?.questions?.length ?? 0
  const rr = 22
  const C = 2 * Math.PI * rr
  const frac = Math.max(0.08, Math.min(qc / 12, 1))

  return (
    <div
      className="course__cover"
      style={{
        background: `linear-gradient(150deg, color-mix(in oklab, ${tint} 58%, white), ${tint})`,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 14,
        padding: '0 16px',
      }}
    >
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {topics.length ? (
          topics.map((t, i) => (
            <div key={i} style={{ width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', opacity: 0.85, lineHeight: 1.15 }}>
              <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: 999, background: accent, marginInlineEnd: 7, verticalAlign: 'middle' }} />
              <span style={{ verticalAlign: 'middle' }}>{t}</span>
            </div>
          ))
        ) : (
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', opacity: 0.55 }}>
            {qc} שאלות מוכנות
          </div>
        )}
      </div>

      <svg width={58} height={58} viewBox="0 0 58 58" style={{ flexShrink: 0 }} aria-hidden="true">
        <circle cx={29} cy={29} r={rr} fill="none" stroke="var(--color-primary)" strokeOpacity={0.12} strokeWidth={5} />
        <circle cx={29} cy={29} r={rr} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90 29 29)" />
        <text x={29} y={30} textAnchor="middle" dominantBaseline="central" fontFamily="'Heebo', sans-serif" fontWeight={700} fontSize={17} fill="var(--color-primary)">
          {qc}
        </text>
      </svg>
    </div>
  )
}
