import { useMemo, useState } from 'react'
import { Plus, ReceiptText } from 'lucide-react'
import ConfirmModal from '../components/ConfirmModal'
import RatingStars from '../components/RatingStars'
import ReviewFormModal from '../components/ReviewFormModal'
import { EmptyState, ErrorState, LoadingList } from '../components/StateViews'
import VisitCard from '../components/VisitCard'
import { usePlaces } from '../context/PlacesContext'
import { useToast } from '../context/ToastContext'
import { useVisits } from '../context/VisitsContext'
import { mutationMessage } from '../lib/errors'
import { Link } from '../lib/router'
import { SCORE_FIELDS } from '../lib/reviews'

export default function VisitsPage() {
  const { places, getPlace, loading: placesLoading, error: placesError, refresh: refreshPlaces } =
    usePlaces()
  const { visits, loading, error, refresh, removeVisit, stats } = useVisits()
  const notify = useToast()

  const [addOpen, setAddOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const rows = useMemo(
    () =>
      visits
        .map((visit) => ({ visit, place: getPlace(visit.placeId) }))
        .filter((row) => row.place),
    [visits, getPlace],
  )

  const availablePlaces = useMemo(() => {
    const reviewed = new Set(visits.map((visit) => visit.placeId))
    return places.filter((place) => !reviewed.has(place.id))
  }, [places, visits])

  const isCold = rows.length === 0 && (loading || placesLoading)
  const activeError = error || placesError

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await removeVisit(deleteTarget.id)
      notify('Catatan pernah beli dihapus.')
      setDeleteTarget(null)
    } catch (err) {
      notify(mutationMessage(err, 'Catatan gagal dihapus. Coba lagi.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="page">
      <div className="page-head-row">
        <header className="page-head">
          <p className="page-eyebrow">Pernah Beli</p>
          <h1 className="page-title">Resto yang pernah dibeli</h1>
          <p className="page-sub">
            Catat menu yang kamu beli, nominalnya, lalu beri nilai enak, murah, dan
            lingkungan. Satu resto satu review.
          </p>
        </header>
        <button
          type="button"
          className="btn btn--primary btn--sm head-action"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} aria-hidden="true" />
          Catat resto
        </button>
      </div>

      {stats.total > 0 && (
        <section className="visit-summary" aria-label="Ringkasan review">
          <div className="visit-summary-total">
            <span>Total pernah beli</span>
            <strong>{stats.total}</strong>
            <p>resto</p>
          </div>
          <div className="visit-summary-scores">
            {SCORE_FIELDS.map((field) => (
              <div key={field.key} className="visit-summary-score">
                <span>{field.label}</span>
                <RatingStars
                  value={stats[field.key]}
                  label={`Rata-rata ${field.label} ${stats[field.key]} dari 5`}
                />
                <strong>{stats[field.key].toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="info-note">
        Review yang sudah ada bisa diedit. Cari restonya lewat tab Rekomendasi atau Resto
        Saya kalau kamu ingin melihat detailnya.
      </p>

      {isCold ? (
        <LoadingList count={3} label="Memuat catatan pernah beli" />
      ) : activeError && rows.length === 0 ? (
        <ErrorState
          message={activeError.message}
          config={activeError.kind === 'config'}
          onRetry={() => {
            refresh()
            refreshPlaces()
          }}
        />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={ReceiptText}
          title="Belum ada resto yang pernah dibeli"
          message="Setelah mampir dan membeli, catat restonya di sini. Kamu bisa memilih dari rekomendasi atau resto yang kamu tambahkan sendiri."
          action={
            <div className="state-actions">
              <button type="button" className="btn btn--primary" onClick={() => setAddOpen(true)}>
                <Plus size={16} aria-hidden="true" />
                Catat resto
              </button>
              <Link to="/foods" className="btn btn--ghost">
                Lihat rekomendasi
              </Link>
            </div>
          }
        />
      ) : (
        <div className="list">
          {rows.map(({ visit, place }) => (
            <VisitCard
              key={visit.id}
              visit={visit}
              place={place}
              onEdit={() => setEditing({ visit, place })}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      <ReviewFormModal
        open={addOpen}
        places={availablePlaces}
        onClose={() => setAddOpen(false)}
        onSaved={() => notify('Catatan pernah beli tersimpan.')}
      />

      <ReviewFormModal
        open={Boolean(editing)}
        place={editing?.place}
        initialVisit={editing?.visit}
        onClose={() => setEditing(null)}
        onSaved={() => notify('Review diperbarui.')}
      />

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Hapus catatan pernah beli?"
        message={
          deleteTarget
            ? `Review untuk "${getPlace(deleteTarget.placeId)?.name || 'resto ini'}" akan dihapus. Resto tetap ada di katalog.`
            : ''
        }
        confirmLabel="Hapus catatan"
        danger
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
