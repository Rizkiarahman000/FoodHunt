import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

// ---------------------------------------------------------------------------
// generate-icons.mjs — membuat ikon PWA tanpa dependensi gambar.
// Semua bentuk digambar manual lalu di-downsample 4x supaya tepinya halus.
// Jalankan: npm run icons
// ---------------------------------------------------------------------------

const OUT_DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'public')
mkdirSync(OUT_DIR, { recursive: true })

const CRC_TABLE = (() => {
  const table = new Uint32Array(256)
  for (let n = 0; n < 256; n += 1) {
    let c = n
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

function crc32(buffer) {
  let c = 0xffffffff
  for (let i = 0; i < buffer.length; i += 1) c = CRC_TABLE[(c ^ buffer[i]) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const length = Buffer.alloc(4)
  length.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([length, body, crc])
}

function encodePng(size, pixels) {
  const stride = size * 4
  const raw = Buffer.alloc((stride + 1) * size)
  for (let y = 0; y < size; y += 1) {
    raw[y * (stride + 1)] = 0
    pixels.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride)
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8
  ihdr[9] = 6
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  return Buffer.concat([
    signature,
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
}

function mix(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ]
}

function insideRoundedRect(x, y, size, radius) {
  const dx = Math.max(radius - x, 0, x - (size - radius))
  const dy = Math.max(radius - y, 0, y - (size - radius))
  return dx * dx + dy * dy <= radius * radius
}

function insideCircle(x, y, cx, cy, r) {
  return (x - cx) ** 2 + (y - cy) ** 2 <= r * r
}

function insideTriangle(px, py, a, b, c) {
  const area = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y)
  const s = ((b.x - px) * (c.y - py) - (c.x - px) * (b.y - py)) / area
  const t = ((c.x - px) * (a.y - py) - (a.x - px) * (c.y - py)) / area
  return s >= 0 && t >= 0 && s + t <= 1
}

function render(size, { rounded, name }) {
  const SS = 4
  const big = size * SS
  const top = [251, 146, 60]
  const bottom = [234, 88, 12]
  const pin = [255, 250, 243]
  const hole = [154, 52, 18]
  const radius = rounded ? big * 0.22 : 0

  const hi = {
    cx: big * 0.5,
    cy: big * 0.38,
    r: big * 0.215,
  }
  const tip = { x: big * 0.5, y: big * 0.775 }
  const left = { x: big * 0.5 - big * 0.2, y: big * 0.38 }
  const right = { x: big * 0.5 + big * 0.2, y: big * 0.38 }

  const frame = Buffer.alloc(big * big * 4)
  for (let y = 0; y < big; y += 1) {
    const base = mix(top, bottom, y / (big - 1))
    for (let x = 0; x < big; x += 1) {
      const i = (y * big + x) * 4
      if (rounded && !insideRoundedRect(x, y, big, radius)) {
        frame[i + 3] = 0
        continue
      }
      let color = base
      const inPin =
        insideCircle(x, y, hi.cx, hi.cy, hi.r) ||
        insideTriangle(x, y, tip, left, right)
      if (inPin) color = pin
      if (inPin && insideCircle(x, y, hi.cx, hi.cy, big * 0.088)) color = hole

      frame[i] = color[0]
      frame[i + 1] = color[1]
      frame[i + 2] = color[2]
      frame[i + 3] = 255
    }
  }

  const pixels = Buffer.alloc(size * size * 4)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      let r = 0
      let g = 0
      let b = 0
      let a = 0
      for (let sy = 0; sy < SS; sy += 1) {
        for (let sx = 0; sx < SS; sx += 1) {
          const i = ((y * SS + sy) * big + (x * SS + sx)) * 4
          const alpha = frame[i + 3] / 255
          r += frame[i] * alpha
          g += frame[i + 1] * alpha
          b += frame[i + 2] * alpha
          a += alpha
        }
      }
      const count = SS * SS
      const i = (y * size + x) * 4
      pixels[i] = a ? Math.round(r / a) : 0
      pixels[i + 1] = a ? Math.round(g / a) : 0
      pixels[i + 2] = a ? Math.round(b / a) : 0
      pixels[i + 3] = Math.round((a / count) * 255)
    }
  }

  writeFileSync(join(OUT_DIR, name || `icon-${size}.png`), encodePng(size, pixels))
}

render(192, { rounded: true })
render(512, { rounded: true })
render(180, { rounded: false, name: 'apple-touch-icon.png' })

