import { useState } from 'react'
import { Plus, Store } from 'lucide-react'
import PlaceFormModal from '../components/PlaceFormModal'
import PlaceRow from '../components/PlaceRow'
import { EmptyState, ErrorState, LoadingList } from '../components/StateViews'
import { usePlaces } from '../context/PlacesContext'
import { useToast } from '../context/ToastContext'
import { useVisits } from '../context/VisitsContext'
import { RECOMMENDATION_MIN_SCORE } from '../lib/reviews'

export default function RestoPage() {
  const { personalPlaces, loading, error, refresh } = usePlaces()
  const { getVisit } = useVisits()
  const notify = useToast()
  const [addOpen, setAddOpen] = useState(false)

  const isCold = loading && personalPlaces.length === 0

  return (
    <div className="page">
      <div className="page-head-row">
        <header className="page-head">
          <p className="page-eyebrow">Resto Saya</p>
          <h1 className="page-title">Hidden gem temuanmu</h1>
          <p className="page-sub">
            Simpan resto yang kamu temukan sendiri. Setelah membeli, catat reviewnya di
            halaman detail.
          </p>
        </header>
        <button
          type="button"
          className="btn btn--primary btn--sm head-action"
          onClick={() => setAddOpen(true)}
        >
          <Plus size={16} aria-hidden="true" />
          Tambah resto
        </button>
      </div>

      <p className="info-note">
        Resto pribadi dengan rata-rata review minimal {RECOMMENDATION_MIN_SCORE.toFixed(1)}{' '}
        otomatis ikut tampil di tab Rekomendasi.
      </p>

      {isCold ? (
        <LoadingList count={3} label="Memuat resto saya" />
      ) : error && personalPlaces.length === 0 ? (
        <ErrorState message={error.message} config={error.kind === 'config'} onRetry={refresh} />
      ) : personalPlaces.length === 0 ? (
        <EmptyState
          icon={Store}
          title="Belum ada resto sendiri"
          message="Punya warung langganan yang belum ada di rekomendasi? Tambahkan di sini, lalu simpan catatan membelinya."
          action={
            <button type="button" className="btn btn--primary" onClick={() => setAddOpen(true)}>
              <Plus size={16} aria-hidden="true" />
              Tambah resto pertama
            </button>
          }
        />
      ) : (
        <>
          <p className="result-meta result-meta--standalone">
            {personalPlaces.length} resto tersimpan
          </p>
          <div className="list">
            {personalPlaces.map((place) => (
              <PlaceRow key={place.id} place={place} visit={getVisit(place.id)} />
            ))}
          </div>
        </>
      )}

      <PlaceFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => notify('Resto ditambahkan ke Resto Saya.')}
      />
    </div>
  )
}
