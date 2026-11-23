import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// placeService: semua resto (kurasi dan resto pribadi).
//
// Endpoint:
//   GET    /rest/v1/places
//   GET    /rest/v1/places?id=eq.<id>
//   POST   /rest/v1/places
//   PATCH  /rest/v1/places?id=eq.<id>
//   DELETE /rest/v1/places?id=eq.<id>
// ---------------------------------------------------------------------------

export function normalizePlace(row) {
  const menus = Array.isArray(row.signature_menus) ? row.signature_menus : []
  return {
    id: row.id,
    name: row.name,
    areaName: row.area_name || '',
    category: row.category,
    priceRange: row.price_range || '',
    minPrice: Number(row.min_price) || 0,
    rating: Number(row.rating) || 0,
    openHours: row.open_hours || '',
    landmark: row.landmark || '',
    description: row.description || '',
    imageUrl: row.image_url || '',
    signatureMenus: menus
      .filter((menu) => menu && menu.name)
      .map((menu) => ({ name: menu.name, price: menu.price || '' })),
    source: row.source === 'personal' ? 'personal' : 'curated',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function placePayload(data, { create = false } = {}) {
  const now = new Date().toISOString()
  const payload = {
    name: data.name.trim(),
    area_name: data.areaName.trim(),
    category: data.category,
    price_range: data.priceRange.trim(),
    min_price: Math.max(0, Number(data.minPrice) || 0),
    open_hours: (data.openHours || '').trim(),
    landmark: (data.landmark || '').trim(),
    description: (data.description || '').trim(),
    image_url: (data.imageUrl || '').trim(),
    signature_menus: data.signatureMenus || [],
    updated_at: now,
  }

  if (create) {
    payload.id = `place-${crypto.randomUUID()}`
    payload.rating = 0
    payload.source = 'personal'
    payload.created_at = now
  }

  return payload
}

class PlaceService {
  async list() {
    const { data } = await apiClient.get(
      '/places?select=*&order=source.asc,rating.desc,name.asc',
    )
    return (Array.isArray(data) ? data : []).map(normalizePlace)
  }

  async getById(id) {
    const { data } = await apiClient.get(
      `/places?select=*&id=eq.${encodeURIComponent(id)}&limit=1`,
    )
    const row = Array.isArray(data) ? data[0] : null
    return row ? normalizePlace(row) : null
  }

  async create(data) {
    const payload = placePayload(data, { create: true })
    const { data: rows } = await apiClient.post('/places?select=*', payload, {
      headers: { Prefer: 'return=representation' },
    })
    const row = Array.isArray(rows) ? rows[0] : rows
    return row ? normalizePlace(row) : { ...data, id: payload.id, source: 'personal' }
  }

  async update(id, data) {
    const { data: rows } = await apiClient.patch(
      `/places?select=*&id=eq.${encodeURIComponent(id)}`,
      placePayload(data),
      { headers: { Prefer: 'return=representation' } },
    )
    const row = Array.isArray(rows) ? rows[0] : rows
    return row ? normalizePlace(row) : null
  }

  async remove(id) {
    await apiClient.delete(`/places?id=eq.${encodeURIComponent(id)}`)
  }
}

export default new PlaceService()
