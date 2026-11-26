import { randomUUID } from 'node:crypto'
import { supabase } from '../config/supabaseClient.js'

// ---------------------------------------------------------------------------
// PlaceModel: baca/tulis tabel public.places lewat Supabase.
// Hanya resto dengan source = 'personal' yang boleh diubah lewat API.
// ---------------------------------------------------------------------------

function sanitizeTerm(value) {
  return String(value || '')
    .replace(/[(),%*]/g, ' ')
    .trim()
}

function buildPlaceRow(payload, { partial = false } = {}) {
  const row = {}

  if (!partial || payload.name !== undefined) row.name = String(payload.name || '').trim()
  if (!partial || payload.area_name !== undefined) {
    row.area_name = String(payload.area_name || '').trim()
  }
  if (!partial || payload.category !== undefined) {
    row.category = String(payload.category || '').trim()
  }
  if (!partial || payload.price_range !== undefined) {
    row.price_range = String(payload.price_range || '').trim()
  }
  if (!partial || payload.min_price !== undefined) {
    row.min_price = Math.max(0, Number(payload.min_price) || 0)
  }
  if (!partial || payload.open_hours !== undefined) {
    row.open_hours = String(payload.open_hours || '').trim()
  }
  if (!partial || payload.landmark !== undefined) {
    row.landmark = String(payload.landmark || '').trim()
  }
  if (!partial || payload.description !== undefined) {
    row.description = String(payload.description || '').trim()
  }
  if (!partial || payload.image_url !== undefined) {
    row.image_url = String(payload.image_url || '').trim()
  }
  if (!partial || payload.signature_menus !== undefined) {
    row.signature_menus = Array.isArray(payload.signature_menus)
      ? payload.signature_menus
      : []
  }

  return row
}

export const PlaceModel = {
  async getAll({ source, category, q, sort } = {}) {
    let query = supabase.from('places').select('*')

    if (source) query = query.eq('source', source)
    if (category) query = query.eq('category', category)

    const term = sanitizeTerm(q)
    if (term) {
      query = query.or(
        `name.ilike.%${term}%,area_name.ilike.%${term}%,description.ilike.%${term}%`,
      )
    }

    if (sort === 'cheapest') {
      query = query.order('min_price', { ascending: true }).order('name', { ascending: true })
    } else {
      query = query.order('rating', { ascending: false }).order('name', { ascending: true })
    }

    const { data, error } = await query.limit(200)
    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('places')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(payload) {
    const now = new Date().toISOString()
    const row = {
      ...buildPlaceRow(payload),
      id: `place-${randomUUID()}`,
      source: 'personal',
      rating: 0,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('places')
      .insert([row])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, payload) {
    const row = {
      ...buildPlaceRow(payload, { partial: true }),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('places')
      .update(row)
      .eq('id', id)
      .eq('source', 'personal')
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async remove(id) {
    const { data, error } = await supabase
      .from('places')
      .delete()
      .eq('id', id)
      .eq('source', 'personal')
      .select('id')
      .maybeSingle()

    if (error) throw error
    return Boolean(data)
  },
}
