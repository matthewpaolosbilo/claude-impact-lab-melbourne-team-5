// Event type config. Mirrors LOCATION_TYPES pattern in constants.js.
// Server enum (from STATE.md Event model):
// "cook_share" | "plant_learn" | "fix_flow" | "social" | "culture_country"
// Colours and badgeVariant align to PXL-DS-v3 accent tokens.
export const EVENT_TYPES = {
  cook_share:      { label: 'Cook & share',      color: '#FF6147', badgeVariant: 'coral', accent: 'coral' },
  plant_learn:     { label: 'Plant & learn',     color: '#3ECFAC', badgeVariant: 'mint', accent: 'mint' },
  social:          { label: 'Social',            color: '#C8F135', badgeVariant: 'lime', accent: 'lime' },
  fix_flow:        { label: 'Fix & flow',        color: '#4DAEEC', badgeVariant: 'sky', accent: 'sky' },
  culture_country: { label: 'Culture & country', color: '#7B5EA7', badgeVariant: 'electric', accent: 'electric' },
}

export const EVENT_TYPE_ORDER = [
  'cook_share',
  'plant_learn',
  'social',
  'fix_flow',
  'culture_country',
]
