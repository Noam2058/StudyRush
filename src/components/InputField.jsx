export function InputField({ label, value, onChange, error, ...rest }) {
  return (
    <label style={{ display: 'block', marginBottom: 'var(--space-4)' }}>
      <span style={{ display: 'block', fontSize: 'var(--font-size-small)', fontWeight: 600, marginBottom: 'var(--space-2)', color: 'var(--color-text-secondary)' }}>
        {label}
      </span>
      <input value={value} onChange={onChange} className={`input${error ? ' input--error' : ''}`} {...rest} />
      {error && <span style={{ display: 'block', marginTop: 'var(--space-1)', color: 'var(--color-error-accent)', fontSize: 'var(--font-size-caption)' }}>{error}</span>}
    </label>
  )
}
