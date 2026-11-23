import { Star } from 'lucide-react'
import { scoreLabel } from '../lib/reviews'

export default function RatingInput({ field, value, onChange }) {
  return (
    <fieldset className="rating-input">
      <legend>
        {field.label}
        <span>{field.hint}</span>
      </legend>
      <div className="rating-stars" role="group" aria-label={`Nilai ${field.label}`}>
        {[1, 2, 3, 4, 5].map((number) => (
          <button
            key={number}
            type="button"
            className={`star-button${number <= value ? ' is-filled' : ''}`}
            onClick={() => onChange(number)}
            aria-label={`${field.label} ${number} dari 5`}
            aria-pressed={value === number}
          >
            <Star size={19} fill={number <= value ? 'currentColor' : 'none'} aria-hidden="true" />
          </button>
        ))}
      </div>
      <p className="rating-value">
        {value ? `${value}/5 · ${scoreLabel(value)}` : 'Pilih 1 sampai 5'}
      </p>
    </fieldset>
  )
}
