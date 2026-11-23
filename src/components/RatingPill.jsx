import { Star } from 'lucide-react'

export default function RatingPill({ value, className = '' }) {
  const rating = Number(value) || 0
  return (
    <span
      className={`rating ${className}`}
      aria-label={`Rating ${rating.toFixed(1)} dari 5`}
    >
      <Star size={13} fill="currentColor" aria-hidden="true" />
      {rating.toFixed(1)}
    </span>
  )
}
