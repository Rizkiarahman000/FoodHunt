# FoodHunt

PWA rekomendasi kuliner Tembalang, koleksi resto hidden gem, dan catatan resto yang
pernah dibeli. Frontend React memanggil REST API Express buatan sendiri. API itulah
yang membaca dan menulis data ke Supabase PostgreSQL.

Dibuat untuk Tugas Akhir Praktikum Pemrograman Perangkat Bergerak (PPB) 2026.

**Identitas**
Nama: Rizkia Rahman
NIM: 21120124130086
Program studi: Teknik Komputer, Universitas Diponegoro (Angkatan 2024)

---

## Arsitektur

```
Browser (React + Vite)
   -> axios
   -> REST API Express (/api/places, /api/visits)
   -> Supabase JS
   -> PostgreSQL Supabase
```

Frontend tidak memegang kredensial Supabase dan tidak memanggil `/rest/v1`.
Backend Express ada di folder `server/`, mengikuti struktur Modul 1:
`config`, `models`, `controllers`, `routes`.

---

## Deployment production

- Frontend: https://foodhunt-puce.vercel.app
- API Express: https://foodhunt-api.vercel.app
- Health check: https://foodhunt-api.vercel.app/api/health

Frontend production memanggil `https://foodhunt-api.vercel.app/api`. CORS backend
dibatasi ke domain frontend tersebut.

---

## Fitur

- **Beranda** (`/`): rekomendasi pilihan, ringkasan Resto Saya, ringkasan Pernah
  Beli, dan review terakhir.
- **Rekomendasi** (`/foods`): 10 resto kurasi Tembalang. Resto pribadi ikut muncul
  kalau rata-rata reviewnya minimal 4.0. Ada pencarian, filter kategori, filter
  Pilihan atau Hidden gem, dan urutan rating atau harga.
- **Detail resto** (`/foods/[id]`): foto, rating, harga, deskripsi, jam buka,
  patokan, menu andalan, dan review.
- **Resto Saya** (`/resto`): tambah, edit, dan hapus resto hidden gem sendiri.
- **Pernah Beli** (`/riwayat`): daftar resto yang pernah dibeli, dengan rating enak,
  murah, lingkungan, menu, nominal, tanggal, dan catatan. Satu resto satu review.
- **Profil** (`/profile`): identitas, statistik, rata-rata review, panduan PWA,
  dan info aplikasi.
- **PWA**: manifest, ikon 192/512, service worker, bisa dipasang di Android dan
  desktop.
- **Offline**: data terakhir dari API di-cache. Perubahan data memerlukan koneksi.
- **Responsif**: bottom nav di HP, sidebar dan grid dua kolom mulai 960px.

---

## Teknologi

| Bagian | Teknologi |
| --- | --- |
| Frontend | React 19 + Vite 8 |
| Backend | Node.js + Express 5 |
| Database | Supabase PostgreSQL |
| Akses database | `@supabase/supabase-js` di backend |
| HTTP client frontend | axios |
| PWA | vite-plugin-pwa (Workbox) |
| Ikon | lucide-react |
| Styling | CSS murni |
| Hosting | Vercel (frontend dan API sebagai dua project) |

---

## Struktur data

**places**: semua resto, baik kurasi maupun resto pribadi.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | text (PK) | `place-1` untuk seed, `place-<uuid>` untuk resto pribadi |
| `name` | text | nama resto |
| `area_name` | text | kawasan |
| `category` | text | Makan Berat, Burjo & Mie, Kopi & Nugas, Jajanan Malam |
| `price_range` | text | teks kisaran harga |
| `min_price` | integer | harga terendah |
| `rating` | numeric(2,1) | rating kurasi, 0 untuk resto pribadi |
| `open_hours` | text | jam buka |
| `landmark` | text | patokan alamat |
| `description` | text | catatan atau deskripsi |
| `image_url` | text | foto |
| `signature_menus` | jsonb | array `{name, price}` |
| `source` | text | `curated` atau `personal` |
| `created_at`, `updated_at` | timestamptz | waktu data |

**visits**: catatan pernah beli dan review. `place_id` UNIQUE, jadi satu resto satu
review.

| Kolom | Tipe | Keterangan |
| --- | --- | --- |
| `id` | uuid (PK) | dibuat Supabase |
| `place_id` | text (FK, unik) | relasi ke `places.id` |
| `item_name` | text | menu yang dibeli |
| `amount` | integer | nominal belanja |
| `purchased_at` | date | tanggal beli |
| `taste` | smallint | rating enak 1 sampai 5 |
| `affordability` | smallint | rating murah 1 sampai 5 |
| `environment` | smallint | rating lingkungan 1 sampai 5 |
| `note` | text | catatan review |
| `created_at`, `updated_at` | timestamptz | waktu data |

Ambang masuk Rekomendasi untuk resto pribadi: rata-rata tiga rating minimal **4.0**.
Nilai ambang ada di `src/lib/reviews.js` (`RECOMMENDATION_MIN_SCORE`).

---

## Menyiapkan database

1. Buat project Supabase.
2. Buka **SQL Editor**, jalankan `supabase/schema.sql`.
3. Salin **Project URL** dan **publishable key**. Nilai ini hanya dipakai backend.

