import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import visitService from '../services/visitService'
import { IS_CONFIGURED } from '../config/api'
import { readStore, writeStore } from '../lib/storage'
import { configMessage, dataErrorMessage } from '../lib/errors'
import { visitAverage } from '../lib/reviews'

// ---------------------------------------------------------------------------
// VisitsProvider: catatan pernah beli dan review (satu review per resto).
// ---------------------------------------------------------------------------

const CACHE_KEY = 'foodhunt.cache.visits'

const VisitsCtx = createContext(null)

function readCache() {
  const cached = readStore(CACHE_KEY, [])
  return Array.isArray(cached) ? cached : []
}

export function VisitsProvider({ children }) {
  const [visits, setVisits] = useState(readCache)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const visitsRef = useRef(visits)

  const commit = useCallback((next) => {
    visitsRef.current = next
    setVisits(next)
    writeStore(CACHE_KEY, next)
  }, [])

  const refresh = useCallback(async () => {
    if (!IS_CONFIGURED) {
      setError({ message: configMessage(), kind: 'config' })
      setLoading(false)
      return
    }

    try {
      setLoading(visitsRef.current.length === 0)
      const rows = await visitService.list()
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

  const saveVisit = useCallback(
    async (data) => {
      const row = data.id
        ? await visitService.update(data.id, data)
        : await visitService.create(data)
      if (row) {
        const exists = visitsRef.current.some((visit) => visit.id === row.id)
        commit(
          exists
            ? visitsRef.current.map((visit) => (visit.id === row.id ? row : visit))
            : [row, ...visitsRef.current],
        )
      }
      return row
    },
    [commit],
  )

  const removeVisit = useCallback(
    async (id) => {
      await visitService.remove(id)
      commit(visitsRef.current.filter((visit) => visit.id !== id))
    },
    [commit],
  )

  const removeForPlace = useCallback(
    (placeId) => {
      commit(visitsRef.current.filter((visit) => visit.placeId !== placeId))
    },
    [commit],
  )

  const getVisit = useCallback(
    (placeId) => visitsRef.current.find((visit) => visit.placeId === placeId) || null,
    [],
  )

  const stats = useMemo(() => {
    const total = visits.length
    if (total === 0) {
      return {
        total: 0,
        taste: 0,
        affordability: 0,
        environment: 0,
        average: 0,
      }
    }

    const sum = visits.reduce(
      (acc, visit) => ({
        taste: acc.taste + visit.taste,
        affordability: acc.affordability + visit.affordability,
        environment: acc.environment + visit.environment,
        average: acc.average + visitAverage(visit),
      }),
      { taste: 0, affordability: 0, environment: 0, average: 0 },
    )

    return {
      total,
      taste: Number((sum.taste / total).toFixed(1)),
      affordability: Number((sum.affordability / total).toFixed(1)),
      environment: Number((sum.environment / total).toFixed(1)),
      average: Number((sum.average / total).toFixed(1)),
    }
  }, [visits])

  const value = useMemo(
    () => ({
      visits,
      loading,
      error,
      refresh,
      saveVisit,
      removeVisit,
      removeForPlace,
      getVisit,
      stats,
    }),
    [visits, loading, error, refresh, saveVisit, removeVisit, removeForPlace, getVisit, stats],
  )

  return <VisitsCtx.Provider value={value}>{children}</VisitsCtx.Provider>
}

export function useVisits() {
  const ctx = useContext(VisitsCtx)
  if (!ctx) throw new Error('useVisits harus dipakai di dalam VisitsProvider')
  return ctx
}
