import axios from 'axios'

// ---------------------------------------------------------------------------
// api.js : klien Supabase PostgREST.
//
// Isi lewat environment variable (lokal: .env, produksi: Vercel):
//   VITE_API_BASE_URL=https://<project-ref>.supabase.co
//   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
// ---------------------------------------------------------------------------

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

export const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  ''

export const IS_CONFIGURED = Boolean(API_BASE_URL && SUPABASE_KEY)

export const apiClient = axios.create({
  baseURL: IS_CONFIGURED ? `${API_BASE_URL}/rest/v1` : '/rest/v1',
  headers: {
    'Content-Type': 'application/json',
    ...(SUPABASE_KEY
      ? { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
      : {}),
  },
  timeout: 12000,
})

export function isNetworkError(error) {
  return Boolean(error) && !error.response
}

export default apiClient
