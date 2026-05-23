import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import LocationPin from './LocationPin'
import { LOCATION_TYPES, MAP_DEFAULTS } from '../utils/constants'
import Badge from './ui/Badge'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN

export default function MapView({
  locations = [],
  onSelect,
  selectedLocationId = null,
  highlightedLocationIds = [],
}) {
  const mapRef = useRef(null)
  const [selected, setSelected] = useState(null)
  const highlightedSet = useMemo(
    () => new Set(highlightedLocationIds),
    [highlightedLocationIds],
  )

  useEffect(() => {
    if (!selectedLocationId) return
    const loc = locations.find((item) => item.id === selectedLocationId)
    if (!loc) return
    mapRef.current?.flyTo({
      center: [loc.longitude, loc.latitude],
      zoom: Math.max(MAP_DEFAULTS.zoom, 14),
      duration: 650,
      essential: true,
    })
  }, [locations, selectedLocationId])

  if (!MAPBOX_TOKEN) {
    return (
      <div
        className="flex h-full items-center justify-center p-8 text-center font-body"
        style={{ color: 'var(--color-text-primary)' }}
      >
        Missing{' '}
        <code
          className="font-mono mx-1 px-1"
          style={{ background: 'var(--color-bg-tertiary)', fontSize: 11 }}
        >
          VITE_MAPBOX_TOKEN
        </code>
        . Add it to{' '}
        <code
          className="font-mono mx-1 px-1"
          style={{ background: 'var(--color-bg-tertiary)', fontSize: 11 }}
        >
          frontend/.env.local
        </code>{' '}
        and restart dev.
      </div>
    )
  }

  const handleSelect = (loc) => {
    setSelected(loc)
    onSelect?.(loc)
  }

  return (
    <Map
      ref={mapRef}
      mapboxAccessToken={MAPBOX_TOKEN}
      initialViewState={{
        latitude: MAP_DEFAULTS.center.latitude,
        longitude: MAP_DEFAULTS.center.longitude,
        zoom: MAP_DEFAULTS.zoom,
      }}
      mapStyle={MAP_DEFAULTS.style}
      style={{ width: '100%', height: '100%' }}
    >
      <NavigationControl position="top-right" />

      {locations.map((loc) => (
        <Marker
          key={loc.id}
          latitude={loc.latitude}
          longitude={loc.longitude}
          anchor="bottom"
          onClick={(e) => {
            e.originalEvent.stopPropagation()
            handleSelect(loc)
          }}
        >
          <LocationPin
            type={loc.type}
            highlighted={highlightedSet.has(loc.id)}
            selected={selectedLocationId === loc.id}
          />
        </Marker>
      ))}

      {selected && (
        <Popup
          latitude={selected.latitude}
          longitude={selected.longitude}
          anchor="top"
          offset={20}
          closeButton
          closeOnClick={false}
          onClose={() => setSelected(null)}
        >
          <div className="max-w-xs" style={{ minWidth: 200 }}>
            <Badge variant={LOCATION_TYPES[selected.type]?.badgeVariant || 'neutral'}>
              {LOCATION_TYPES[selected.type]?.label}
            </Badge>
            <div
              className="font-brand mt-2"
              style={{ fontSize: 15, color: 'var(--color-text-primary)', letterSpacing: '0.01em' }}
            >
              {selected.name}
            </div>
            <div
              className="font-mono mt-1 uppercase"
              style={{ fontSize: 10, color: 'var(--color-text-tertiary)', letterSpacing: '0.06em' }}
            >
              {selected.address}
            </div>
            <div
              className="font-body mt-2"
              style={{ fontSize: 13, lineHeight: 1.5, color: 'var(--color-text-secondary)' }}
            >
              {selected.description}
            </div>
          </div>
        </Popup>
      )}
    </Map>
  )
}
