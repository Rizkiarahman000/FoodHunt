import { useEffect, useMemo, useState } from 'react'
import { Compass, ListFilter, SlidersHorizontal } from 'lucide-react'
import CategoryPills from '../components/CategoryPills'
import PlaceRow from '../components/PlaceRow'
import SearchField from '../components/SearchField'
import { EmptyState, ErrorState, LoadingList } from '../components/StateViews'
import { usePlaces } from '../context/PlacesContext'
import { useVisits } from '../context/VisitsContext'
import { SORT_OPTIONS } from '../data/categories'
import { Link, navigate, useRoute } from '../lib/router'
import {
  RECOMMENDATION_MIN_SCORE,
  effectiveScore,
  qualifiesForRecommendation,
} from '../lib/reviews'

const SOURCE_OPTIONS = [
  { id: 'all', label: 'Semua' },
  { id: 'curated', label: 'Pilihan' },
  { id: 'hidden', label: 'Hidden gem' },
]

export default function FoodsPage() {
  const { curatedPlaces, personalPlaces, loading, error, refresh } = usePlaces()
  const { getVisit } = useVisits()
  const route = useRoute()
  const queryParam = route.query.get('q') || ''
  const categoryParam = route.query.get('category') || 'Semua'

  const [search, setSearch] = useState(queryParam)
  const [category, setCategory] = useState(categoryParam)
  const [source, setSource] = useState('all')
  const [sort, setSort] = useState('rating')

  useEffect(() => setSearch(queryParam), [queryParam])
  useEffect(() => setCategory(categoryParam), [categoryParam])

  const hiddenGems = useMemo(
    () =>
      personalPlaces.filter((place) =>
        qualifiesForRecommendation(place, getVisit(place.id)),
      ),
    [personalPlaces, getVisit],
  )

  const rows = useMemo(() => {
    let base = [...curatedPlaces]
    if (source === 'all') base = [...curatedPlaces, ...hiddenGems]
    if (source === 'hidden') base = [...hiddenGems]
    if (source === 'curated') base = [...curatedPlaces]

    const needle = search.trim().toLowerCase()
    const filtered = base.filter((place) => {
      if (category !== 'Semua' && place.category !== category) return false
      if (!needle) return true
      return [place.name, place.areaName, place.category, place.description]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })

    if (sort === 'cheapest') {
      return filtered.sort(
        (a, b) => (a.minPrice || Number.MAX_SAFE_INTEGER) - (b.minPrice || Number.MAX_SAFE_INTEGER),
      )
    }

    return filtered.sort(
      (a, b) =>
        effectiveScore(b, getVisit(b.id)) - effectiveScore(a, getVisit(a.id)) ||
        a.name.localeCompare(b.name, 'id'),
    )
  }, [curatedPlaces, hiddenGems, source, category, search, sort, getVisit])

  const isCold = loading && curatedPlaces.length === 0 && personalPlaces.length === 0
  const isFiltered = category !== 'Semua' || search.trim().length > 0 || source !== 'all'
  const baseCount = source === 'hidden' ? hiddenGems.length : source === 'curated' ? curatedPlaces.length : curatedPlaces.length + hiddenGems.length

  const applyCategory = (next) => {
    setCategory(next)
    const params = new URLSearchParams(route.search)
    if (next === 'Semua') params.delete('category')
    else params.set('category', next)
    const suffix = params.toString()
    navigate(suffix ? `/foods?${suffix}` : '/foods', { replace: true, scroll: false })
  }

  const applySearch = () => {
    const params = new URLSearchParams()
    if (search.trim()) params.set('q', search.trim())
    if (category !== 'Semua') params.set('category', category)
    const suffix = params.toString()
    navigate(suffix ? `/foods?${suffix}` : '/foods', { replace: true, scroll: false })
  }

  const resetFilters = () => {
    setSearch('')
    setCategory('Semua')
    setSource('all')
    navigate('/foods', { replace: true, scroll: false })
  }

  return (
    <div className="page">
      <header className="page-head">
        <p className="page-eyebrow">Rekomendasi</p>
        <h1 className="page-title">Kuliner pilihan Tembalang</h1>
        <p className="page-sub">
          Kurasi tempat makan sekitar kampus. Hidden gem milikmu ikut muncul kalau rata-rata
          reviewnya minimal {RECOMMENDATION_MIN_SCORE.toFixed(1)}.
        </p>
      </header>

      <SearchField
        value={search}
        onChange={setSearch}
        onSubmit={applySearch}
        placeholder="Cari resto, menu, atau kawasan"
      />

      <CategoryPills value={category} onChange={applyCategory} />

      <div className="segmented segmented--three" role="group" aria-label="Jenis rekomendasi">
        {SOURCE_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={source === option.id ? 'is-active' : ''}
            aria-pressed={source === option.id}
            onClick={() => setSource(option.id)}
          >
            {option.label}{' '}
            <span>
              {option.id === 'curated'
                ? curatedPlaces.length
                : option.id === 'hidden'
                  ? hiddenGems.length
                  : curatedPlaces.length + hiddenGems.length}
            </span>
          </button>
        ))}
      </div>

      <div className="toolbar">
        <p className="result-meta">
          <ListFilter size={15} aria-hidden="true" />
          {isCold ? 'Memuat…' : `${rows.length} dari ${baseCount} resto`}
        </p>
        <label className="select-wrap">
          <SlidersHorizontal size={15} aria-hidden="true" />
          <span className="sr-only">Urutkan hasil</span>
          <select
            id="foods-sort"
            name="sort"
            value={sort}
            onChange={(event) => setSort(event.target.value)}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {isCold ? (
        <LoadingList count={4} label="Memuat rekomendasi" />
      ) : error && curatedPlaces.length === 0 && personalPlaces.length === 0 ? (
        <ErrorState message={error.message} config={error.kind === 'config'} onRetry={refresh} />
      ) : rows.length === 0 ? (
        source === 'hidden' && hiddenGems.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="Belum ada hidden gem yang lolos"
            message={`Resto pribadi masuk rekomendasi kalau rata-rata reviewnya minimal ${RECOMMENDATION_MIN_SCORE.toFixed(1)}. Tambah resto dan beri review dulu.`}
            action={
              <Link to="/resto" className="btn btn--primary">
                Buka Resto Saya
              </Link>
            }
          />
        ) : (
          <EmptyState
            title={isFiltered ? 'Tidak ada yang cocok' : 'Belum ada rekomendasi'}
            message={
              isFiltered
                ? 'Coba kata kunci lain atau hapus filter yang sedang aktif.'
                : 'Belum ada resto kurasi di database. Jalankan seed di supabase/schema.sql.'
            }
            action={
              isFiltered ? (
                <button type="button" className="btn btn--primary" onClick={resetFilters}>
                  Hapus filter
                </button>
              ) : null
            }
          />
        )
      ) : (
        <div className="list">
          {rows.map((place) => (
            <PlaceRow key={place.id} place={place} visit={getVisit(place.id)} />
          ))}
        </div>
      )}
    </div>
  )
}
