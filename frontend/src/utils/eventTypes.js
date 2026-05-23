// Event type config. Mirrors LOCATION_TYPES pattern in constants.js.
// Server enum (from STATE.md Event model):
// "cook_share" | "plant_learn" | "fix_flow" | "social" | "culture_country"
export const EVENT_TYPES = {
  cook_share:      { label: 'Cook & share',  color: '#F97316' }, // cm-orange
  plant_learn:     { label: 'Plant & learn', color: '#22C55E' }, // cm-green
  social:          { label: 'Social',        color: '#EAB308' }, // cm-gold
  fix_flow:        { label: 'Fix & flow',    color: '#1C1917' }, // cm-charcoal
  culture_country: { label: 'Culture & country', color: '#A855F7' }, // cm-purple
}

export const EVENT_TYPE_ORDER = [
  'cook_share',
  'plant_learn',
  'social',
  'fix_flow',
  'culture_country',
]
