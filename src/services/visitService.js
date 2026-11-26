import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// visitService: catatan pernah beli dan review satu resto.
//
// Frontend memanggil API Express:
//   GET    /api/visits
//   POST   /api/visits
//   PUT    /api/visits/:id
//   DELETE /api/visits/:id
// ---------------------------------------------------------------------------

export function normalizeVisit(row) {
  return {
    id: row.id,
    placeId: row.place_id,
    itemName: row.item_name || '',
    amount: row.amount == null ? null : Number(row.amount),
    purchasedAt: row.purchased_at || '',
    taste: Number(row.taste) || 0,
    affordability: Number(row.affordability) || 0,
    environment: Number(row.environment) || 0,
    note: row.note || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPayload(data) {
  return {
    place_id: data.placeId,
    item_name: (data.itemName || '').trim(),
    amount: data.amount === '' || data.amount == null ? null : Number(data.amount),
    purchased_at: data.purchasedAt || null,
    taste: Number(data.taste) || 0,
    affordability: Number(data.affordability) || 0,
    environment: Number(data.environment) || 0,
    note: (data.note || '').trim(),
  }
}

class VisitService {
  async list(params = {}) {
    const { data } = await apiClient.get('/visits', { params })
    if (!Array.isArray(data)) {
      throw new Error('Respons API tidak valid. Periksa VITE_API_BASE_URL.')
    }
    return data.map(normalizeVisit)
  }

  async create(data) {
    const { data: row } = await apiClient.post('/visits', toPayload(data))
    if (!row?.id) throw new Error('Review gagal disimpan oleh API.')
    return normalizeVisit(row)
  }

  async update(id, data) {
    const { data: row } = await apiClient.put(
      `/visits/${encodeURIComponent(id)}`,
      toPayload(data),
    )
    if (!row?.id) throw new Error('Review gagal diperbarui oleh API.')
    return normalizeVisit(row)
  }

  async remove(id) {
    await apiClient.delete(`/visits/${encodeURIComponent(id)}`)
  }
}

export default new VisitService()
