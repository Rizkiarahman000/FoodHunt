// ---------------------------------------------------------------------------
// Kategori kuliner. Nilai `id` harus sama dengan kolom foods.category.
// ---------------------------------------------------------------------------

export const CATEGORIES = [
  'Semua',
  'Makan Berat',
  'Burjo & Mie',
  'Kopi & Nugas',
  'Jajanan Malam',
]

export const SORT_OPTIONS = [
  { id: 'rating', label: 'Rating tertinggi' },
  { id: 'cheapest', label: 'Termurah' },
]

export function sortFoods(foods, sort) {
  const rows = [...foods]
  if (sort === 'cheapest') return rows.sort((a, b) => a.minPrice - b.minPrice)
  return rows.sort((a, b) => b.rating - a.rating || a.minPrice - b.minPrice)
}
