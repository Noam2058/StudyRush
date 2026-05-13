import { Star } from 'lucide-react'
export function XPChip({ value, onDark = false }) {
  return (
    <span className={`chip chip--xp${onDark ? ' chip--header' : ''}`}>
      <Star size={16} />{Number(value).toLocaleString()}
    </span>
  )
}
