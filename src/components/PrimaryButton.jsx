export function PrimaryButton({ variant = 'primary', fullWidth, size = 'md', onClick, type = 'button', disabled, children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn btn--${variant}${fullWidth ? ' btn--full' : ''}${size === 'lg' ? ' btn--lg' : ''}`}
    >
      {children}
    </button>
  )
}
