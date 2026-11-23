import { useEffect, useRef } from 'react'
import { Loader } from 'lucide-react'

// ---------------------------------------------------------------------------
// ConfirmModal : memakai <dialog> native supaya Escape, focus trap, dan
// backdrop sudah ditangani browser.
// ---------------------------------------------------------------------------

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Hapus',
  cancelLabel = 'Batal',
  danger = false,
  loading = false,
  onConfirm,
  onCancel,
}) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className="modal"
      onCancel={(event) => {
        event.preventDefault()
        if (!loading) onCancel()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current && !loading) onCancel()
      }}
    >
      {open && (
        <div className="modal-card">
          <h2>{title}</h2>
          <p>{message}</p>
          <div className="modal-actions">
            <button
              type="button"
              className="btn btn--ghost"
              onClick={onCancel}
              disabled={loading}
              autoFocus
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`}
              onClick={onConfirm}
              disabled={loading}
            >
              {loading && <Loader size={16} className="spin" aria-hidden="true" />}
              {confirmLabel}
            </button>
          </div>
        </div>
      )}
    </dialog>
  )
}
