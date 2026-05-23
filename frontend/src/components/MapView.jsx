import { useEffect, useMemo, useRef, useState } from 'react'
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/mapbox'
import 'mapbox-gl/dist/mapbox-gl.css'
import LocationPin from './LocationPin'
import { LOCATION_TYPES, MAP_DEFAULTS } from '../utils/constants'

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
      <div className="flex h-full items-center justify-center p-8 text-center text-cm-charcoal">
        Missing <code className="mx-1 rounded bg-black/5 px-1">VITE_MAPBOX_TOKEN</code>.
        Add it to <code className="mx-1 rounded bg-black/5 px-1">frontend/.env.local</code> and restart dev.
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
          <div className="p-1 max-w-xs">
            <div
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: LOCATION_TYPES[selected.type]?.color }}
            >
              {LOCATION_TYPES[selected.type]?.label}
            </div>
            <div className="mt-0.5 font-semibold text-cm-charcoal">{selected.name}</div>
            <div className="mt-1 text-xs text-cm-warm-gray">{selected.address}</div>
            <div className="mt-2 text-sm leading-snug">{selected.description}</div>
          </div>
        </Popup>
      )}
    </Map>
  )
}
