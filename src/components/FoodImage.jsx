import { useEffect, useState } from 'react'
import { UtensilsCrossed } from 'lucide-react'

// ---------------------------------------------------------------------------
// FoodImage : gambar dengan rasio tetap dan fallback kalau URL gagal.
// ---------------------------------------------------------------------------

export default function FoodImage({
  src,
  alt,
  className = '',
  priority = false,
}) {
  const [failed, setFailed] = useState(false)

  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={alt}>
        <UtensilsCrossed size={22} aria-hidden="true" />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      width="640"
      height="480"
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      fetchPriority={priority ? 'high' : 'auto'}
      onError={() => setFailed(true)}
    />
  )
}
