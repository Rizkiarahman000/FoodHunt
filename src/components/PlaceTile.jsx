import { Link } from '../lib/router'
import FoodImage from './FoodImage'
import RatingPill from './RatingPill'
import { effectiveScore } from '../lib/reviews'

export default function PlaceTile({ place, visit, priority = false }) {
  const score = effectiveScore(place, visit)

  return (
    <Link to={`/foods/${place.id}`} className="food-tile">
      <FoodImage
        src={place.imageUrl}
        alt={place.name}
        className="food-tile-img"
        priority={priority}
      />
      <div className="food-tile-body">
        <div className="tile-top">
          <p className="tile-area">{place.areaName}</p>
          {score > 0 ? <RatingPill value={score} /> : null}
        </div>
        <h3 className="tile-name">{place.name}</h3>
        <p className="tile-price">{place.priceRange}</p>
        {place.source === 'personal' && (
          <span className="chip chip--hidden tile-chip">Hidden gem</span>
        )}
      </div>
    </Link>
  )
}
