import { IS_CONFIGURED, isNetworkError } from '../config/api'

export function configMessage() {
  return 'Supabase belum dihubungkan. Isi VITE_API_BASE_URL dan VITE_SUPABASE_PUBLISHABLE_KEY di file .env.'
}

export function dataErrorMessage(error) {
  if (!IS_CONFIGURED) return configMessage()
  if (isNetworkError(error)) return 'Tidak bisa menghubungi server. Periksa koneksi, lalu coba lagi.'
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Akses database ditolak. Cek policy RLS di Supabase.'
  }
  return 'Server menolak permintaan. Cek koneksi dan policy database.'
}

export function mutationMessage(error, fallback = 'Perubahan gagal disimpan. Coba lagi.') {
  if (!IS_CONFIGURED) return configMessage()
  const code = error?.response?.data?.code
  if (code === '23505') return 'Resto ini sudah punya catatan review.'
  if (code === '23503') return 'Resto yang dipilih sudah tidak ada.'
  if (isNetworkError(error)) return 'Koneksi terputus. Perubahan belum tersimpan.'
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Akses database ditolak. Cek policy RLS di Supabase.'
  }
  return fallback
}
