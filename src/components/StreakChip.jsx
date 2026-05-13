import { Flame } from 'lucide-react'
export function StreakChip({ value, onDark = false }) {
  return (
    <span className={`chip chip--streak${onDark ? ' chip--header' : ''}`}>
      <Flame size={16} />{value}
    </span>
  )
}
