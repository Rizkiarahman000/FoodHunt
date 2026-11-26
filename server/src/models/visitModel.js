import { supabase } from '../config/supabaseClient.js'

// ---------------------------------------------------------------------------
// VisitModel: catatan pernah beli dan review. Satu resto satu review.
// ---------------------------------------------------------------------------

function buildVisitRow(payload, { partial = false } = {}) {
  const row = {}

  if (!partial) {
    row.place_id = String(payload.place_id || '').trim()
  }

  if (!partial || payload.item_name !== undefined) {
    row.item_name = String(payload.item_name || '').trim()
  }
  if (!partial || payload.amount !== undefined) {
    row.amount =
      payload.amount === '' || payload.amount === null || payload.amount === undefined
        ? null
        : Math.max(0, Number(payload.amount) || 0)
  }
  if (!partial || payload.purchased_at !== undefined) {
    if (payload.purchased_at) row.purchased_at = payload.purchased_at
  }
  if (!partial || payload.taste !== undefined) {
    row.taste = Number(payload.taste)
  }
  if (!partial || payload.affordability !== undefined) {
    row.affordability = Number(payload.affordability)
  }
  if (!partial || payload.environment !== undefined) {
    row.environment = Number(payload.environment)
  }
  if (!partial || payload.note !== undefined) {
    row.note = String(payload.note || '').trim()
  }

  return row
}

export const VisitModel = {
  async getAll({ place_id } = {}) {
    let query = supabase.from('visits').select('*')

    if (place_id) query = query.eq('place_id', place_id)

    const { data, error } = await query
      .order('purchased_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200)

    if (error) throw error
    return data
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('visits')
      .select('*')
      .eq('id', id)
      .maybeSingle()

    if (error) throw error
    return data
  },

  async create(payload) {
    const row = buildVisitRow(payload)
    if (!row.purchased_at) {
      row.purchased_at = new Date().toISOString().slice(0, 10)
    }
    row.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('visits')
      .insert([row])
      .select()
      .single()

    if (error) throw error
    return data
  },

  async update(id, payload) {
    const row = {
      ...buildVisitRow(payload, { partial: true }),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase
      .from('visits')
      .update(row)
      .eq('id', id)
      .select()
      .maybeSingle()

    if (error) throw error
    return data
  },

  async remove(id) {
    const { data, error } = await supabase
      .from('visits')
      .delete()
      .eq('id', id)
      .select('id')
      .maybeSingle()

    if (error) throw error
    return Boolean(data)
  },
}
