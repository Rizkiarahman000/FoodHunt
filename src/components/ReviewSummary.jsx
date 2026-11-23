import { CalendarDays, Pencil, Wallet } from 'lucide-react'
import RatingStars from './RatingStars'
import { formatRupiah } from '../lib/format'
import { SCORE_FIELDS, formatDate, visitAverage } from '../lib/reviews'

export default function ReviewSummary({ visit, onEdit }) {
  const average = visitAverage(visit)

  return (
    <section className="review-summary" aria-label="Review pernah beli">
      <div className="review-summary-head">
        <div className="review-big">
          <strong>{average.toFixed(1)}</strong>
          <span>/5</span>
        </div>
        <div className="review-summary-title">
          <h2>Review kamu</h2>
          <p>{visit.itemName ? `Beli ${visit.itemName}` : 'Catatan pernah beli'}</p>
        </div>
        {onEdit && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onEdit}>
            <Pencil size={15} aria-hidden="true" />
            Edit
          </button>
        )}
      </div>

      <div className="review-scores">
        {SCORE_FIELDS.map((field) => (
          <div key={field.key} className="review-score">
            <span>{field.label}</span>
            <RatingStars
              value={visit[field.key]}
              size={13}
              label={`${field.label} ${visit[field.key]} dari 5`}
            />
            <strong>{visit[field.key]}/5</strong>
          </div>
        ))}
      </div>

      <div className="review-meta">
        {visit.amount != null && (
          <span>
            <Wallet size={14} aria-hidden="true" />
            {formatRupiah(visit.amount)}
          </span>
        )}
        {visit.purchasedAt && (
          <span>
            <CalendarDays size={14} aria-hidden="true" />
            {formatDate(visit.purchasedAt)}
          </span>
        )}
      </div>

      {visit.note && <p className="review-note">“{visit.note}”</p>}
    </section>
  )
}
