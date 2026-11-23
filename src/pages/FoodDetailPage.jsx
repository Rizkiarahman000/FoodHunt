import { useState } from 'react'
import {
  ChevronLeft,
  Clock,
  MapPin,
  Pencil,
  ReceiptText,
  Trash2,
  Utensils,
} from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import FoodImage from '../components/FoodImage'
import PlaceFormModal from '../components/PlaceFormModal'
import RatingPill from '../components/RatingPill'
import ReviewFormModal from '../components/ReviewFormModal'
import ReviewSummary from '../components/ReviewSummary'
import { CatalogLink, EmptyState, ErrorState } from '../components/StateViews'
import { usePlaces } from '../context/PlacesContext'
import { useToast } from '../context/ToastContext'
import { useVisits } from '../context/VisitsContext'
import { mutationMessage } from '../lib/errors'
import { Link, navigate } from '../lib/router'
import {
  effectiveScore,
  qualifiesForRecommendation,
  RECOMMENDATION_MIN_SCORE,
} from '../lib/reviews'

export default function FoodDetailPage({ id }) {
  const { getPlace, loading, error, refresh, removePlace } = usePlaces()
  const { getVisit, removeForPlace } = useVisits()
  const notify = useToast()

  const [reviewOpen, setReviewOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const place = getPlace(id)
  const visit = getVisit(id)
  const score = effectiveScore(place, visit)
  const isPersonal = place?.source === 'personal'
  const qualifies = qualifiesForRecommendation(place, visit)
  const backTo = isPersonal ? '/resto' : '/foods'
  const backLabel = isPersonal ? 'Resto Saya' : 'Rekomendasi'

  const handleDelete = async () => {
    if (!place) return
    setDeleting(true)
    try {
      await removePlace(place.id)
      removeForPlace(place.id)
      notify('Resto dihapus dari Resto Saya.')
      setDeleteOpen(false)
      navigate('/resto')
    } catch (err) {
      notify(mutationMessage(err, 'Resto gagal dihapus. Coba lagi.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  if (!place && loading) {
    return (
      <div className="page">
        <div className="detail-skeleton" aria-busy="true">
          <span className="sr-only">Memuat detail resto</span>
          <div className="skeleton detail-skeleton-img" />
          <div className="skeleton skeleton-line" />
          <div className="skeleton skeleton-line skeleton-line--mid" />
        </div>
      </div>
    )
  }

  if (!place && error) {
    return (
      <div className="page">
        <div className="detail-topline">
          <Link to="/foods" className="back-link">
            <ChevronLeft size={18} aria-hidden="true" />
            Rekomendasi
          </Link>
        </div>
        <ErrorState message={error.message} config={error.kind === 'config'} onRetry={refresh} />
      </div>
    )
  }

  if (!place) {
    return (
      <div className="page">
        <div className="detail-topline">
          <Link to="/foods" className="back-link">
            <ChevronLeft size={18} aria-hidden="true" />
            Rekomendasi
          </Link>
        </div>
        <EmptyState
          as="h1"
          title="Resto tidak ditemukan"
          message="Mungkin tautannya salah, atau resto ini sudah dihapus."
          action={<CatalogLink label="Kembali ke rekomendasi" />}
        />
      </div>
    )
  }

  return (
    <article className="page detail-page">
      <div className="detail-hero">
        <FoodImage src={place.imageUrl} alt={place.name} className="detail-img" priority />
        <Link to={backTo} className="floating-back" aria-label={`Kembali ke ${backLabel}`}>
          <ChevronLeft size={20} aria-hidden="true" />
        </Link>
        <span className="detail-areachip">
          <MapPin size={13} aria-hidden="true" />
          {place.areaName}
        </span>
      </div>

      <div className="detail-body">
        <p className="detail-kicker">
          {place.category}
          <span aria-hidden="true"> · </span>
          {score > 0 ? (
            <RatingPill value={score} />
          ) : (
            <span className="chip chip--trait">Belum direview</span>
          )}
        </p>
        <h1 className="detail-title">{place.name}</h1>
        <p className="detail-price">{place.priceRange}</p>

        <div className="detail-badges">
          {isPersonal && <span className="chip chip--hidden">Hidden gem</span>}
          {qualifies && (
            <span className="chip chip--done">
              Tampil di Rekomendasi (min. {RECOMMENDATION_MIN_SCORE.toFixed(1)})
            </span>
          )}
        </div>

        <p className="detail-desc">{place.description || 'Belum ada catatan tentang resto ini.'}</p>

        <div className="info-grid">
          <div className="info-cell">
            <Clock size={17} aria-hidden="true" />
            <span>Jam buka</span>
            <strong>{place.openHours || 'Belum dicatat'}</strong>
          </div>
          <div className="info-cell">
            <MapPin size={17} aria-hidden="true" />
            <span>Patokan</span>
            <strong>{place.landmark || 'Belum dicatat'}</strong>
          </div>
        </div>

        {place.signatureMenus.length > 0 && (
          <section className="panel">
            <h2 className="panel-title">
              <Utensils size={17} aria-hidden="true" />
              Menu andalan
            </h2>
            <ul className="menu-list">
              {place.signatureMenus.map((menu) => (
                <li key={menu.name}>
                  <span>{menu.name}</span>
                  <span className="menu-dots" aria-hidden="true" />
                  <strong>{menu.price}</strong>
                </li>
              ))}
            </ul>
          </section>
        )}

        {visit ? (
          <ReviewSummary visit={visit} onEdit={() => setReviewOpen(true)} />
        ) : (
          <section className="review-empty">
            <span className="review-empty-icon">
              <ReceiptText size={20} aria-hidden="true" />
            </span>
            <div>
              <h2>Belum pernah dicatat</h2>
              <p>
                Catat menu dan nominal yang kamu beli, lalu beri nilai enak, murah, dan
                lingkungan.
              </p>
            </div>
            <button
              type="button"
              className="btn btn--primary btn--sm"
              onClick={() => setReviewOpen(true)}
            >
              Catat sekarang
            </button>
          </section>
        )}

        {isPersonal && (
          <section className="panel place-manage">
            <h2 className="panel-title">Kelola resto ini</h2>
            <p className="panel-note">
              Resto pribadi bisa diedit atau dihapus. Review yang tersimpan ikut terhapus.
            </p>
            <div className="place-manage-actions">
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => setEditOpen(true)}
              >
                <Pencil size={15} aria-hidden="true" />
                Edit resto
              </button>
              <button
                type="button"
                className="btn btn--danger-soft btn--sm"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 size={15} aria-hidden="true" />
                Hapus resto
              </button>
            </div>
          </section>
        )}
      </div>

      <ReviewFormModal
        open={reviewOpen}
        place={place}
        initialVisit={visit}
        onClose={() => setReviewOpen(false)}
        onSaved={() => notify('Review tersimpan.')}
      />

      <PlaceFormModal
        open={editOpen}
        initialPlace={place}
        onClose={() => setEditOpen(false)}
        onSaved={() => notify('Informasi resto diperbarui.')}
      />

      <ConfirmModal
        open={deleteOpen}
        title="Hapus resto ini?"
        message={`"${place.name}" akan dihapus dari Resto Saya beserta reviewnya. Tindakan ini tidak bisa dibatalkan.`}
        confirmLabel="Hapus resto"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </article>
  )
}
