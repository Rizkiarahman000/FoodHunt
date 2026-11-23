import { ReceiptText } from 'lucide-react'
import { Link } from '../lib/router'
import { useVisits } from '../context/VisitsContext'
import { SCORE_FIELDS } from '../lib/reviews'

export default function RecordBanner() {
  const { stats } = useVisits()
  const hasVisits = stats.total > 0

  return (
    <Link to="/riwayat" className="record-banner">
      <div className="record-banner-top">
        <span className="record-banner-icon">
          <ReceiptText size={19} aria-hidden="true" />
        </span>
        <div>
          <p className="record-banner-label">Pernah Beli</p>
          <h2>
            {hasVisits
              ? `${stats.total} resto sudah pernah dibeli`
              : 'Belum ada catatan beli'}
          </h2>
        </div>
        {hasVisits && (
          <span className="record-average">
            {stats.average.toFixed(1)}
            <small>/5</small>
          </span>
        )}
      </div>

      <p className="record-banner-sub">
        {hasVisits
          ? 'Buka catatan untuk melihat atau mengedit review enak, murah, dan lingkungan.'
          : 'Setelah mampir dan membeli, catat restonya lalu beri review.'}
      </p>

      {hasVisits && (
        <div className="record-scores">
          {SCORE_FIELDS.map((field) => (
            <span key={field.key} className="record-score">
              {field.label}
              <strong>{stats[field.key].toFixed(1)}</strong>
            </span>
          ))}
        </div>
      )}
    </Link>
  )
}
