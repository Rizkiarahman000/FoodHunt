# FoodHunt

PWA rekomendasi kuliner Tembalang, koleksi resto hidden gem, dan catatan resto yang
pernah dibeli. Dibuat untuk Tugas Akhir Praktikum Pemrograman Perangkat Bergerak
(PPB) 2026.

**Identitas**
Nama: Rizkia Rahman
NIM: 21120124130086
Program studi: Teknik Komputer, Universitas Diponegoro (Angkatan 2024)

---

## Status backend

Project Supabase **FoodHunt** sudah dibuat di region `ap-southeast-1` (ref
`fzahctmhlkeqlrcvpvws`). Tabel `places` dan `visits` sudah dibuat, policy RLS
aktif, dan 10 rekomendasi awal sudah masuk. Kredensial lokal ada di `.env` (tidak
di-commit). Untuk Vercel, isi environment variable yang sama.

---

## Fitur

- **Beranda** (`/`): sapaan, pencarian, filter kategori, rekomendasi pilihan,
  ringkasan Resto Saya, ringkasan Pernah Beli, dan review terakhir.
- **Rekomendasi** (`/foods`): 10 resto kurasi Tembalang. Resto pribadi ikut muncul
  di sini kalau rata-rata reviewnya minimal 4.0. Ada pencarian, filter kategori,
  filter Pilihan atau Hidden gem, dan urutan rating atau harga.
- **Detail resto** (`/foods/[id]`): foto, kategori, rating, harga, deskripsi, jam
  buka, patokan, menu andalan, dan review.
- **Resto Saya** (`/resto`): tambah, edit, dan hapus resto hidden gem milik sendiri.
  Resto pribadi bisa langsung dicatat pembeliannya dari halaman detail.
- **Pernah Beli** (`/riwayat`): daftar resto yang pernah dibeli, lengkap dengan
  rating enak, murah, lingkungan, menu yang dibeli, nominal, tanggal, dan catatan.
  Satu resto punya satu review yang bisa diedit atau dihapus.
- **Profil** (`/profile`): identitas pembuat, statistik rekomendasi, resto pribadi,
  total pernah beli, rata-rata review, panduan pasang PWA, dan info aplikasi.
- **PWA**: manifest, ikon 192/512, service worker Workbox, bisa dipasang di Android
  maupun desktop.
- **Offline**: rekomendasi, resto pribadi, dan review terakhir tetap terbaca dari
  cache. Perubahan data memerlukan koneksi dan akan menampilkan pesan kalau gagal.
- **Responsif**: HP memakai bottom navigation; mulai 960px tampil sidebar, grid dua
  kolom, dan detail dua kolom.

---

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| UI | React 19 |
| Build tool | Vite 8 |
| PWA | vite-plugin-pwa (Workbox) |
| Database dan API | Supabase (PostgreSQL + PostgREST) |
| HTTP client | axios |
| Ikon | lucide-react |
| Routing | History API kecil di `src/lib/router.js` |
| Styling | CSS murni dengan design token |
| Hosting | Vercel |

Skema database dan data rekomendasi ada di `supabase/schema.sql`.

---

## Struktur data

**places**: semua resto, baik kurasi maupun resto pribadi.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | text (PK) | `place-1` untuk seed, `place-<uuid>` untuk resto pribadi |
| `name` | text | nama resto |
| `area_name` | text | kawasan, mis. `Kawasan Jl. Gondong` |
| `category` | text | Makan Berat, Burjo & Mie, Kopi & Nugas, Jajanan Malam |
| `price_range` | text | teks kisaran harga |
| `min_price` | integer | harga terendah untuk urutan harga |
| `rating` | numeric(2,1) | rating kurasi, 0 untuk resto pribadi |
| `open_hours` | text | jam buka |
| `landmark` | text | patokan alamat |
| `description` | text | catatan atau deskripsi |
| `image_url` | text | foto |
| `signature_menus` | jsonb | array `{name, price}` untuk resto kurasi |
| `source` | text | `curated` atau `personal` |
| `created_at`, `updated_at` | timestamptz | waktu data |

