import { AlertTriangle, RefreshCw, SearchX } from 'lucide-react'
import { Link } from '../lib/router'

export function LoadingList({ count = 3, label = 'Memuat data' }) {
  return (
    <div className="list" aria-busy="true" aria-live="polite">
      <span className="sr-only">{label}</span>
      {Array.from({ length: count }).map((_, index) => (
        <div className="skeleton-row" key={index} aria-hidden="true">
          <div className="skeleton skeleton-img" />
          <div className="skeleton-lines">
            <div className="skeleton skeleton-line skeleton-line--short" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line--mid" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ErrorState({
  title = 'Data belum bisa dimuat',
  message,
  onRetry,
  config = false,
}) {
  return (
    <div className="state-box state-box--error">
      <span className="state-icon">
        <AlertTriangle size={22} aria-hidden="true" />
      </span>
      <h2>{title}</h2>
      <p>{message}</p>
      {config && (
        <ol className="setup-steps">
          <li>Buat project di Supabase, lalu buka SQL Editor.</li>
          <li>
            Jalankan <code>supabase/schema.sql</code> sampai selesai.
          </li>
          <li>
            Isi <code>VITE_API_BASE_URL</code> dan{' '}
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code> di <code>.env</code>, lalu muat
            ulang halaman.
          </li>
        </ol>
      )}
      {onRetry && (
        <button type="button" className="btn btn--primary" onClick={onRetry}>
          <RefreshCw size={16} aria-hidden="true" />
          Coba lagi
        </button>
      )}
    </div>
  )
}

export function EmptyState({
  title,
  message,
  action,
  icon: Icon = SearchX,
  as: Heading = 'h2',
}) {
  return (
    <div className="state-box">
      <span className="state-icon state-icon--quiet">
        <Icon size={22} aria-hidden="true" />
      </span>
      <Heading className="state-title">{title}</Heading>
      <p>{message}</p>
      {action}
    </div>
  )
}

export function CatalogLink({ label = 'Buka katalog kuliner' }) {
  return (
    <Link to="/foods" className="btn btn--primary">
      {label}
    </Link>
  )
}
