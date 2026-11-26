import { WifiOff } from 'lucide-react'
import useOnline from '../hooks/useOnline'

export default function OfflineBanner() {
  const online = useOnline()
  if (online) return null

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={15} aria-hidden="true" />
      <span>Mode offline. Data terakhir tetap bisa dibaca. Sambungkan internet dulu untuk menyimpan perubahan.</span>
    </div>
  )
}
