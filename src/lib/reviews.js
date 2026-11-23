// ---------------------------------------------------------------------------
// reviews.js: aturan dan perhitungan review "pernah beli".
// ---------------------------------------------------------------------------

export const SCORE_FIELDS = [
  { key: 'taste', label: 'Enak', hint: 'Rasa dan porsi' },
  { key: 'affordability', label: 'Murah', hint: 'Harga dibanding porsi' },
  { key: 'environment', label: 'Lingkungan', hint: 'Suasana dan kebersihan' },
]

// Hidden gem baru ikut tampil di Rekomendasi kalau rata-ratanya minimal 4.0.
export const RECOMMENDATION_MIN_SCORE = 4

export function visitAverage(visit) {
  if (!visit) return 0
  const taste = Number(visit.taste) || 0
  const affordability = Number(visit.affordability) || 0
  const environment = Number(visit.environment) || 0
  return Number(((taste + affordability + environment) / 3).toFixed(1))
}

export function effectiveScore(place, visit) {
  if (!place) return 0
  if (place.source === 'personal') return visitAverage(visit)
  return Number(place.rating) || 0
}

export function qualifiesForRecommendation(place, visit) {
  return Boolean(
    place &&
      place.source === 'personal' &&
      visit &&
      visitAverage(visit) >= RECOMMENDATION_MIN_SCORE,
  )
}

export function scoreLabel(value) {
  const score = Number(value)
  if (score >= 5) return 'Banget'
  if (score >= 4) return 'Bagus'
  if (score >= 3) return 'Lumayan'
  if (score >= 2) return 'Kurang'
  if (score >= 1) return 'Jauh dari cukup'
  return 'Belum dipilih'
}

export function formatDate(value) {
  if (!value) return ''
  const date = new Date(`${value}T00:00:00`)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function todayISO() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}
