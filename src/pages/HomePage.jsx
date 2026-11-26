import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  Download,
  Plus,
  Store,
  UtensilsCrossed,
} from 'lucide-react'
import CategoryPills from '../components/CategoryPills'
import FoodImage from '../components/FoodImage'
import PlaceTile from '../components/PlaceTile'
import RecordBanner from '../components/RecordBanner'
import SearchField from '../components/SearchField'
import { ErrorState, LoadingList } from '../components/StateViews'
import { useInstall } from '../context/InstallContext'
import { usePlaces } from '../context/PlacesContext'
import { useToast } from '../context/ToastContext'
import { useVisits } from '../context/VisitsContext'
import { PROFILE } from '../data/profile'
import { greeting } from '../lib/format'
import { Link, navigate } from '../lib/router'
import { SCORE_FIELDS, formatDate, visitAverage } from '../lib/reviews'

export default function HomePage() {
  const { curatedPlaces, personalPlaces, getPlace, loading, error, refresh } = usePlaces()
  const { visits, getVisit, stats } = useVisits()
  const { installed, promptInstall, installGuide } = useInstall()
  const notify = useToast()
  const [query, setQuery] = useState('')

  const isCold = loading && curatedPlaces.length === 0 && personalPlaces.length === 0
  const topCurated = useMemo(() => curatedPlaces.slice(0, 4), [curatedPlaces])
  const topPersonal = useMemo(() => personalPlaces.slice(0, 4), [personalPlaces])

  const recentVisits = useMemo(
    () =>
      visits
        .slice(0, 2)
        .map((visit) => ({ visit, place: getPlace(visit.placeId) }))
        .filter((item) => item.place),
    [visits, getPlace],
  )

  const openFoods = (value) => {
    const trimmed = (value || '').trim()
    navigate(trimmed ? `/foods?q=${encodeURIComponent(trimmed)}` : '/foods')
  }

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result === 'accepted') notify('FoodHunt dipasang di layar utama.')
    if (result === 'unavailable') notify(installGuide, 'error')
  }

  return (
    <div className="page page--home">
      <header className="home-hero">
        <div className="hero-top">
          <div className="brand">
            <span className="brand-mark">
              <UtensilsCrossed size={19} aria-hidden="true" />
            </span>
            <span className="brand-name">
              FoodHunt
              <small>Buruan kuliner Tembalang</small>
            </span>
          </div>

          {installed ? (
            <span className="status-chip is-ready">
              <CheckCircle2 size={14} aria-hidden="true" />
              Terpasang
            </span>
          ) : (
            <button type="button" className="status-chip is-action" onClick={handleInstall}>
              <Download size={14} aria-hidden="true" />
              Pasang
            </button>
          )}
        </div>

        <p className="greeting">
          {greeting()}, {PROFILE.name.split(' ')[0]}
        </p>
        <h1 className="home-title">Mau makan apa hari ini?</h1>

        <SearchField
          value={query}
          onChange={setQuery}
          onSubmit={() => openFoods(query)}
          placeholder="Cari penyetan, burjo, kopi..."
        />

        <CategoryPills
          value="Semua"
          onChange={(category) =>
            navigate(
              category === 'Semua'
                ? '/foods'
                : `/foods?category=${encodeURIComponent(category)}`,
            )
          }
        />
      </header>

      <RecordBanner />

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Rekomendasi pilihan</h2>
            <p className="section-sub">Kurasi tempat makan di sekitar kampus</p>
          </div>
          <Link to="/foods" className="section-link">
            Semua rekomendasi
          </Link>
        </div>

        {isCold ? (
          <LoadingList count={2} label="Memuat rekomendasi" />
        ) : error && curatedPlaces.length === 0 && personalPlaces.length === 0 ? (
          <ErrorState message={error.message} config={error.kind === 'config'} onRetry={refresh} />
        ) : topCurated.length === 0 ? (
          <p className="section-empty">Belum ada rekomendasi di database.</p>
        ) : (
          <div className="tile-scroller">
            {topCurated.map((place, index) => (
              <PlaceTile
                key={place.id}
                place={place}
                visit={getVisit(place.id)}
                priority={index === 0}
              />
            ))}
          </div>
        )}
      </section>

      <section className="section">
        <div className="section-head">
          <div>
            <h2>Resto saya</h2>
            <p className="section-sub">Hidden gem yang kamu temukan sendiri</p>
          </div>
          <Link to="/resto" className="section-link">
            Kelola resto
          </Link>
        </div>

        {topPersonal.length > 0 ? (
          <div className="tile-scroller">
            {topPersonal.map((place) => (
              <PlaceTile
                key={place.id}
                place={place}
                visit={getVisit(place.id)}
              />
            ))}
          </div>
        ) : (
          <Link to="/resto" className="add-resto-card">
            <span className="add-resto-icon">
              <Plus size={19} aria-hidden="true" />
            </span>
            <div>
              <strong>Punya hidden gem?</strong>
              <p>Tambah resto sendiri, lalu review setelah membeli.</p>
            </div>
            <Store size={18} aria-hidden="true" />
          </Link>
        )}
      </section>

      {recentVisits.length > 0 && (
        <section className="section">
          <div className="section-head">
            <div>
              <h2>Review terakhir</h2>
              <p className="section-sub">Enak, murah, lingkungan</p>
            </div>
            <Link to="/riwayat" className="section-link">
              Semua catatan
            </Link>
          </div>
          <div className="home-reviews">
            {recentVisits.map(({ visit, place }) => (
              <Link key={visit.id} to={`/foods/${place.id}`} className="home-review">
                <FoodImage src={place.imageUrl} alt={place.name} className="home-review-img" />
                <div className="home-review-body">
                  <div className="home-review-head">
                    <h3>{place.name}</h3>
                    <span className="home-review-score">{visitAverage(visit).toFixed(1)}/5</span>
                  </div>
                  <p className="home-review-meta">
                    {formatDate(visit.purchasedAt)} · {place.areaName}
                  </p>
                  <div className="home-review-scores">
                    {SCORE_FIELDS.map((field) => (
                      <span key={field.key}>
                        {field.label} {visit[field.key]}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="home-footnote">
        {stats.total > 0
          ? `${stats.total} resto sudah pernah kamu beli dan review.`
          : 'Catat resto setelah membeli supaya penilaianmu tidak hilang.'}
      </p>
    </div>
  )
}
