// Parse [EVENT:id] tags out of a Maxxer reply.
//
// `parseMaxxerText("there's a bbq [EVENT:12] and a garden sesh [EVENT:7]")`
// →  { segments: [{kind:'text', text:"there's a bbq "}, {kind:'event', eventId:12},
//                 {kind:'text', text:' and a garden sesh '}, {kind:'event', eventId:7}],
//      eventIds: [12, 7] }
//
// The renderer can walk `segments` to interleave text and event cards. Duplicates in
// `eventIds` are kept (order preserved) — the caller decides whether to dedupe.

const TAG = /\[EVENT:(\d+)\]/g

export function parseMaxxerText(text) {
  if (!text) return { segments: [], eventIds: [] }
  const segments = []
  const eventIds = []
  let cursor = 0
  for (const match of text.matchAll(TAG)) {
    const id = Number(match[1])
    if (match.index > cursor) {
      segments.push({ kind: 'text', text: text.slice(cursor, match.index) })
    }
    segments.push({ kind: 'event', eventId: id })
    eventIds.push(id)
    cursor = match.index + match[0].length
  }
  if (cursor < text.length) {
    segments.push({ kind: 'text', text: text.slice(cursor) })
  }
  return { segments, eventIds }
}
