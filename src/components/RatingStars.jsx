import { Star } from 'lucide-react'

export default function RatingStars({ value, size = 14, label }) {
  const rounded = Math.round(Number(value) || 0)

  return (
    <span
      className="stars"
      role="img"
      aria-label={label || `Nilai ${Number(value) || 0} dari 5`}
    >
      {[1, 2, 3, 4, 5].map((number) => (
        <Star
          key={number}
          size={size}
          fill={number <= rounded ? 'currentColor' : 'none'}
          className={number <= rounded ? 'is-on' : ''}
          aria-hidden="true"
        />
      ))}
    </span>
  )
}
