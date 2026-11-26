import { VisitModel } from '../models/visitModel.js'

const SCORE_FIELDS = ['taste', 'affordability', 'environment']

function isValidScore(value) {
  const number = Number(value)
  return Number.isInteger(number) && number >= 1 && number <= 5
}

function validateVisit(body, { partial = false } = {}) {
  if (!partial && !String(body.place_id || '').trim()) {
    return 'place_id wajib diisi'
  }

  for (const field of SCORE_FIELDS) {
    if (!partial || body[field] !== undefined) {
      if (!isValidScore(body[field])) {
        return `Rating ${field} harus bilangan bulat 1 sampai 5`
      }
    }
  }

  if (
    body.amount !== undefined &&
    body.amount !== null &&
    body.amount !== '' &&
    (Number.isNaN(Number(body.amount)) || Number(body.amount) < 0)
  ) {
    return 'Nominal belanja harus angka 0 atau lebih'
  }

  if (
    body.purchased_at !== undefined &&
    body.purchased_at !== null &&
    body.purchased_at !== '' &&
    !/^\d{4}-\d{2}-\d{2}$/.test(String(body.purchased_at))
  ) {
    return 'Format purchased_at harus YYYY-MM-DD'
  }

  return null
}

function sendError(res, err, fallbackStatus = 500) {
  const code = err?.code
  let status = fallbackStatus
  let message = err?.message || 'Terjadi kesalahan pada server'

  if (code === '23505') {
    status = 409
    message = 'Resto ini sudah punya catatan review.'
  } else if (code === '23503') {
    status = 400
    message = 'Resto yang dipilih tidak ditemukan.'
  }

  res.status(status).json({ error: message, code: code || null })
}

export const VisitController = {
  async getAll(req, res) {
    try {
      const visits = await VisitModel.getAll({ place_id: req.query.place_id })
      res.json(visits)
    } catch (err) {
      sendError(res, err)
    }
  },

  async getById(req, res) {
    try {
      const visit = await VisitModel.getById(req.params.id)
      if (!visit) {
        return res.status(404).json({ error: 'Catatan review tidak ditemukan' })
      }
      res.json(visit)
    } catch (err) {
      sendError(res, err)
    }
  },

  async create(req, res) {
    const message = validateVisit(req.body)
    if (message) return res.status(400).json({ error: message })

    try {
      const visit = await VisitModel.create(req.body)
      res.status(201).json(visit)
    } catch (err) {
      sendError(res, err, 400)
    }
  },

  async update(req, res) {
    const message = validateVisit(req.body, { partial: true })
    if (message) return res.status(400).json({ error: message })

    try {
      const visit = await VisitModel.update(req.params.id, req.body)
      if (!visit) {
        return res.status(404).json({ error: 'Catatan review tidak ditemukan' })
      }
      res.json(visit)
    } catch (err) {
      sendError(res, err, 400)
    }
  },

  async remove(req, res) {
    try {
      const deleted = await VisitModel.remove(req.params.id)
      if (!deleted) {
        return res.status(404).json({ error: 'Catatan review tidak ditemukan' })
      }
      res.json({ message: 'Catatan review berhasil dihapus' })
    } catch (err) {
      sendError(res, err, 400)
    }
  },
}
