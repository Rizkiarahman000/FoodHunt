-- =====================================================
-- FoodHunt: skema database + seed
-- Jalankan di Supabase Dashboard > SQL Editor.
--
-- Model:
--   public.places  semua resto (kurasi dan resto pribadi)
--   public.visits  catatan pernah beli + review per resto
--
-- Satu resto hanya punya satu review. Review mencakup
-- rating enak, murah, lingkungan, menu yang dibeli, nominal,
-- tanggal, dan catatan.
-- =====================================================

-- =====================================================
-- 0. RESET TABEL LAMA
--    Hunt List lama kosong, data foods/areas hanya seed.
-- =====================================================

DROP TABLE IF EXISTS public.visits CASCADE;
DROP TABLE IF EXISTS public.huntlist CASCADE;
DROP TABLE IF EXISTS public.foods CASCADE;
DROP TABLE IF EXISTS public.areas CASCADE;

-- =====================================================
-- 1. TABEL RESTO
--    source = 'curated' (rekomendasi) atau 'personal' (hidden gem)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.places (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    area_name TEXT NOT NULL,
    category TEXT NOT NULL,
    price_range TEXT NOT NULL,
    min_price INTEGER NOT NULL DEFAULT 0 CHECK (min_price >= 0),
    rating NUMERIC(2,1) NOT NULL DEFAULT 0 CHECK (rating BETWEEN 0 AND 5),
    open_hours TEXT,
    landmark TEXT,
    description TEXT NOT NULL DEFAULT '',
    image_url TEXT,
    signature_menus JSONB NOT NULL DEFAULT '[]'::jsonb,
    source TEXT NOT NULL DEFAULT 'curated'
        CHECK (source IN ('curated', 'personal')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS places_source_idx ON public.places (source);
CREATE INDEX IF NOT EXISTS places_category_idx ON public.places (category);
CREATE INDEX IF NOT EXISTS places_area_idx ON public.places (area_name);
CREATE INDEX IF NOT EXISTS places_min_price_idx ON public.places (min_price);

-- =====================================================
-- 2. TABEL PERNAH BELI + REVIEW
--    UNIQUE place_id: satu resto satu review.
-- =====================================================

CREATE TABLE IF NOT EXISTS public.visits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id TEXT NOT NULL UNIQUE
        REFERENCES public.places(id) ON DELETE CASCADE,
    item_name TEXT NOT NULL DEFAULT '',
    amount INTEGER CHECK (amount >= 0),
    purchased_at DATE NOT NULL DEFAULT CURRENT_DATE,
    taste SMALLINT NOT NULL CHECK (taste BETWEEN 1 AND 5),
    affordability SMALLINT NOT NULL CHECK (affordability BETWEEN 1 AND 5),
    environment SMALLINT NOT NULL CHECK (environment BETWEEN 1 AND 5),
    note TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS visits_place_idx ON public.visits (place_id);
CREATE INDEX IF NOT EXISTS visits_date_idx ON public.visits (purchased_at DESC);

-- =====================================================
-- 3. HAK AKSES + ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.places ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.places TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.visits TO anon, authenticated;

DROP POLICY IF EXISTS "Public read places" ON public.places;
DROP POLICY IF EXISTS "Public write places" ON public.places;
DROP POLICY IF EXISTS "Public read visits" ON public.visits;
DROP POLICY IF EXISTS "Public write visits" ON public.visits;

CREATE POLICY "Public read places"
ON public.places FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Public write places"
ON public.places FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

CREATE POLICY "Public read visits"
ON public.visits FOR SELECT TO anon, authenticated
USING (true);

CREATE POLICY "Public write visits"
ON public.visits FOR ALL TO anon, authenticated
USING (true) WITH CHECK (true);

-- =====================================================
-- 4. SEED REKOMENDASI (10 resto kurasi di Tembalang)
-- =====================================================

INSERT INTO public.places (
    id, name, area_name, category, price_range, min_price, rating,
    open_hours, landmark, description, image_url, signature_menus, source
)
VALUES
(
    'place-1', 'Penyetan Mas Kobis Sirojudin', 'Kawasan Jl. Sirojudin', 'Makan Berat',
    'Rp12.000 - Rp20.000', 12000, 4.8,
    '16.00 - 23.30 WIB', 'Sebelah barat pertigaan Sirojudin',
    'Ayam dan lele goreng dengan sambal bawang ulek dadakan. Level pedasnya bisa diminta, dan tempe atau terong gorengnya sering jadi tambahan wajib.',
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Paket Ayam Geprek + Es Teh","price":"Rp15.000"},{"name":"Paket Lele Penyet + Nasi","price":"Rp13.000"},{"name":"Tahu Tempe Terong Penyet","price":"Rp10.000"}]'::jsonb,
    'curated'
),
(
    'place-2', 'Burjo Borneo', 'Kawasan Jl. Sirojudin', 'Burjo & Mie',
    'Rp8.000 - Rp15.000', 8000, 4.5,
    '17.00 - 01.00 WIB', 'Seberang gang masuk Sirojudin',
    'Burjo yang paling ramai setelah jam kuliah. Menu andalannya indomie godog dan magelangan, cocok buat makan malam cepat sebelum lanjut ngerjain tugas.',
    'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Indomie Godog Telur","price":"Rp10.000"},{"name":"Magelangan","price":"Rp12.000"},{"name":"Roti Bakar Cokelat","price":"Rp8.000"}]'::jsonb,
    'curated'
),
(
    'place-3', 'Nasi Goreng Gondrong', 'Kawasan Jl. Sirojudin', 'Jajanan Malam',
    'Rp10.000 - Rp17.000', 10000, 4.6,
    '18.00 - 00.30 WIB', 'Depan kos Gondrong, Jl. Sirojudin',
    'Nasi goreng kampung dengan aroma bawang yang kuat, dimasak satu per satu di depan pembeli. Porsinya pas untuk makan malam setelah belajar.',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Nasi Goreng Kampung","price":"Rp13.000"},{"name":"Nasi Goreng Mawut","price":"Rp15.000"},{"name":"Mie Goreng Jawa","price":"Rp12.000"}]'::jsonb,
    'curated'
),
(
    'place-4', 'Warmindo Banjarsari', 'Kawasan Jl. Banjarsari', 'Burjo & Mie',
    'Rp8.000 - Rp14.000', 8000, 4.4,
    '10.00 - 23.00 WIB', 'Dekat pertigaan Banjarsari',
    'Warmindo sederhana dengan meja panjang dan colokan di beberapa sudut. Menu standar indomie, nasi telur, dan minuman dingin dengan harga tetap ramah kantong.',
    'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Indomie Nyemek Telur","price":"Rp11.000"},{"name":"Nasi Telur Kecap","price":"Rp9.000"},{"name":"Es Jeruk","price":"Rp5.000"}]'::jsonb,
    'curated'
),
(
    'place-5', 'Ayam Geprek Kumlot', 'Kawasan Jl. Banjarsari', 'Makan Berat',
    'Rp12.000 - Rp22.000', 12000, 4.7,
    '10.00 - 22.00 WIB', 'Sebelah minimarket Jl. Banjarsari',
    'Geprek dengan sambal bawang yang pedasnya konsisten. Tersedia level 1 sampai 5, dan ada varian mozzarella untuk yang mau porsi lebih berat.',
    'https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Geprek Sambal Bawang + Nasi","price":"Rp15.000"},{"name":"Geprek Mozzarella","price":"Rp22.000"},{"name":"Paket Geprek + Es Teh","price":"Rp17.000"}]'::jsonb,
    'curated'
),
(
    'place-6', 'Es Teh & Kopi Sudut Kampus', 'Kawasan Jl. Banjarsari', 'Kopi & Nugas',
    'Rp5.000 - Rp15.000', 5000, 4.6,
    '08.00 - 23.00 WIB', 'Samping kampus, Jl. Banjarsari',
    'Kedai kecil dengan es teh jumbo dan kopi susu gula aren. Tempatnya sempit, tapi wifi dan stopkontaknya cukup untuk nugas satu sore.',
    'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Es Teh Jumbo","price":"Rp5.000"},{"name":"Kopi Susu Gula Aren","price":"Rp12.000"},{"name":"Americano","price":"Rp10.000"}]'::jsonb,
    'curated'
),
(
    'place-7', 'Soto Ayam Gondang', 'Kawasan Jl. Gondang', 'Makan Berat',
    'Rp12.000 - Rp18.000', 12000, 4.7,
    '07.00 - 15.00 WIB', 'Jl. Gondang, dekat masjid',
    'Soto ayam kuah bening dengan koya terpisah. Ramai saat jam sarapan dan makan siang, jadi paling enak datang sebelum jam 12.',
    'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Soto Ayam + Nasi","price":"Rp14.000"},{"name":"Soto Daging","price":"Rp18.000"},{"name":"Es Teh Manis","price":"Rp4.000"}]'::jsonb,
    'curated'
),
(
    'place-8', 'Mie Ayam & Bakso Pak Min', 'Kawasan Jl. Gondang', 'Burjo & Mie',
    'Rp10.000 - Rp16.000', 10000, 4.5,
    '09.00 - 21.00 WIB', 'Jl. Gondang, seberang bengkel',
    'Mie ayam dengan minyak bawang yang wangi dan bakso urat berukuran besar. Porsi regulernya sudah cukup mengenyangkan.',
    'https://images.unsplash.com/photo-1552611052-33e04de081de?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Mie Ayam Biasa","price":"Rp10.000"},{"name":"Mie Ayam Bakso","price":"Rp15.000"},{"name":"Bakso Urat","price":"Rp13.000"}]'::jsonb,
    'curated'
),
(
    'place-9', 'Sate Taichan Tembalang', 'Kawasan Jl. Jatimulyo / Ngesrep', 'Jajanan Malam',
    'Rp15.000 - Rp25.000', 15000, 4.6,
    '18.00 - 00.00 WIB', 'Jl. Jatimulyo, dekat lapangan',
    'Sate ayam tanpa bumbu kacang, dibakar lalu disajikan dengan sambal dan perasan jeruk limau. Cocok untuk makan malam bareng teman.',
    'https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Sate Taichan 10 Tusuk","price":"Rp20.000"},{"name":"Nasi + Sate Taichan","price":"Rp25.000"},{"name":"Es Teh","price":"Rp5.000"}]'::jsonb,
    'curated'
),
(
    'place-10', 'Bubur Ayam Pagi Ngesrep', 'Kawasan Jl. Jatimulyo / Ngesrep', 'Makan Berat',
    'Rp8.000 - Rp13.000', 8000, 4.4,
    '05.30 - 10.00 WIB', 'Jl. Ngesrep, depan apotek',
    'Bubur ayam dengan kuah kuning, suwiran ayam, dan kerupuk. Paling ramai sebelum jam 08.00, sering habis lebih cepat saat akhir pekan.',
    'https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=900&q=70',
    '[{"name":"Bubur Ayam Biasa","price":"Rp8.000"},{"name":"Bubur Ayam + Telur","price":"Rp10.000"},{"name":"Bubur Ayam Spesial","price":"Rp13.000"}]'::jsonb,
    'curated'
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    area_name = EXCLUDED.area_name,
    category = EXCLUDED.category,
    price_range = EXCLUDED.price_range,
    min_price = EXCLUDED.min_price,
    rating = EXCLUDED.rating,
    open_hours = EXCLUDED.open_hours,
    landmark = EXCLUDED.landmark,
    description = EXCLUDED.description,
    image_url = EXCLUDED.image_url,
    signature_menus = EXCLUDED.signature_menus,
    source = EXCLUDED.source,
    updated_at = NOW();
