import { useEffect, useMemo, useState } from 'react'
import { Loader } from 'lucide-react'
import Modal from './Modal'
import RatingInput from './RatingInput'
import { useVisits } from '../context/VisitsContext'
import { mutationMessage } from '../lib/errors'
import { SCORE_FIELDS, todayISO } from '../lib/reviews'

const EMPTY_FORM = {
  placeId: '',
  itemName: '',
  amount: '',
  purchasedAt: todayISO(),
  taste: 0,
  affordability: 0,
  environment: 0,
  note: '',
}

export default function ReviewFormModal({
  open,
  place,
  places = [],
  initialVisit = null,
  onClose,
  onSaved,
}) {
  const { saveVisit } = useVisits()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const locked = Boolean(place) || Boolean(initialVisit)
  const lockedPlace = place || null

  useEffect(() => {
    if (!open) return
    setError('')
    setSaving(false)
    setForm(
      initialVisit
        ? {
            placeId: initialVisit.placeId,
            itemName: initialVisit.itemName,
            amount: initialVisit.amount == null ? '' : String(initialVisit.amount),
            purchasedAt: initialVisit.purchasedAt || todayISO(),
            taste: initialVisit.taste,
            affordability: initialVisit.affordability,
            environment: initialVisit.environment,
            note: initialVisit.note,
          }
        : {
            ...EMPTY_FORM,
            placeId: place?.id || '',
            purchasedAt: todayISO(),
          },
    )
  }, [open, initialVisit, place])

  const selectedPlace = useMemo(
    () => lockedPlace || places.find((item) => item.id === form.placeId) || null,
    [lockedPlace, places, form.placeId],
  )

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const updateScore = (key) => (value) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!form.placeId) {
      setError('Pilih resto yang pernah kamu beli.')
      return
    }
    if (!form.purchasedAt) {
      setError('Tanggal pembelian wajib diisi.')
      return
    }
    if (!form.taste || !form.affordability || !form.environment) {
      setError('Isi rating enak, murah, dan lingkungan terlebih dahulu.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const visit = await saveVisit({
        id: initialVisit?.id,
        placeId: form.placeId,
        itemName: form.itemName,
        amount: form.amount === '' ? null : Number(form.amount),
        purchasedAt: form.purchasedAt,
        taste: form.taste,
        affordability: form.affordability,
        environment: form.environment,
        note: form.note,
      })
      onSaved?.(visit)
      onClose()
    } catch (err) {
      setError(mutationMessage(err, 'Review gagal disimpan. Coba lagi.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={initialVisit ? 'Edit review' : 'Catat pernah beli'}
      description={
        initialVisit
          ? 'Perbarui menu, nominal, atau penilaianmu.'
          : 'Satu resto satu review. Kamu bisa mengeditnya kapan saja.'
      }
      onClose={onClose}
      wide
    >
      {places.length === 0 && !lockedPlace ? (
        <div className="form-empty">
          <p>Semua resto sudah punya review, atau belum ada resto yang bisa dipilih.</p>
          <p>Tambah resto baru di Resto Saya terlebih dahulu.</p>
        </div>
      ) : (
        <form className="modal-form" onSubmit={handleSubmit}>
          {lockedPlace ? (
            <div className="selected-place">
              <span className="chip chip--soft">{lockedPlace.category}</span>
              <div>
                <strong>{lockedPlace.name}</strong>
                <span>{lockedPlace.areaName}</span>
              </div>
            </div>
          ) : (
            <label className="form-field form-field--full">
              <span>Resto yang pernah dibeli</span>
              <select
                id="review-place"
                name="place_id"
                value={form.placeId}
                onChange={updateField('placeId')}
                required
                autoFocus
              >
                <option value="">Pilih resto</option>
                {places.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} · {item.areaName}
                  </option>
                ))}
              </select>
            </label>
          )}

          <div className="form-ratings">
            {SCORE_FIELDS.map((field) => (
              <RatingInput
                key={field.key}
                field={field}
                value={form[field.key]}
                onChange={updateScore(field.key)}
              />
            ))}
          </div>

          <div className="form-grid">
            <label className="form-field">
              <span>Menu yang dibeli</span>
              <input
                type="text"
                name="item_name"
                value={form.itemName}
                onChange={updateField('itemName')}
                placeholder="mis. Geprek sambal bawang"
              />
            </label>

            <label className="form-field">
              <span>Nominal belanja</span>
              <input
                type="number"
                name="amount"
                min="0"
                step="500"
                value={form.amount}
                onChange={updateField('amount')}
                placeholder="15000"
              />
            </label>

            <label className="form-field">
              <span>Tanggal beli</span>
              <input
                type="date"
                name="purchased_at"
                value={form.purchasedAt}
                onChange={updateField('purchasedAt')}
                max={todayISO()}
                required
              />
            </label>

            <label className="form-field form-field--full">
              <span>Catatan</span>
              <textarea
                name="note"
                rows="3"
                value={form.note}
                onChange={updateField('note')}
                placeholder="Rasa, porsi, suasana, atau hal yang bikin kamu balik lagi"
              />
            </label>
          </div>

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}

          <div className="form-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={saving}>
              Batal
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving && <Loader size={16} className="spin" aria-hidden="true" />}
              {initialVisit ? 'Simpan review' : 'Simpan catatan'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  )
}
