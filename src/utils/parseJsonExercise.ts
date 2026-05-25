import type { Exercise, NoteData } from '../data/exercises'

const STEP_SEMITONE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

function pitchToMidi(pitch: string): number {
  const m = pitch.match(/^([A-G])(#|b?)(-?\d+)$/)
  if (!m) return 60
  const step = m[1]
  const acc = m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0
  const octave = parseInt(m[3])
  return (octave + 1) * 12 + (STEP_SEMITONE[step] ?? 0) + acc
}

const VALID_DURATIONS = new Set(['w', 'h', 'q', '8', '16'])

interface RawNote {
  pitch: unknown
  duration: unknown
  finger?: unknown
}

interface RawExercise {
  title?: unknown
  bpm?: unknown
  timeSignature?: unknown
  notes?: unknown
}

export function parseJsonExercise(jsonString: string): Exercise | null {
  let raw: RawExercise
  try {
    raw = JSON.parse(jsonString) as RawExercise
  } catch {
    return null
  }

  if (!raw || typeof raw !== 'object') return null
  if (!Array.isArray(raw.notes) || raw.notes.length === 0) return null

  const title = typeof raw.title === 'string' && raw.title.trim()
    ? raw.title.trim()
    : 'Importado'

  const bpm = typeof raw.bpm === 'number'
    ? Math.min(Math.max(raw.bpm, 40), 200)
    : 80

  let timeSignature: [number, number] = [4, 4]
  if (Array.isArray(raw.timeSignature) && raw.timeSignature.length >= 2) {
    const [b, bt] = raw.timeSignature as number[]
    if (Number.isFinite(b) && Number.isFinite(bt)) timeSignature = [b, bt]
  }

  const notes: NoteData[] = []
  for (const n of raw.notes as RawNote[]) {
    if (!n || typeof n !== 'object') continue
    if (typeof n.pitch !== 'string') continue

    const pitch = n.pitch.trim()
    if (!/^[A-G](#|b?)(-?\d+)$/.test(pitch)) continue

    const duration = typeof n.duration === 'string' && VALID_DURATIONS.has(n.duration)
      ? n.duration
      : 'q'

    const finger = typeof n.finger === 'number' && n.finger >= 1 && n.finger <= 5
      ? n.finger
      : undefined

    notes.push({ pitch, duration, finger, midi: pitchToMidi(pitch) })
  }

  if (notes.length === 0) return null

  return {
    id: `json-${Date.now()}`,
    title,
    description: `JSON • ${notes.length} notas • ${timeSignature[0]}/${timeSignature[1]}`,
    bpm,
    timeSignature,
    notes,
  }
}
