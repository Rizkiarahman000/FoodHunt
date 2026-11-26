import { isNetworkError } from '../config/api'

function apiMessage(error) {
  return (
    error?.response?.data?.error ||
    error?.response?.data?.message ||
    error?.message ||
    ''
  )
}

export function dataErrorMessage(error) {
  if (isNetworkError(error)) {
    return 'Tidak bisa menghubungi API FoodHunt. Pastikan backend Express berjalan dan VITE_API_BASE_URL benar.'
  }
  if (error?.response?.status === 404) {
    return 'Data tidak ditemukan di server.'
  }
  if (error?.response?.status >= 500) {
    return 'API FoodHunt sedang bermasalah. Coba lagi beberapa saat.'
  }
  return apiMessage(error) || 'Data gagal dimuat dari API.'
}

export function mutationMessage(error, fallback = 'Perubahan gagal disimpan. Coba lagi.') {
  const code = error?.response?.data?.code
  if (code === '23505') return 'Resto ini sudah punya catatan review.'
  if (code === '23503') return 'Resto yang dipilih sudah tidak ada.'
  if (isNetworkError(error)) {
    return 'Tidak bisa menghubungi API. Perubahan belum tersimpan.'
  }
  if (error?.response?.status === 401 || error?.response?.status === 403) {
    return 'Akses ditolak oleh API.'
  }
  return apiMessage(error) || fallback
}
