import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import placeRoutes from './routes/placeRoutes.js'
import visitRoutes from './routes/visitRoutes.js'

dotenv.config()

const app = express()

const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(
  cors(
    allowedOrigins.length === 0 || allowedOrigins.includes('*')
      ? {}
      : { origin: allowedOrigins },
  ),
)
app.use(express.json({ limit: '1mb' }))

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'foodhunt-api',
    time: new Date().toISOString(),
  })
})

app.use('/api/places', placeRoutes)
app.use('/api/visits', visitRoutes)

app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint tidak ditemukan' })
})

// Error handler terpusat, termasuk body JSON yang tidak valid.
app.use((err, req, res, next) => {
  if (err?.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Body JSON tidak valid' })
  }
  console.error(err)
  res.status(500).json({ error: 'Terjadi kesalahan pada server' })
})

const port = process.env.PORT || 3000

// Vercel memakai default export ini sebagai serverless function.
// Di lokal, server dijalankan dengan app.listen.
export default app

if (!process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`FoodHunt API berjalan di http://localhost:${port}`)
  })
}
