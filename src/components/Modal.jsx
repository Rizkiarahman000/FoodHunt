import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

// ---------------------------------------------------------------------------
// Modal: dialog native untuk form. Escape, focus trap, dan backdrop
// ditangani browser.
// ---------------------------------------------------------------------------

export default function Modal({
  open,
  title,
  description,
  onClose,
  children,
  wide = false,
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
      className={`modal${wide ? ' modal--wide' : ''}`}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose()
      }}
    >
      {open && (
        <div className="modal-card">
          <div className="modal-head">
            <div>
              <h2>{title}</h2>
              {description && <p>{description}</p>}
            </div>
            <button
              type="button"
              className="icon-btn modal-close"
              onClick={onClose}
              aria-label="Tutup"
            >
              <X size={17} aria-hidden="true" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
