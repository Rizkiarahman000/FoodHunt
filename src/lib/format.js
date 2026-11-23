// ---------------------------------------------------------------------------
// format.js : format angka dan sapaan.
// ---------------------------------------------------------------------------

export function formatRupiah(value) {
  const number = Number(value) || 0
  return `Rp${number.toLocaleString('id-ID')}`
}

export function greeting(date = new Date()) {
  const hour = date.getHours()
  if (hour < 4) return 'Selamat malam'
  if (hour < 11) return 'Selamat pagi'
  if (hour < 15) return 'Selamat siang'
  if (hour < 18) return 'Selamat sore'
  return 'Selamat malam'
}

export function makeId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return `hunt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export function shortNumber(value) {
  const number = Number(value) || 0
  return number > 99 ? '99+' : String(number)
}
