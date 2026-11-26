import { useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  CloudUpload,
  Compass,
  Download,
  GraduationCap,
  IdCard,
  ReceiptText,
  RefreshCw,
  Share2,
  Smartphone,
  Store,
  Wifi,
  WifiOff,
} from 'lucide-react'
import RatingStars from '../components/RatingStars'
import { useInstall } from '../context/InstallContext'
import { usePlaces } from '../context/PlacesContext'
import { useToast } from '../context/ToastContext'
import { useUpdate } from '../context/UpdateContext'
import { useVisits } from '../context/VisitsContext'
import useOnline from '../hooks/useOnline'
import { PROFILE } from '../data/profile'
import { RECOMMENDATION_MIN_SCORE, SCORE_FIELDS } from '../lib/reviews'

export default function ProfilePage() {
  const { curatedPlaces, personalPlaces, error: placesError } = usePlaces()
  const { stats, error: visitsError } = useVisits()
  const online = useOnline()
  const notify = useToast()
  const { installed, isIOS, standalone, promptInstall, installGuide } = useInstall()
  const { needRefresh, updateServiceWorker, checkForUpdate, offlineReady } = useUpdate()
  const [checking, setChecking] = useState(false)

  const catalogError = placesError || visitsError
  const hasReviews = stats.total > 0

  const handleInstall = async () => {
    const result = await promptInstall()
    if (result === 'accepted') notify('FoodHunt dipasang di layar utama.')
    if (result === 'unavailable') notify(installGuide, 'error')
  }

  const handleUpdate = async () => {
    if (needRefresh) {
      await updateServiceWorker(true)
      return
    }
    setChecking(true)
    const result = await checkForUpdate()
    setChecking(false)
    if (result.ok) notify('Pemeriksaan selesai.')
    else notify('Gagal memeriksa pembaruan. Coba lagi saat online.', 'error')
  }

  return (
    <div className="page profile-page">
      <header className="page-head">
        <p className="page-eyebrow">Profil</p>
        <h1 className="page-title">Tentang FoodHunt</h1>
        <p className="page-sub">Identitas pembuat, status aplikasi, dan info teknis.</p>
      </header>

      <section className="profile-hero">
        <span className="avatar" aria-hidden="true">
          {PROFILE.initials}
        </span>
        <div>
          <h2>{PROFILE.name}</h2>
          <p className="profile-role">
            {PROFILE.program}, {PROFILE.faculty}
          </p>
          <div className="id-chips">
            <span className="id-chip">
              <IdCard size={14} aria-hidden="true" />
              NIM {PROFILE.nim}
            </span>
            <span className="id-chip">
              <GraduationCap size={14} aria-hidden="true" />
              Angkatan {PROFILE.batch}
            </span>
          </div>
        </div>
      </section>

      <section className="stats-grid" aria-label="Statistik aplikasi">
        <div className="stat-card">
          <span className="stat-icon">
            <Compass size={16} aria-hidden="true" />
          </span>
          <strong>{curatedPlaces.length}</strong>
          <span>Rekomendasi</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <Store size={16} aria-hidden="true" />
          </span>
          <strong>{personalPlaces.length}</strong>
          <span>Resto saya</span>
        </div>
        <div className="stat-card">
          <span className="stat-icon">
            <ReceiptText size={16} aria-hidden="true" />
          </span>
          <strong>{stats.total}</strong>
          <span>Pernah beli</span>
        </div>
      </section>

      <section className="panel profile-wide">
        <h2 className="panel-title">
          <ReceiptText size={17} aria-hidden="true" />
          Ringkasan review
        </h2>
        {hasReviews ? (
          <div className="profile-review-scores">
            {SCORE_FIELDS.map((field) => (
              <div key={field.key} className="profile-review-score">
                <span>{field.label}</span>
                <RatingStars
                  value={stats[field.key]}
                  label={`Rata-rata ${field.label} ${stats[field.key]} dari 5`}
                />
                <strong>{stats[field.key].toFixed(1)}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p className="panel-note">
            Belum ada review. Catat resto yang pernah kamu beli di tab Pernah Beli.
          </p>
        )}
      </section>

      <section className="panel">
        <h2 className="panel-title">Identitas</h2>
        <ul className="info-list">
          <li>
            <span>Nama</span>
            <strong>{PROFILE.name}</strong>
          </li>
          <li>
            <span>NIM</span>
            <strong>{PROFILE.nim}</strong>
          </li>
          <li>
            <span>Program studi</span>
            <strong>{PROFILE.program}</strong>
          </li>
          <li>
            <span>Universitas</span>
            <strong>{PROFILE.faculty}</strong>
          </li>
          <li>
            <span>Angkatan</span>
            <strong>{PROFILE.batch}</strong>
          </li>
        </ul>
      </section>

      <section className="panel">
        <h2 className="panel-title">
          <Smartphone size={17} aria-hidden="true" />
          Status aplikasi
        </h2>

        <div className="status-row">
          <span className={`conn-chip ${online ? 'is-online' : 'is-offline'}`}>
            <span className="conn-dot" aria-hidden="true" />
            {online ? 'Online' : 'Offline, memakai data tersimpan'}
          </span>
        </div>

        {catalogError && (
          <p className="panel-note is-warn">
            <AlertCircle size={15} aria-hidden="true" />
            {catalogError.message}
          </p>
        )}

        <div className="panel-block">
          <h3>Pasang di layar utama</h3>
          {installed ? (
            <p className="panel-note is-done">
              <CheckCircle2 size={15} aria-hidden="true" />
              FoodHunt sudah terpasang dan bisa dibuka tanpa browser.
            </p>
          ) : (
            <>
              <p className="panel-note">
                Pasang supaya FoodHunt bisa dibuka langsung dari layar utama, termasuk saat
                offline.
              </p>
              {isIOS && !standalone && (
                <p className="panel-note">
                  <Share2 size={15} aria-hidden="true" />
                  {installGuide}
                </p>
              )}
              <button type="button" className="btn btn--primary btn--sm" onClick={handleInstall}>
                <Download size={15} aria-hidden="true" />
                Pasang FoodHunt
              </button>
            </>
          )}
        </div>

        <div className="panel-block">
          <h3>Versi aplikasi</h3>
          <p className="panel-note">
            {PROFILE.appVersion}
            {offlineReady ? ' · aset offline siap' : ' · service worker aktif'}
          </p>
          <button
            type="button"
            className={`btn btn--sm ${needRefresh ? 'btn--primary' : 'btn--ghost'}`}
            onClick={handleUpdate}
            disabled={checking}
          >
            <RefreshCw size={15} className={checking ? 'spin' : ''} aria-hidden="true" />
            {needRefresh ? 'Perbarui sekarang' : checking ? 'Memeriksa…' : 'Cek pembaruan'}
          </button>
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Tentang FoodHunt</h2>
        <p className="about-text">{PROFILE.about}</p>
        <p className="about-version">
          Versi {PROFILE.appVersion} · {PROFILE.appTagline}
        </p>
        <p className="about-version">
          Resto pribadi masuk Rekomendasi jika rata-rata reviewnya minimal{' '}
          {RECOMMENDATION_MIN_SCORE.toFixed(1)}.
        </p>
        <div className="stack-chips" aria-label="Teknologi yang dipakai">
          {PROFILE.stack.map((item) => (
            <span key={item} className="chip chip--soft">
              {item}
            </span>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2 className="panel-title">Sumber data</h2>
        <p className="panel-note">
          Rekomendasi, resto pribadi, dan review disimpan di Supabase dan diakses lewat REST
          API PostgREST. Data kuliner di aplikasi ini adalah data contoh untuk keperluan tugas
          praktikum.
        </p>
        <div className="status-row">
          <span className="conn-chip">
            {online ? <Wifi size={14} aria-hidden="true" /> : <WifiOff size={14} aria-hidden="true" />}
            {online ? 'Koneksi tersedia' : 'Menunggu koneksi'}
          </span>
          <span className="sync-chip">
            <CloudUpload size={14} aria-hidden="true" />
            {stats.total} catatan
          </span>
        </div>
      </section>
    </div>
  )
}
