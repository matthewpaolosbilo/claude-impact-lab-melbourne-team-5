import { Search, X } from 'lucide-react'
import { LOCATION_TYPES, LOCATION_TYPE_ORDER } from '../utils/constants'
import { Select } from './ui/Input'
import Button from './ui/Button'

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
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2"
          style={{ color: 'var(--color-text-secondary)' }}
          aria-hidden
        />
        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          disabled={disabled}
          placeholder="search places, events, hosts…"
          className="w-full font-body"
          style={{
            paddingLeft: 36,
            paddingRight: query ? 36 : 13,
            paddingTop: 10,
            paddingBottom: 10,
            fontSize: 13,
            background: 'var(--color-bg-secondary)',
            color: 'var(--color-text-primary)',
            outline: '2px solid var(--color-border-strong)',
            outlineOffset: 0,
            borderRadius: 0,
            border: 'none',
          }}
          onFocus={(e) => {
            e.currentTarget.style.outline = '2px solid var(--color-text-primary)'
          }}
          onBlur={(e) => {
            e.currentTarget.style.outline = '2px solid var(--color-border-strong)'
          }}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="cursor-pointer absolute right-2 top-1/2 -translate-y-1/2 p-1"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-secondary)',
            }}
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
        <Select
          id="location-type-filter"
          value={type}
          onChange={(e) => onTypeChange(e.target.value)}
          disabled={disabled}
          style={{ minWidth: 144 }}
        >
          <option value="all">All spaces</option>
          {LOCATION_TYPE_ORDER.map((key) => (
            <option key={key} value={key}>
              {LOCATION_TYPES[key].label}
            </option>
          ))}
        </Select>

        {hasFilters && (
          <Button variant="primary" size="sm" onClick={onClear}>
            Clear
          </Button>
        )}
      </div>

      <div
        className="font-mono"
        style={{
          fontSize: 10,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          minWidth: 0,
          textAlign: 'right',
        }}
      >
        {resultLabel}
      </div>
    </div>
  )
}
