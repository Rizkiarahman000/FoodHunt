import axios from 'axios'

// ---------------------------------------------------------------------------
// api.js: klien API Express milik sendiri.
//
// Development: VITE_API_BASE_URL kosong, Vite mem-proxy /api ke localhost:3000.
// Production: isi VITE_API_BASE_URL dengan URL API Vercel, mis.
//   https://foodhunt-api.vercel.app/api
//
// Tidak ada kredensial Supabase di sisi frontend.
// ---------------------------------------------------------------------------

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '')

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 12000,
})

export function isNetworkError(error) {
  return Boolean(error) && !error.response
}

export default apiClient
