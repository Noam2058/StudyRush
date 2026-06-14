export function Logo({ height = 48, className = '' }) {
  // inline SVG fallback in case /logo.png is missing (prevents white box)
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' width='128' height='128' viewBox='0 0 128 128'>
      <rect width='128' height='128' rx='20' fill='%231f6a8a' />
      <text x='50%' y='54%' font-size='56' text-anchor='middle' fill='%23fff' font-family='Arial, Helvetica, sans-serif' font-weight='700' dy='.35em'>SR</text>
    </svg>`
  const fallback = `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`

  return (
    <img
      src="/logo.png"
      alt="StudyRush"
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
      className={className}
      onError={(e) => {
        // replace with inline SVG data URI when the image fails to load
        e.currentTarget.onerror = null
        e.currentTarget.src = fallback
      }}
    />
  )
}
