export function Logo({ height = 48, className = '' }) {
  // Prefer an SVG file in public/, fall back to PNG then inline SVG data URI
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <rect width='128' height='128' rx='20' fill='%231f6a8a' />
      <text x='50%' y='54%' font-size='56' text-anchor='middle' fill='%23fff' font-family='Arial, Helvetica, sans-serif' font-weight='700' dy='.35em'>SR</text>
    </svg>`
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  const srcs = ['/logo.svg', '/logo.png']

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
        // try next source
        const current = srcs.indexOf(img.src.replace(window.location.origin, ''))
        if (current >= 0 && current < srcs.length - 1) {
          img.src = srcs[current + 1]
        } else {
          img.src = fallback
        }
      }}
    />
  )
}
