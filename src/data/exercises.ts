export interface NoteData {
  pitch: string    // e.g. "C4", "D4"
  duration: string // "w"=semibreve, "h"=mínima, "q"=semínima, "8"=colcheia
  finger?: number  // 1–5
  midi: number     // MIDI note number
}

export interface Exercise {
  id: string
  title: string
  description: string
  bpm: number
  timeSignature: [number, number]
  notes: NoteData[]
}

const midiMap: Record<string, number> = {
  C3: 48, D3: 50, E3: 52, F3: 53, G3: 55, A3: 57, B3: 59,
  C4: 60, D4: 62, E4: 64, F4: 65, G4: 67, A4: 69, B4: 71,
  C5: 72, D5: 74, E5: 76, F5: 77, G5: 79, A5: 81, B5: 83,
}

export const exercises: Exercise[] = [
  {
    id: 'c-major-quarter',
    title: 'Dó Maior — Semínimas',
    description: 'Toque a escala de Dó Maior com semínimas. Cada nota vale 1 tempo.',
    bpm: 60,
    timeSignature: [4, 4],
    notes: [
      { pitch: 'C4', duration: 'q', finger: 1, midi: midiMap.C4 },
      { pitch: 'D4', duration: 'q', finger: 2, midi: midiMap.D4 },
      { pitch: 'E4', duration: 'q', finger: 3, midi: midiMap.E4 },
      { pitch: 'F4', duration: 'q', finger: 4, midi: midiMap.F4 },
      { pitch: 'G4', duration: 'q', finger: 5, midi: midiMap.G4 },
      { pitch: 'F4', duration: 'q', finger: 4, midi: midiMap.F4 },
      { pitch: 'E4', duration: 'q', finger: 3, midi: midiMap.E4 },
      { pitch: 'D4', duration: 'q', finger: 2, midi: midiMap.D4 },
      { pitch: 'C4', duration: 'q', finger: 1, midi: midiMap.C4 },
    ],
  },
  {
    id: 'c-major-half',
    title: 'Dó Maior — Mínimas',
    description: 'Toque a escala de Dó Maior com mínimas. Cada nota vale 2 tempos.',
    bpm: 60,
    timeSignature: [4, 4],
    notes: [
      { pitch: 'C4', duration: 'h', finger: 1, midi: midiMap.C4 },
      { pitch: 'D4', duration: 'h', finger: 2, midi: midiMap.D4 },
      { pitch: 'E4', duration: 'h', finger: 3, midi: midiMap.E4 },
      { pitch: 'F4', duration: 'h', finger: 4, midi: midiMap.F4 },
      { pitch: 'G4', duration: 'h', finger: 5, midi: midiMap.G4 },
      { pitch: 'A4', duration: 'h', finger: 4, midi: midiMap.A4 },
      { pitch: 'B4', duration: 'h', finger: 3, midi: midiMap.B4 },
      { pitch: 'C5', duration: 'h', finger: 1, midi: midiMap.C5 },
    ],
  },
  {
    id: 'mixed-durations',
    title: 'Misto — Semínimas e Mínimas',
    description: 'Exercício com mistura de semínimas e mínimas. Preste atenção nas durações.',
    bpm: 70,
    timeSignature: [4, 4],
    notes: [
      { pitch: 'C4', duration: 'q', finger: 1, midi: midiMap.C4 },
      { pitch: 'E4', duration: 'q', finger: 3, midi: midiMap.E4 },
      { pitch: 'G4', duration: 'h', finger: 5, midi: midiMap.G4 },
      { pitch: 'F4', duration: 'q', finger: 4, midi: midiMap.F4 },
      { pitch: 'E4', duration: 'q', finger: 3, midi: midiMap.E4 },
      { pitch: 'D4', duration: 'h', finger: 2, midi: midiMap.D4 },
      { pitch: 'C4', duration: 'q', finger: 1, midi: midiMap.C4 },
      { pitch: 'D4', duration: 'q', finger: 2, midi: midiMap.D4 },
      { pitch: 'E4', duration: 'h', finger: 3, midi: midiMap.E4 },
      { pitch: 'C4', duration: 'h', finger: 1, midi: midiMap.C4 },
    ],
  },
]
