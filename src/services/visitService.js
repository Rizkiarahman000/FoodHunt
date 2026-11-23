import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// visitService: catatan pernah beli + review satu resto.
//
// Endpoint:
//   GET    /rest/v1/visits
//   POST   /rest/v1/visits
//   PATCH  /rest/v1/visits?id=eq.<id>
//   DELETE /rest/v1/visits?id=eq.<id>
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
    amount: data.amount === '' || data.amount == null ? null : Math.max(0, Number(data.amount)),
    purchased_at: data.purchasedAt || null,
    taste: Number(data.taste) || 0,
    affordability: Number(data.affordability) || 0,
    environment: Number(data.environment) || 0,
    note: (data.note || '').trim(),
    updated_at: new Date().toISOString(),
  }
}

class VisitService {
  async list() {
    const { data } = await apiClient.get(
      '/visits?select=*&order=purchased_at.desc,created_at.desc',
    )
    return (Array.isArray(data) ? data : []).map(normalizeVisit)
  }

  async create(data) {
    const { data: rows } = await apiClient.post('/visits?select=*', toPayload(data), {
      headers: { Prefer: 'return=representation' },
    })
    const row = Array.isArray(rows) ? rows[0] : rows
    return row ? normalizeVisit(row) : null
  }

  async update(id, data) {
    const { data: rows } = await apiClient.patch(
      `/visits?select=*&id=eq.${encodeURIComponent(id)}`,
      toPayload(data),
      { headers: { Prefer: 'return=representation' } },
    )
    const row = Array.isArray(rows) ? rows[0] : rows
    return row ? normalizeVisit(row) : null
  }

  async remove(id) {
    await apiClient.delete(`/visits?id=eq.${encodeURIComponent(id)}`)
  }
}

export default new VisitService()
