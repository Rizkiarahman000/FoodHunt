# FoodHunt API

Backend Express untuk FoodHunt. Frontend hanya memanggil API ini. API inilah yang
membaca dan menulis data ke Supabase PostgreSQL.

Struktur mengikuti Modul 1: `config`, `models`, `controllers`, `routes`.

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
```

## Menjalankan lokal

```bash
cd server
npm install
copy .env.example .env
npm run dev
```

Isi `.env`:

```env
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_KEY=sb_publishable_xxxxxxxx
PORT=3000
CORS_ORIGIN=http://localhost:5173
```

Server berjalan di `http://localhost:3000`.

Cek:

```bash
curl http://localhost:3000/api/health
```

## Endpoint

| Method | Endpoint | Keterangan |
| --- | --- | --- |
| GET | `/api/health` | status server |
| GET | `/api/places` | daftar resto, filter `source`, `category`, `q`, `sort` |
| GET | `/api/places/:id` | detail resto |
| POST | `/api/places` | tambah resto pribadi |
| PUT | `/api/places/:id` | ubah resto pribadi |
| DELETE | `/api/places/:id` | hapus resto pribadi |
| GET | `/api/visits` | daftar pernah beli, filter `place_id` |
| GET | `/api/visits/:id` | detail review |
| POST | `/api/visits` | tambah review |
| PUT | `/api/visits/:id` | ubah review |
| DELETE | `/api/visits/:id` | hapus review |

`PATCH` juga diterima untuk `places/:id` dan `visits/:id`.

Resto kurasi (`source = curated`) tidak bisa diubah atau dihapus lewat API. Endpoint
hanya mengizinkan `source = personal` untuk operasi tulis.

### Contoh POST /api/places

```json
{
  "name": "Warung Bu Tini",
  "area_name": "Kawasan Jl. Gondang",
  "category": "Makan Berat",
  "price_range": "Rp8.000 - Rp15.000",
  "min_price": 8000,
  "open_hours": "09.00 - 21.00 WIB",
  "landmark": "Seberang bengkel",
  "description": "Nasi rames rumahan.",
  "image_url": ""
}
```

Respons `201` berisi baris resto yang baru dibuat, termasuk `id` dan `source`.

### Contoh POST /api/visits

```json
{
  "place_id": "place-1",
  "item_name": "Geprek + es teh",
  "amount": 15000,
  "purchased_at": "2026-11-23",
  "taste": 5,
  "affordability": 4,
  "environment": 3,
  "note": "Sambalnya enak"
}
```

Respons `201` berisi review. Kalau resto sudah punya review, API mengembalikan
`409` dengan kode `23505`.

## Error response

```json
{
  "error": "Pesan yang bisa ditampilkan ke pengguna",
  "code": "23505"
}
```

Status yang dipakai: `200`, `201`, `400`, `404`, `409`, `500`.

## Deploy ke Vercel (project terpisah dari frontend)

1. Buat repository atau gunakan repository yang sama, lalu di Vercel pilih
   **Add New > Project**.
2. Set **Root Directory** ke `server`.
3. Framework preset: **Other**. Build command kosong, output kosong. Vercel memakai
   `vercel.json` dan `@vercel/node` untuk `src/index.js`.
4. Tambahkan environment variable:
   - `SUPABASE_URL`
   - `SUPABASE_KEY`
   - `CORS_ORIGIN` (URL frontend, mis. `https://foodhunt.vercel.app`)
5. Deploy, lalu cek `https://<api>.vercel.app/api/health`.
6. Isi `VITE_API_BASE_URL=https://<api>.vercel.app/api` di project frontend Vercel,
   lalu redeploy frontend.

Jangan pernah menaruh `SUPABASE_KEY` di environment frontend atau di kode React.
