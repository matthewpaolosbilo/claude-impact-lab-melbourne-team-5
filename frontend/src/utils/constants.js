import { Flame, Sprout, ChefHat } from 'lucide-react'

// Colours map to PXL-DS-v3 accent tokens so location pins read as part of the
// design system (coral / mint / electric).
export const LOCATION_TYPES = {
  bbq: { label: 'BBQ', color: '#FF6147', Icon: Flame, badgeVariant: 'coral' },
  garden_bed: { label: 'Garden', color: '#3ECFAC', Icon: Sprout, badgeVariant: 'mint' },
  community_kitchen: { label: 'Kitchen', color: '#7B5EA7', Icon: ChefHat, badgeVariant: 'electric' },
}

export const LOCATION_TYPE_ORDER = ['bbq', 'garden_bed', 'community_kitchen']

export const MAP_DEFAULTS = {
  center: { latitude: -37.8136, longitude: 144.9631 },
  zoom: 13,
  style: 'mapbox://styles/melmo/cmphu9gc6002501srdqch68kt',
}
