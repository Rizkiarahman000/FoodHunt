import { useEffect, useState } from 'react'
import { Loader } from 'lucide-react'
import Modal from './Modal'
import { CATEGORIES } from '../data/categories'
import { usePlaces } from '../context/PlacesContext'
import { mutationMessage } from '../lib/errors'

const EMPTY_FORM = {
  name: '',
  areaName: '',
  category: 'Makan Berat',
  priceRange: '',
  minPrice: '',
  openHours: '',
  landmark: '',
  imageUrl: '',
  description: '',
}

export default function PlaceFormModal({ open, initialPlace, onClose, onSaved }) {
  const { areas, createPlace, updatePlace } = usePlaces()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!open) return
    setError('')
    setSaving(false)
    setForm(
      initialPlace
        ? {
            name: initialPlace.name,
            areaName: initialPlace.areaName,
            category: initialPlace.category,
            priceRange: initialPlace.priceRange,
            minPrice: initialPlace.minPrice ? String(initialPlace.minPrice) : '',
            openHours: initialPlace.openHours,
            landmark: initialPlace.landmark,
            imageUrl: initialPlace.imageUrl,
            description: initialPlace.description,
          }
        : EMPTY_FORM,
    )
  }, [open, initialPlace])

  const updateField = (key) => (event) => {
    setForm((current) => ({ ...current, [key]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (
      !form.name.trim() ||
      !form.areaName.trim() ||
      !form.category ||
      !form.priceRange.trim()
    ) {
      setError('Nama, kawasan, kategori, dan kisaran harga wajib diisi.')
      return
    }

    setSaving(true)
    setError('')
    try {
      const place = initialPlace
        ? await updatePlace(initialPlace.id, form)
        : await createPlace(form)
      onSaved?.(place)
      onClose()
    } catch (err) {
      setError(mutationMessage(err, 'Resto gagal disimpan. Coba lagi.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open={open}
      title={initialPlace ? 'Edit resto' : 'Tambah resto'}
      description={
        initialPlace
          ? 'Perbarui informasi resto hidden gem milikmu.'
          : 'Simpan tempat yang kamu temukan sendiri. Review bisa diisi setelah membeli.'
      }
      onClose={onClose}
      wide
    >
      <form className="modal-form" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Nama resto</span>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={updateField('name')}
              placeholder="mis. Warung Makan Bu Tini"
              required
              autoFocus
            />
          </label>

          <label className="form-field">
            <span>Kawasan</span>
            <input
              type="text"
              name="area_name"
              value={form.areaName}
              onChange={updateField('areaName')}
              placeholder="mis. Jl. Gondang"
              list="foodhunt-area-options"
              required
            />
            <datalist id="foodhunt-area-options">
              {areas.map((area) => (
                <option key={area} value={area} />
              ))}
            </datalist>
          </label>

          <label className="form-field">
            <span>Kategori</span>
            <select name="category" value={form.category} onChange={updateField('category')}>
              {CATEGORIES.filter((category) => category !== 'Semua').map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="form-field">
            <span>Kisaran harga</span>
            <input
              type="text"
              name="price_range"
              value={form.priceRange}
              onChange={updateField('priceRange')}
              placeholder="Rp10.000 - Rp20.000"
              required
            />
          </label>

          <label className="form-field">
            <span>Harga termurah (angka)</span>
            <input
              type="number"
              name="min_price"
              min="0"
              step="500"
              value={form.minPrice}
              onChange={updateField('minPrice')}
              placeholder="10000"
            />
          </label>

          <label className="form-field">
            <span>Jam buka</span>
            <input
              type="text"
              name="open_hours"
              value={form.openHours}
              onChange={updateField('openHours')}
              placeholder="10.00 - 22.00 WIB"
            />
          </label>

          <label className="form-field form-field--full">
            <span>Patokan alamat</span>
            <input
              type="text"
              name="landmark"
              value={form.landmark}
              onChange={updateField('landmark')}
              placeholder="mis. seberang bengkel Jl. Gondang"
            />
          </label>

          <label className="form-field form-field--full">
            <span>URL foto (opsional)</span>
            <input
              type="url"
              name="image_url"
              value={form.imageUrl}
              onChange={updateField('imageUrl')}
              placeholder="https://..."
            />
          </label>

          <label className="form-field form-field--full">
            <span>Catatan</span>
            <textarea
              name="description"
              rows="3"
              value={form.description}
              onChange={updateField('description')}
              placeholder="Kenapa tempat ini worth it? Menu apa yang harus dicoba?"
            />
          </label>
        </div>

        <p className="form-note">
          Resto pribadi tampil di Resto Saya. Kalau rata-rata reviewnya minimal 4.0, resto ini
          otomatis ikut muncul di Rekomendasi.
        </p>

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
            {initialPlace ? 'Simpan perubahan' : 'Tambah resto'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
