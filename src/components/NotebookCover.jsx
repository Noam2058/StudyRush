// src/components/NotebookCover.jsx
//
// Drop-in replacement for the empty FileText cover in DashboardPage.jsx
// and CoursesPage.jsx. Renders a "contents glance" cover: the notebook's
// real topics (from content.questions[].topic) + a progress ring sized by
// question count, tinted by subject.
//
// Usage (in both pages) — replace this block:
//
//   <div className="course__cover" style={{ background: `repeating-linear-gradient(...)`, ... }}>
//     <FileText size={28} color="var(--color-primary)" />
//   </div>
//
// with:
//
//   <NotebookCover notebook={nb} />
//
// You can then delete the COVERS array + coverFromId() helper from those pages.

const CATEGORY_STYLE = {
  'שפות':       { tint: 'var(--cover-mint)',  accent: '#1E9E6A' },                 // languages → green
  'מדעים':      { tint: 'var(--cover-blue)',  accent: 'var(--color-action)' },     // science → blue
  'מדעי המחשב': { tint: 'var(--cover-peach)', accent: 'var(--color-energy)' },     // CS → orange
  'מתמטיקה':    { tint: 'var(--cover-cream)', accent: 'var(--color-achievement)' },// math → gold
  'היסטוריה':   { tint: 'var(--cover-peach)', accent: '#B4541A' },                 // history → terracotta
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
  const { title, category, questionCount, content } = notebook
  const { tint, accent } = styleFor(category)

  // Real topics from the generated quiz (deduped), up to 3.
  const topics = [...new Set((content?.questions || []).map((q) => q.topic).filter(Boolean))].slice(0, 3)

  const qc = questionCount ?? content?.questions?.length ?? 0
  const rr = 22
  const C = 2 * Math.PI * rr
  const frac = Math.max(0.08, Math.min(qc / 12, 1)) // ring fills relative to ~12 questions

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
            <div
              key={i}
              style={{
                width: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                fontSize: 13, fontWeight: 600, color: 'var(--color-primary)', opacity: 0.85, lineHeight: 1.15,
              }}
            >
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
        <circle
          cx={29} cy={29} r={rr} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`} transform="rotate(-90 29 29)"
        />
        <text x={29} y={30} textAnchor="middle" dominantBaseline="central" fontFamily="'Heebo', sans-serif" fontWeight={700} fontSize={17} fill="var(--color-primary)">
          {qc}
        </text>
      </svg>
    </div>
  )
}
const CATEGORY_STYLE = {
  'שפות':          { tint: 'var(--cover-mint)',  accent: '#1E9E6A' },
  'מדעים':         { tint: 'var(--cover-blue)',  accent: 'var(--color-action)' },
  'מדעי המחשב':   { tint: 'var(--cover-peach)', accent: 'var(--color-energy)' },
  'מתמטיקה':      { tint: 'var(--cover-cream)', accent: 'var(--color-achievement)' },
  'היסטוריה':     { tint: 'var(--cover-peach)', accent: '#B4541A' },
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

function mulberry(seed) {
  let t = seed >>> 0
  return () => {
    t += 0x6D2B79F5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

export function NotebookCover({ notebook }) {
  const { title, category, questionCount, content } = notebook
  const { tint, accent } = styleFor(category)

  const r = mulberry(hash(`${title}|${category}`))

  const topics = [...new Set((content?.questions || []).map((q) => q.topic).filter(Boolean))]
  const barCount = Math.max(1, Math.min(3, topics.length || 3))
  const bars = Array.from({ length: barCount }, (_, i) => ({
    y: 30 + i * 13,
    w: 84 - i * 18 + r() * 16,
    o: 0.30 + (barCount - 1 - i) * 0.07,
  }))

  const qc = questionCount ?? content?.questions?.length ?? 0
  const cx = 234, cy = 45, rr = 21
  const C = 2 * Math.PI * rr
  const frac = Math.max(0.08, Math.min(qc / 12, 1))

  return (
    <div
      className="course__cover"
      style={{
        background: `linear-gradient(150deg, color-mix(in oklab, ${tint} 58%, white), ${tint})`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <svg
        viewBox="0 0 300 90"
        preserveAspectRatio="xMidYMid slice"
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
        aria-hidden="true"
      >
        {bars.map((b, i) => (
          <rect key={i} x={38} y={b.y} width={b.w} height={7} rx={3.5} fill={accent} opacity={b.o} />
        ))}
        <circle cx={cx} cy={cy} r={rr} fill="none" stroke="var(--color-primary)" strokeOpacity={0.12} strokeWidth={6} />
        <circle
          cx={cx} cy={cy} r={rr} fill="none" stroke={accent} strokeWidth={6} strokeLinecap="round"
          strokeDasharray={`${C * frac} ${C}`} transform={`rotate(-90 ${cx} ${cy})`}
        />
        <text
          x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="central"
          fontFamily="'Heebo', sans-serif" fontWeight={700} fontSize={15} fill="var(--color-primary)"
        >
          {qc}
        </text>
      </svg>
    </div>
  )
}
