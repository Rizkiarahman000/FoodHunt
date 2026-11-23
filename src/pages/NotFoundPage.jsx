import { Compass } from 'lucide-react'
import { CatalogLink, EmptyState } from '../components/StateViews'
import { Link } from '../lib/router'

export default function NotFoundPage() {
  return (
    <div className="page">
      <EmptyState
        as="h1"
        icon={Compass}
        title="Halaman tidak ditemukan"
        message="Alamat yang kamu buka tidak ada di FoodHunt. Kembali ke beranda atau cari tempat makan lain."
        action={
          <div className="state-actions">
            <CatalogLink label="Buka katalog" />
            <Link className="btn btn--ghost" to="/">
              Ke beranda
            </Link>
          </div>
        }
      />
    </div>
  )
}
