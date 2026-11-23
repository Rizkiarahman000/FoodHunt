// ---------------------------------------------------------------------------
// platform.js : deteksi platform untuk alur pemasangan PWA.
// iOS tidak mendukung beforeinstallprompt, jadi perlu petunjuk manual
// (Safari > Bagikan > Tambahkan ke Layar Utama).
// ---------------------------------------------------------------------------

export function isIOS() {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent || ''
  const iOSDevice = /iPad|iPhone|iPod/.test(ua)
  // iPadOS 13+ melaporkan dirinya sebagai MacIntel.
  const iPadOS = navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1
  return iOSDevice || iPadOS
}

export function isStandalone() {
  if (typeof window === 'undefined') return false
  const displayMode = window.matchMedia?.('(display-mode: standalone)').matches
  return Boolean(displayMode || window.navigator.standalone === true)
}

export default { isIOS, isStandalone }
