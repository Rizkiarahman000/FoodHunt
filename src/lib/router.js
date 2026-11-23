import { createElement, useCallback, useEffect, useState } from 'react'

// ---------------------------------------------------------------------------
// router.js : router kecil berbasis History API.
//
// Rute: /, /foods, /foods/:id, /areas, /areas/:id, /huntlist, /profile.
// Vercel me-rewrite semua path ke index.html supaya deep link tetap jalan.
// ---------------------------------------------------------------------------

const NAVIGATE_EVENT = 'foodhunt:navigate'

function readLocation() {
  if (typeof window === 'undefined') {
    return { path: '/', search: '', query: new URLSearchParams() }
  }
  return {
    path: window.location.pathname,
    search: window.location.search,
    query: new URLSearchParams(window.location.search),
  }
}

export function navigate(to, { replace = false, scroll = true } = {}) {
  if (typeof window === 'undefined') return
  const target = new URL(to, window.location.origin)
  const current = window.location.pathname + window.location.search
  const next = target.pathname + target.search

  if (next === current) {
    if (scroll) window.scrollTo(0, 0)
    return
  }

  if (replace) window.history.replaceState(null, '', next)
  else window.history.pushState(null, '', next)

  window.dispatchEvent(new Event(NAVIGATE_EVENT))
  if (scroll) window.scrollTo(0, 0)
}

export function useRoute() {
  const [route, setRoute] = useState(readLocation)

  useEffect(() => {
    const update = () => setRoute(readLocation())
    window.addEventListener('popstate', update)
    window.addEventListener(NAVIGATE_EVENT, update)
    return () => {
      window.removeEventListener('popstate', update)
      window.removeEventListener(NAVIGATE_EVENT, update)
    }
  }, [])

  return route
}

export function Link({ to, onClick, children, ...rest }) {
  const handleClick = useCallback(
    (event) => {
      if (onClick) onClick(event)
      if (event.defaultPrevented) return
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      if (event.button !== 0) return
      if (!to || /^(https?:|mailto:|tel:)/i.test(to)) return
      event.preventDefault()
      navigate(to)
    },
    [onClick, to],
  )

  return createElement('a', { href: to, onClick: handleClick, ...rest }, children)
}
