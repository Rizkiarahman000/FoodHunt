import { apiClient } from '../config/api'

// ---------------------------------------------------------------------------
// placeService: semua resto (kurasi dan resto pribadi).
//
// Frontend memanggil API Express:
//   GET    /api/places
//   GET    /api/places/:id
//   POST   /api/places
//   PUT    /api/places/:id
//   DELETE /api/places/:id
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

function toPayload(data) {
  return {
    name: data.name,
    area_name: data.areaName,
    category: data.category,
    price_range: data.priceRange,
    min_price: Number(data.minPrice) || 0,
    open_hours: data.openHours || '',
    landmark: data.landmark || '',
    description: data.description || '',
    image_url: data.imageUrl || '',
    signature_menus: data.signatureMenus || [],
  }
}

class PlaceService {
  async list(params = {}) {
    const { data } = await apiClient.get('/places', { params })
    if (!Array.isArray(data)) {
      throw new Error('Respons API tidak valid. Periksa VITE_API_BASE_URL.')
    }
    return data.map(normalizePlace)
  }

  async getById(id) {
    try {
      const { data } = await apiClient.get(`/places/${encodeURIComponent(id)}`)
      if (!data || typeof data !== 'object' || !data.id) {
        throw new Error('Respons detail resto tidak valid.')
      }
      return normalizePlace(data)
    } catch (err) {
      if (err?.response?.status === 404) return null
      throw err
    }
  }

  async create(data) {
    const { data: row } = await apiClient.post('/places', toPayload(data))
    if (!row?.id) throw new Error('Resto gagal dibuat oleh API.')
    return normalizePlace(row)
  }

  async update(id, data) {
    const { data: row } = await apiClient.put(
      `/places/${encodeURIComponent(id)}`,
      toPayload(data),
    )
    if (!row?.id) throw new Error('Resto gagal diperbarui oleh API.')
    return normalizePlace(row)
  }

  async remove(id) {
    await apiClient.delete(`/places/${encodeURIComponent(id)}`)
  }
}

export default new PlaceService()
