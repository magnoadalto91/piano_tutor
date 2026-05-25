import type { Exercise, NoteData } from '../data/exercises'

const STEP_SEMITONE: Record<string, number> = {
  C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11,
}

const TYPE_DURATION: Record<string, string> = {
  whole: 'w',
  half: 'h',
  quarter: 'q',
  eighth: '8',
  '16th': '16',
}

function toMidi(step: string, octave: number, alter: number): number {
  return (octave + 1) * 12 + (STEP_SEMITONE[step] ?? 0) + Math.round(alter)
}

function toPitch(step: string, octave: number, alter: number): string {
  const acc = alter >= 1 ? '#' : alter <= -1 ? 'b' : ''
  return `${step}${acc}${octave}`
}

export interface ParseResult {
  exercise: Exercise
  totalNotes: number
  skipped: number
}

export function parseMusicXml(xmlString: string): ParseResult | null {
  const doc = new DOMParser().parseFromString(xmlString, 'application/xml')
  if (doc.querySelector('parseerror,parsererror')) return null

  const title =
    doc.querySelector('work-title')?.textContent?.trim() ||
    doc.querySelector('movement-title')?.textContent?.trim() ||
    'Partitura Importada'

  const beats = parseInt(doc.querySelector('time > beats')?.textContent ?? '4')
  const beatType = parseInt(doc.querySelector('time > beat-type')?.textContent ?? '4')

  const perMinute = doc.querySelector('per-minute')?.textContent
  const bpm = perMinute ? Math.min(Math.max(parseInt(perMinute), 40), 200) : 80

  // Use first part only (melody)
  const part = doc.querySelector('part') ?? doc
  const noteElements = part.querySelectorAll('note')

  const notes: NoteData[] = []
  let skipped = 0

  for (const el of noteElements) {
    // Skip rests
    if (el.querySelector('rest')) { skipped++; continue }

    // Skip grace notes
    if (el.querySelector('grace')) { skipped++; continue }

    // Skip chord continuation (keep first note of each chord)
    if (el.querySelector('chord')) { skipped++; continue }

    // Skip tied-to notes (they are held from previous — don't press again)
    const ties = el.querySelectorAll('tie')
    if (Array.from(ties).some(t => t.getAttribute('type') === 'stop')) {
      skipped++; continue
    }

    const pitchEl = el.querySelector('pitch')
    if (!pitchEl) { skipped++; continue }

    const step = pitchEl.querySelector('step')?.textContent?.trim() ?? 'C'
    const octave = parseInt(pitchEl.querySelector('octave')?.textContent ?? '4')
    const alter = parseFloat(pitchEl.querySelector('alter')?.textContent ?? '0')

    const typeText = el.querySelector('type')?.textContent?.trim() ?? 'quarter'
    const duration = TYPE_DURATION[typeText] ?? 'q'

    const fingerText = el.querySelector('fingering')?.textContent?.trim()
    const finger = fingerText ? parseInt(fingerText) : undefined

    notes.push({
      pitch: toPitch(step, octave, alter),
      duration,
      finger: isNaN(finger!) ? undefined : finger,
      midi: toMidi(step, octave, alter),
    })
  }

  if (notes.length === 0) return null

  return {
    exercise: {
      id: `xml-${Date.now()}`,
      title,
      description: `MusicXML • ${notes.length} notas • ${beats}/${beatType}`,
      bpm,
      timeSignature: [beats, beatType],
      notes,
    },
    totalNotes: notes.length,
    skipped,
  }
}
