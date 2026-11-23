import { MapPin, Pencil, Trash2 } from 'lucide-react'
import { Link } from '../lib/router'
import FoodImage from './FoodImage'
import { formatRupiah } from '../lib/format'
import { SCORE_FIELDS, formatDate, visitAverage } from '../lib/reviews'

export default function VisitCard({ visit, place, onEdit, onDelete }) {
  if (!place) return null

  const average = visitAverage(visit)
  const meta = [
    visit.itemName || 'Tanpa catatan menu',
    visit.amount != null ? formatRupiah(visit.amount) : null,
    visit.purchasedAt ? formatDate(visit.purchasedAt) : null,
  ].filter(Boolean)

  return (
    <article className="visit-card">
      <Link to={`/foods/${place.id}`} className="visit-main">
        <FoodImage src={place.imageUrl} alt={place.name} className="visit-thumb" />
        <div className="visit-body">
          <div className="visit-head">
            <span className="chip chip--done">Pernah beli</span>
            <span className="visit-average">
              {average.toFixed(1)}
              <small>/5</small>
            </span>
          </div>
          <h2>{place.name}</h2>
          <p className="visit-area">
            <MapPin size={13} aria-hidden="true" />
            {place.areaName}
          </p>
          <p className="visit-meta">{meta.join(' · ')}</p>
        </div>
      </Link>

      <div className="visit-scores">
        {SCORE_FIELDS.map((field) => (
          <span key={field.key} className="visit-score">
            {field.label}
            <strong>{visit[field.key]}/5</strong>
          </span>
        ))}
      </div>

      {visit.note && <p className="visit-note">“{visit.note}”</p>}

      <div className="visit-actions">
        <button type="button" className="btn btn--ghost btn--sm" onClick={() => onEdit(visit)}>
          <Pencil size={15} aria-hidden="true" />
          Edit review
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={() => onDelete(visit)}
          aria-label={`Hapus review ${place.name}`}
        >
          <Trash2 size={17} aria-hidden="true" />
        </button>
      </div>
    </article>
  )
}
