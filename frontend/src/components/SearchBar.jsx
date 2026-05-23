import { Search, X } from 'lucide-react'
import { LOCATION_TYPES, LOCATION_TYPE_ORDER } from '../utils/constants'

export default function SearchBar({
  query,
  type,
  onQueryChange,
  onTypeChange,
  onClear,
  resultLabel,
  disabled = false,
}) {
  const hasFilters = query.trim() || type !== 'all'

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <label className="relative min-w-0 flex-1">
        <span className="sr-only">Search places and events</span>
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-cm-warm-gray"
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
          placeholder="Search places, events, hosts..."
          className="w-full rounded-card border border-black/10 bg-white px-9 py-2.5 text-sm text-cm-charcoal shadow-card outline-none transition placeholder:text-cm-warm-gray focus:border-cm-orange focus:ring-2 focus:ring-cm-orange/25 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-cm-warm-gray transition hover:bg-cm-cream hover:text-cm-charcoal"
            aria-label="Clear search text"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      <div className="flex items-center gap-2">
        <label className="sr-only" htmlFor="location-type-filter">
          Filter by location type
        </label>
        <select
          id="location-type-filter"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          disabled={disabled}
          className="min-w-36 rounded-card border border-black/10 bg-white px-3 py-2.5 text-sm font-medium text-cm-charcoal shadow-card outline-none transition focus:border-cm-orange focus:ring-2 focus:ring-cm-orange/25 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <option value="all">All spaces</option>
          {LOCATION_TYPE_ORDER.map((key) => (
            <option key={key} value={key}>
              {LOCATION_TYPES[key].label}
            </option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={onClear}
            className="rounded-card bg-cm-charcoal px-3 py-2.5 text-sm font-semibold text-white shadow-card transition hover:bg-cm-charcoal/90"
          >
            Clear
          </button>
        )}
      </div>

      <div className="text-xs font-medium text-cm-warm-gray sm:min-w-28 sm:text-right">
        {resultLabel}
      </div>
    </div>
  )
}
