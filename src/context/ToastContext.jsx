import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react'
import { AlertCircle, CheckCircle2 } from 'lucide-react'

const ToastCtx = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)

  const notify = useCallback((message, tone = 'success') => {
    setToast({ message, tone })
    window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => setToast(null), 3200)
  }, [])

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  return (
    <ToastCtx.Provider value={notify}>
      {children}
      {toast && (
        <div className={`toast toast--${toast.tone}`} role="status" aria-live="polite">
          {toast.tone === 'error' ? (
            <AlertCircle size={17} aria-hidden="true" />
          ) : (
            <CheckCircle2 size={17} aria-hidden="true" />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </ToastCtx.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastCtx)
  if (!ctx) throw new Error('useToast harus dipakai di dalam ToastProvider')
  return ctx
}
