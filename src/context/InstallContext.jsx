import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { isIOS, isStandalone } from '../lib/platform'

// ---------------------------------------------------------------------------
// InstallProvider : menangkap beforeinstallprompt lebih awal supaya tombol
// "Pasang" di Beranda dan Profil memakai event yang sama.
// ---------------------------------------------------------------------------

const InstallCtx = createContext(null)

export function InstallProvider({ children }) {
  const [promptEvent, setPromptEvent] = useState(null)
  const [installed, setInstalled] = useState(() => isStandalone())
  const [ios] = useState(isIOS)

  useEffect(() => {
    const handleBeforeInstall = (event) => {
      event.preventDefault()
      setPromptEvent(event)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setPromptEvent(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  const promptInstall = useCallback(async () => {
    if (!promptEvent) return 'unavailable'
    promptEvent.prompt()
    const choice = await promptEvent.userChoice
    setPromptEvent(null)
    if (choice.outcome === 'accepted') {
      setInstalled(true)
      return 'accepted'
    }
    return 'dismissed'
  }, [promptEvent])

  const value = useMemo(
    () => ({
      canInstall: Boolean(promptEvent) && !installed,
      installed,
      isIOS: ios,
      standalone: isStandalone(),
      promptInstall,
    }),
    [promptEvent, installed, ios, promptInstall],
  )

  return <InstallCtx.Provider value={value}>{children}</InstallCtx.Provider>
}

export function useInstall() {
  const ctx = useContext(InstallCtx)
  if (!ctx) throw new Error('useInstall harus dipakai di dalam InstallProvider')
  return ctx
}
