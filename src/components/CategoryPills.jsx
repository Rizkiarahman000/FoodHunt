const PILLS = ['Semua', 'Makan Berat', 'Burjo & Mie', 'Kopi & Nugas', 'Jajanan Malam']

export default function CategoryPills({ value, onChange, items = PILLS }) {
  return (
    <div className="pills" role="group" aria-label="Filter kategori">
      {items.map((category) => {
        const active = value === category
        return (
          <button
            key={category}
            type="button"
            className={`pill${active ? ' is-active' : ''}`}
            aria-pressed={active}
            onClick={() => onChange(category)}
          >
            {category}
          </button>
        )
      })}
    </div>
  )
}
