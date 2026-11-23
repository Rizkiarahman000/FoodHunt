import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import placeService from '../services/placeService'
import { IS_CONFIGURED } from '../config/api'
import { readStore, writeStore } from '../lib/storage'
import { configMessage, dataErrorMessage } from '../lib/errors'

// ---------------------------------------------------------------------------
// PlacesProvider: semua resto (kurasi dan resto pribadi).
// Data di-cache supaya katalog dan resto saya tetap terbaca saat offline.
// ---------------------------------------------------------------------------

const CACHE_KEY = 'foodhunt.cache.places'

const PlacesCtx = createContext(null)

function readCache() {
  const cached = readStore(CACHE_KEY, [])
  return Array.isArray(cached) ? cached : []
}

export function PlacesProvider({ children }) {
  const [places, setPlaces] = useState(readCache)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const placesRef = useRef(places)

  const commit = useCallback((next) => {
    placesRef.current = next
    setPlaces(next)
    writeStore(CACHE_KEY, next)
  }, [])

  const refresh = useCallback(async () => {
    if (!IS_CONFIGURED) {
      setError({ message: configMessage(), kind: 'config' })
      setLoading(false)
      return
    }

    try {
      setLoading(placesRef.current.length === 0)
      const rows = await placeService.list()
      commit(rows)
      setError(null)
    } catch (err) {
      setError({ message: dataErrorMessage(err), kind: 'data' })
    } finally {
      setLoading(false)
    }
  }, [commit])

  useEffect(() => {
    refresh()
  }, [refresh])

  useEffect(() => {
    const handleOnline = () => refresh()
    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [refresh])

  const createPlace = useCallback(
    async (data) => {
      const place = await placeService.create(data)
      commit([place, ...placesRef.current])
      return place
    },
    [commit],
  )

  const updatePlace = useCallback(
    async (id, data) => {
      const place = await placeService.update(id, data)
      if (place) {
        commit(placesRef.current.map((item) => (item.id === id ? place : item)))
      }
      return place
    },
    [commit],
  )

  const removePlace = useCallback(
    async (id) => {
      await placeService.remove(id)
      commit(placesRef.current.filter((item) => item.id !== id))
    },
    [commit],
  )

  const getPlace = useCallback(
    (id) => placesRef.current.find((place) => place.id === id) || null,
    [],
  )

  const curatedPlaces = useMemo(
    () =>
      places
        .filter((place) => place.source === 'curated')
        .sort((a, b) => b.rating - a.rating || a.name.localeCompare(b.name, 'id')),
    [places],
  )

  const personalPlaces = useMemo(
    () =>
      places
        .filter((place) => place.source === 'personal')
        .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || '')),
    [places],
  )

  const areas = useMemo(() => {
    const unique = new Set()
    places.forEach((place) => {
      if (place.areaName) unique.add(place.areaName)
    })
    return [...unique].sort((a, b) => a.localeCompare(b, 'id'))
  }, [places])

  const value = useMemo(
    () => ({
      places,
      curatedPlaces,
      personalPlaces,
      areas,
      loading,
      error,
      refresh,
      createPlace,
      updatePlace,
      removePlace,
      getPlace,
    }),
    [
      places,
      curatedPlaces,
      personalPlaces,
      areas,
      loading,
      error,
      refresh,
      createPlace,
      updatePlace,
      removePlace,
      getPlace,
    ],
  )

  return <PlacesCtx.Provider value={value}>{children}</PlacesCtx.Provider>
}

export function usePlaces() {
  const ctx = useContext(PlacesCtx)
  if (!ctx) throw new Error('usePlaces harus dipakai di dalam PlacesProvider')
  return ctx
}