**visits**: catatan pernah beli dan review. Satu resto hanya boleh punya satu baris
(`place_id` UNIQUE).

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid (PK) | dibuat Supabase |
| `place_id` | text (FK, unik) | relasi ke `places.id` |
| `item_name` | text | menu yang dibeli |
| `amount` | integer | nominal belanja |
| `purchased_at` | date | tanggal beli |
| `taste` | smallint | rating enak, 1 sampai 5 |
| `affordability` | smallint | rating murah, 1 sampai 5 |
| `environment` | smallint | rating lingkungan, 1 sampai 5 |
| `note` | text | catatan review |
| `created_at`, `updated_at` | timestamptz | waktu data |

Ambang masuk Rekomendasi untuk resto pribadi: rata-rata tiga rating minimal **4.0**.
Nilai ambang ada di `src/lib/reviews.js` (`RECOMMENDATION_MIN_SCORE`).

---

## Menyiapkan Supabase

1. Buat project baru di [supabase.com](https://supabase.com).
2. Buka **SQL Editor**, tempel isi `supabase/schema.sql`, lalu jalankan. File ini
   membuat tabel, policy RLS, dan 10 rekomendasi awal.
3. Buka **Project Settings > API**, salin **Project URL** dan **publishable key**
   (atau anon key).
4. Salin `.env.example` menjadi `.env`, lalu isi:

   ```env
   VITE_API_BASE_URL=https://<project-ref>.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_xxxxxxxx
   ```

Publishable key dipakai di sisi klien. Akses tulis dibuka lewat policy RLS publik,
sama seperti pola praktikum modul 5. Untuk aplikasi produksi dengan akun pengguna,
ganti policy tersebut dengan policy berbasis `auth.uid()`.

Project Supabase free tier bisa di-pause setelah beberapa hari tanpa aktivitas.
Buka dashboard Supabase sebelum demo supaya project aktif kembali.

---

## Menjalankan lokal

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`.

Build produksi:

```bash
npm run build
npm run preview
```

---

## Deploy ke Vercel

1. Buat repository GitHub, lalu unggah folder ini.
2. Di Vercel, pilih **Add New > Project**, import repository.
3. Framework terdeteksi sebagai **Vite** (build `npm run build`, output `dist`).
4. Tambahkan environment variable `VITE_API_BASE_URL` dan
   `VITE_SUPABASE_PUBLISHABLE_KEY` di **Settings > Environment Variables**.
5. Deploy. `vercel.json` mengarahkan rute SPA (`/foods/[id]`, `/resto`,
   `/riwayat`, dan seterusnya) ke `index.html`.

---

## REST API

Aplikasi memakai PostgREST milik Supabase, dengan skema dan policy project ini.
Pemetaan ke endpoint:

| Method | Endpoint PRD | Endpoint yang dipanggil aplikasi |
| --- | --- | --- |
| GET | `/api/places` | `GET /rest/v1/places?select=*` |
| GET | `/api/places/[id]` | `GET /rest/v1/places?select=*&id=eq.<id>` |
| POST | `/api/places` | `POST /rest/v1/places` |
| PATCH | `/api/places/[id]` | `PATCH /rest/v1/places?id=eq.<id>` |
| DELETE | `/api/places/[id]` | `DELETE /rest/v1/places?id=eq.<id>` |
| GET | `/api/visits` | `GET /rest/v1/visits?select=*` |
| POST | `/api/visits` | `POST /rest/v1/visits` |
| PATCH | `/api/visits/[id]` | `PATCH /rest/v1/visits?id=eq.<id>` |
| DELETE | `/api/visits/[id]` | `DELETE /rest/v1/visits?id=eq.<id>` |

Contoh request:

```bash
curl "https://<project>.supabase.co/rest/v1/places?select=*&source=eq.curated" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY"

curl -X POST "https://<project>.supabase.co/rest/v1/visits" \
  -H "apikey: $KEY" -H "Authorization: Bearer $KEY" \
  -H "Content-Type: application/json" \
  -H "Prefer: return=representation" \
  -d '{"place_id":"place-1","item_name":"Geprek + es teh","amount":15000,"purchased_at":"2026-11-23","taste":5,"affordability":4,"environment":3,"note":"Sambalnya enak"}'
```

`POST /visits` untuk resto yang sudah punya review akan ditolak oleh UNIQUE
`place_id` (kode PostgreSQL `23505`). Aplikasi menampilkan pesan yang sesuai.

---

## Struktur proyek

```
src/
  config/api.js           klien axios Supabase PostgREST
  services/               placeService, visitService
  context/                Places, Visits, Install, Toast, Update
  pages/                  Home, Foods, FoodDetail, Resto, Visits, Profile
  components/             PlaceRow, PlaceTile, VisitCard, ReviewSummary,
                          PlaceFormModal, ReviewFormModal, Modal, dll.
  lib/                    router, format, reviews, errors, storage, platform
  data/                   kategori, navigasi, identitas pembuat
  index.css               design system
public/                   ikon PWA, robots.txt
supabase/schema.sql       DDL, policy, dan 10 rekomendasi awal
scripts/generate-icons.mjs   pembuat ikon PNG tanpa dependensi
```

---

## Keputusan desain

- **Satu tempat, dua sumber**: rekomendasi kurasi dan resto pribadi disimpan di
  tabel yang sama (`places.source`). Ini membuat detail, pencarian, dan review
  bisa dipakai bersama tanpa menduplikasi komponen.
- **Satu review per resto**: sesuai kebutuhan tugas, satu kunjungan dicatat sebagai
  satu review yang bisa diedit. Ini mencegah daftar review menumpuk dan membuat
  perbandingan enak, murah, lingkungan tetap jelas.
- **Ambang 4.0**: resto pribadi baru masuk Rekomendasi kalau kualitasnya terbukti
  lewat review, sehingga tab Rekomendasi tetap terasa terkurasi.
- **Krem hangat, oranye bata, hijau status**: oranye untuk harga dan aksi utama,
  hijau hanya untuk status pernah dibeli atau kualitas rekomendasi.
- **Fraunces + Plus Jakarta Sans**: Fraunces memberi karakter papan menu warung,
  Jakarta Sans menjaga teks kecil dan form tetap mudah dibaca.
- **Sidebar desktop, bottom nav HP**: satu aplikasi responsif, tanpa memisahkan
  basis kode desktop dan Android.
- **Kartu border tipis**: hierarki dibentuk oleh jarak dan kontras, bukan bayangan
  tebal. Bayangan hanya untuk elemen yang mengambang di atas konten.

---

## Checklist kriteria selesai

- [x] Operasi CRUD `places` dan `visits` tersedia lewat PostgREST dan dipakai aplikasi.
- [x] Bottom navigation berfungsi di 5 halaman utama.
- [x] Tab Rekomendasi menampilkan 10 resto kurasi dan hidden gem dengan rata-rata
      review minimal 4.0.
- [x] Klik kartu rekomendasi membuka `/foods/[id]`.
- [x] Tab Resto Saya bisa menambah, mengedit, dan menghapus resto pribadi.
- [x] Tab Pernah Beli bisa mencatat, mengedit, dan menghapus review dengan rating
      enak, murah, lingkungan.
- [x] Halaman Profil menampilkan identitas, statistik, dan ringkasan review.
- [x] Manifest, ikon 192/512, dan service worker aktif.
- [ ] Deploy Vercel (isi kredensial Supabase lalu deploy; lihat langkah di atas).

Catatan: data kuliner awal adalah data contoh untuk keperluan praktikum, bukan
hasil survei lapangan. Foto contoh diambil dari Unsplash.
