import { PlaceModel } from '../models/placeModel.js'

const REQUIRED_FIELDS = ['name', 'area_name', 'category', 'price_range']

function isBlank(value) {
  return !String(value || '').trim()
}

function validatePlace(body, { partial = false } = {}) {
  if (!partial) {
    const missing = REQUIRED_FIELDS.filter((field) => isBlank(body[field]))
    if (missing.length > 0) {
      return `Field wajib belum diisi: ${missing.join(', ')}`
    }
  }

  for (const field of REQUIRED_FIELDS) {
    if (partial && body[field] !== undefined && isBlank(body[field])) {
      return `Field ${field} tidak boleh kosong`
    }
  }

  if (body.min_price !== undefined && Number(body.min_price) < 0) {
    return 'Harga termurah tidak boleh negatif'
  }

  if (body.signature_menus !== undefined && !Array.isArray(body.signature_menus)) {
    return 'signature_menus harus berupa array'
  }

  return null
}

function sendError(res, err, fallbackStatus = 500) {
  const code = err?.code
  let status = fallbackStatus
  let message = err?.message || 'Terjadi kesalahan pada server'

  if (code === '23505') {
    status = 409
    message = 'Data ini sudah ada.'
  } else if (code === '23503') {
    status = 400
    message = 'Data relasi tidak ditemukan.'
  }

  res.status(status).json({ error: message, code: code || null })
}

export const PlaceController = {
  async getAll(req, res) {
    try {
      const { source, category, q, sort } = req.query
      if (source && !['curated', 'personal'].includes(source)) {
        return res.status(400).json({ error: 'source harus curated atau personal' })
      }
      const places = await PlaceModel.getAll({ source, category, q, sort })
      res.json(places)
    } catch (err) {
      sendError(res, err)
    }
  },

  async getById(req, res) {
    try {
      const place = await PlaceModel.getById(req.params.id)
      if (!place) {
        return res.status(404).json({ error: 'Resto tidak ditemukan' })
      }
      res.json(place)
    } catch (err) {
      sendError(res, err)
    }
  },

  async create(req, res) {
    const message = validatePlace(req.body)
    if (message) return res.status(400).json({ error: message })

    try {
      const place = await PlaceModel.create(req.body)
      res.status(201).json(place)
    } catch (err) {
      sendError(res, err, 400)
    }
  },

  async update(req, res) {
    const message = validatePlace(req.body, { partial: true })
    if (message) return res.status(400).json({ error: message })

    try {
      const place = await PlaceModel.update(req.params.id, req.body)
      if (!place) {
        return res.status(404).json({
          error: 'Resto tidak ditemukan atau bukan resto pribadi',
        })
      }
      res.json(place)
    } catch (err) {
      sendError(res, err, 400)
    }
  },

  async remove(req, res) {
    try {
      const deleted = await PlaceModel.remove(req.params.id)
      if (!deleted) {
        return res.status(404).json({
          error: 'Resto tidak ditemukan atau bukan resto pribadi',
        })
      }
      res.json({ message: 'Resto berhasil dihapus' })
    } catch (err) {
      sendError(res, err, 400)
    }
  },
}
