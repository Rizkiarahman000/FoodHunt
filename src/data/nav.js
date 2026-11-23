import { Compass, Home, ReceiptText, Store, UserRound } from 'lucide-react'

// ---------------------------------------------------------------------------
// Satu daftar navigasi untuk bottom nav (mobile) dan side nav (desktop).
// ---------------------------------------------------------------------------

export const NAV_TABS = [
  { href: '/', label: 'Beranda', icon: Home, exact: true },
  { href: '/foods', label: 'Rekomendasi', icon: Compass },
  { href: '/resto', label: 'Resto Saya', icon: Store },
  { href: '/riwayat', label: 'Pernah Beli', icon: ReceiptText },
  { href: '/profile', label: 'Profil', icon: UserRound },
]

export default NAV_TABS
