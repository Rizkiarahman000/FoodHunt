// ---------------------------------------------------------------------------
// storage.js : akses localStorage yang aman (mode privat / kuota penuh).
// ---------------------------------------------------------------------------

export function readStore(key, fallback) {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStore(key, value) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Penyimpanan penuh atau diblokir: aplikasi tetap jalan tanpa cache.
  }
}

export function removeStore(key) {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(key)
  } catch {
    // abaikan
  }
}
