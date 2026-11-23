import { Search, X } from 'lucide-react'

export default function SearchField({ value, onChange, onSubmit, placeholder }) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit?.()
  }

  return (
    <form className="search-form" role="search" onSubmit={handleSubmit}>
      <Search size={18} className="search-icon" aria-hidden="true" />
      <label className="sr-only" htmlFor="foodhunt-search">
        Cari tempat makan
      </label>
      <input
        id="foodhunt-search"
        type="search"
        className="search-input"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder || 'Cari warung, menu, atau kawasan'}
        autoComplete="off"
      />
      {value ? (
        <button
          type="button"
          className="search-clear"
          onClick={() => onChange('')}
          aria-label="Hapus pencarian"
        >
          <X size={16} aria-hidden="true" />
        </button>
      ) : null}
    </form>
  )
}
