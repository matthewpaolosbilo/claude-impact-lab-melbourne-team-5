import { Flame, Sprout, ChefHat } from 'lucide-react'

export const LOCATION_TYPES = {
  bbq: { label: 'BBQ', color: '#F97316', Icon: Flame },
  garden_bed: { label: 'Garden', color: '#22C55E', Icon: Sprout },
  community_kitchen: { label: 'Kitchen', color: '#A855F7', Icon: ChefHat },
}

export const LOCATION_TYPE_ORDER = ['bbq', 'garden_bed', 'community_kitchen']

export const MAP_DEFAULTS = {
  center: { latitude: -37.8136, longitude: 144.9631 },
  zoom: 13,
  style: 'mapbox://styles/mapbox/light-v11',
}