> **Perhatian**: `schema.sql` memulai dengan `DROP TABLE` untuk `places` dan
> `visits`. Jangan jalankan ulang di project yang sudah berisi data penting.

---

## Menjalankan lokal

Butuh dua terminal.

**Terminal 1, backend API:**

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Isi `server/.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=sb_publishable_xxxxxxxx
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Cek `http://localhost:3000/api/health`.

**Terminal 2, frontend:**

```bash
npm install
npm run dev
```

Buka `http://localhost:5173`. Vite mem-proxy `/api` ke `http://localhost:3000`, jadi
frontend tetap memanggil `/api/places` tanpa CORS saat development.

Frontend `.env` hanya berisi:

```env
VITE_API_BASE_URL=
```

Kosongkan untuk development lokal. Isi saat production.

---

## Endpoint API

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | status server |
| GET | `/api/places` | daftar resto, filter `source`, `category`, `q`, `sort` |
| GET | `/api/places/:id` | detail resto |
| POST | `/api/places` | tambah resto pribadi |
| PUT | `/api/places/:id` | ubah resto pribadi |
| DELETE | `/api/places/:id` | hapus resto pribadi |
| GET | `/api/visits` | daftar pernah beli |
| GET | `/api/visits/:id` | detail review |
| POST | `/api/visits` | tambah review |
| PUT | `/api/visits/:id` | ubah review |
| DELETE | `/api/visits/:id` | hapus review |

Detail body request, contoh Postman, dan error response ada di `server/README.md`.

Resto kurasi tidak bisa diubah atau dihapus lewat API. Operasi tulis hanya untuk
`source = personal`.

---

## Deploy ke Vercel, dua project

### 1. Backend API

1. Push repository ke GitHub.
2. Vercel **Add New > Project**, import repo.
3. **Root Directory**: `server`.
4. Framework preset: **Other**.
5. Environment variables:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `CORS_ORIGIN` (URL frontend, mis. `https://foodhunt.vercel.app`)
6. Deploy. Cek `https://<api>.vercel.app/api/health`.

`server/vercel.json` memakai `@vercel/node` untuk `src/index.js`.

### 2. Frontend

1. Vercel **Add New > Project**, import repo yang sama.
2. Root Directory: root repository.
3. Framework: **Vite**, build `npm run build`, output `dist`.
4. Environment variable:
   `VITE_API_BASE_URL=https://<api>.vercel.app/api`
5. Deploy.

`vercel.json` di root mengarahkan rute SPA ke `index.html`.

Kalau URL frontend berubah, perbarui `CORS_ORIGIN` di backend lalu redeploy.

---

## Struktur proyek

```
server/
  src/
    config/supabaseClient.js
    models/placeModel.js
    models/visitModel.js
    controllers/placeController.js
    controllers/visitController.js
    routes/placeRoutes.js
    routes/visitRoutes.js
    index.js
  .env.example
  package.json
  vercel.json
src/
  config/api.js           axios ke API Express
  services/               placeService, visitService
  context/                Places, Visits, Install, Toast, Update
  pages/                  Home, Foods, FoodDetail, Resto, Visits, Profile
  components/             PlaceRow, VisitCard, ReviewSummary, form modal, dll.
  lib/                    router, format, reviews, errors, storage
  index.css               design system
supabase/schema.sql       DDL, policy, seed
public/                   ikon PWA, robots.txt
```

---

## Keputusan desain

- **Frontend dan backend dipisah**: frontend tidak pernah memegang kredensial
  Supabase. Semua akses data lewat Express.
- **Satu tempat, dua sumber**: rekomendasi kurasi dan resto pribadi memakai tabel
  `places` dengan kolom `source`.
- **Satu review per resto**: memudahkan perbandingan enak, murah, lingkungan.
- **Ambang 4.0**: resto pribadi masuk Rekomendasi hanya kalau kualitasnya terbukti
  lewat review.
- **Krem hangat dan oranye bata**: oranye untuk harga dan aksi utama, hijau untuk
  status pernah dibeli.
- **Fraunces + Plus Jakarta Sans**: karakter papan menu warung, teks form tetap
  mudah dibaca.
- **Sidebar desktop, bottom nav HP**: satu basis kode responsif.

---

## Checklist kriteria selesai

- [x] Frontend memanggil REST API Express buatan sendiri.
- [x] Backend Express memakai struktur config, models, controllers, routes.
- [x] Backend membaca dan menulis ke PostgreSQL Supabase.
- [x] Endpoint CRUD `places` dan `visits` berjalan.
- [x] Bottom navigation berfungsi di 5 halaman utama.
- [x] Tab Rekomendasi menampilkan resto kurasi dan hidden gem minimal 4.0.
- [x] Tab Resto Saya bisa menambah, mengedit, dan menghapus resto pribadi.
- [x] Tab Pernah Beli bisa mencatat, mengedit, dan menghapus review.
- [x] Halaman Profil menampilkan identitas dan statistik.
- [x] Manifest, ikon 192/512, dan service worker aktif.
- [x] Deploy Vercel dua project (frontend dan API).
- [x] Frontend production memanggil API Express, bukan Supabase langsung.

Catatan: data kuliner awal adalah data contoh untuk praktikum, bukan hasil survei
lapangan. Foto contoh diambil dari Unsplash.
