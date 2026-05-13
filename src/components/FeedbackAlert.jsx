import { Check, X } from 'lucide-react'
export function FeedbackAlert({ type, children }) {
  return (
    <div className={`alert alert--${type}`} role="alert">
      <span style={{ flexShrink: 0 }}>{type === 'success' ? <Check size={20} /> : <X size={20} />}</span>
      <span>{children}</span>
    </div>
  )
}
