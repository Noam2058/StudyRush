export function Logo({ height = 48, className = '' }) {
  // Prefer an SVG file in public/, fall back to PNG then inline SVG data URI
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <rect width='128' height='128' rx='20' fill='%231f6a8a' />
      <text x='50%' y='54%' font-size='56' text-anchor='middle' fill='%23fff' font-family='Arial, Helvetica, sans-serif' font-weight='700' dy='.35em'>SR</text>
    </svg>`
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  // Prefer the original PNG (if present) so the app shows your supplied logo
  const srcs = ['/logo.png', '/logo.svg']

  return (
    <img
      src={srcs[0]}
      alt="StudyRush"
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
      className={className}
      onError={(e) => {
        const img = e.currentTarget
        img.onerror = null
        // try next source: find which src in our list matches the current src
        const cur = srcs.findIndex(s => img.src.endsWith(s))
        if (cur >= 0 && cur < srcs.length - 1) img.src = srcs[cur + 1]
        else img.src = fallback
      }}
    />
  )
}
