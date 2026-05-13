export function Logo({ height = 48, className = '' }) {
  return (
    <img
      src="/logo.png"
      alt="StudyRush"
      height={height}
      style={{ objectFit: 'contain', display: 'block' }}
      className={className}
    />
  )
}
