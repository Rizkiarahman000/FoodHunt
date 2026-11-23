import { DownloadCloud } from 'lucide-react'
import { useUpdate } from '../context/UpdateContext'

export default function UpdateBanner() {
  const { needRefresh, updateServiceWorker } = useUpdate()
  if (!needRefresh) return null

  return (
    <div className="update-banner" role="status">
      <span>Versi baru FoodHunt sudah tersedia.</span>
      <button
        type="button"
        className="btn btn--primary btn--sm"
        onClick={() => updateServiceWorker(true)}
      >
        <DownloadCloud size={15} aria-hidden="true" />
        Perbarui
      </button>
    </div>
  )
}
