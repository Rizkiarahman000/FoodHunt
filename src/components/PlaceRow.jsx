import { MapPin } from 'lucide-react'
import { Link } from '../lib/router'
import FoodImage from './FoodImage'
import RatingPill from './RatingPill'
import { effectiveScore } from '../lib/reviews'

export default function PlaceRow({ place, visit }) {
  const score = effectiveScore(place, visit)
  const isPersonal = place.source === 'personal'

  return (
    <Link to={`/foods/${place.id}`} className="food-row">
      <FoodImage src={place.imageUrl} alt={place.name} className="food-row-img" />
      <div className="food-row-body">
        <div className="food-row-head">
          <span className="chip chip--soft">{place.category}</span>
          {score > 0 ? (
            <RatingPill value={score} />
          ) : (
            <span className="chip chip--trait">Belum direview</span>
          )}
        </div>
        <h2 className="food-row-name">{place.name}</h2>
        <p className="food-row-area">
          <MapPin size={13} aria-hidden="true" />
          {place.areaName}
        </p>
        <p className="food-row-price">{place.priceRange}</p>
        {(isPersonal || visit) && (
          <div className="row-badges">
            {isPersonal && <span className="chip chip--hidden">Hidden gem</span>}
            {visit && <span className="chip chip--done">Sudah dibeli</span>}
          </div>
        )}
      </div>
    </Link>
  )
}
