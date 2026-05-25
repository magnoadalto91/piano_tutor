interface Props {
  activeNotes?: Set<number>
  correctNotes?: Set<number>
  wrongNotes?: Set<number>
  highlightNote?: number | null
  onNoteClick?: (midi: number) => void
}

interface KeyDef {
  midi: number
  label: string
  isBlack: boolean
  octave: number
  position: number
}

function buildKeys(startOctave: number, endOctave: number): KeyDef[] {
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const keys: KeyDef[] = []
  let whitePos = 0

  for (let oct = startOctave; oct <= endOctave; oct++) {
    for (let i = 0; i < 12; i++) {
      const name = noteNames[i]
      const isBlack = name.includes('#')
      const midi = (oct + 1) * 12 + i
      keys.push({ midi, label: `${name}${oct}`, isBlack, octave: oct, position: whitePos })
      if (!isBlack) whitePos++
    }
  }
  return keys
}

const KEYS = buildKeys(3, 6)
const WHITE_KEYS = KEYS.filter(k => !k.isBlack)
const BLACK_KEYS = KEYS.filter(k => k.isBlack)

const WHITE_W = 36
const WHITE_H = 160
const BLACK_W = 22
const BLACK_H = 100

const BLACK_OFFSETS: Record<string, number> = {
  'C#': 0.6, 'D#': 1.6, 'F#': 3.6, 'G#': 4.6, 'A#': 5.6,
}

function getBlackX(key: KeyDef): number {
  const noteName = key.label.replace(/\d/, '')
  const octaveStart = WHITE_KEYS.findIndex(k => k.label === `C${key.octave}`)
  const offset = BLACK_OFFSETS[noteName] ?? 0
  return (octaveStart + offset) * WHITE_W + (WHITE_W - BLACK_W) / 2
}

export function PianoKeyboard({ activeNotes = new Set(), correctNotes = new Set(), wrongNotes = new Set(), highlightNote, onNoteClick }: Props) {
  const totalWidth = WHITE_KEYS.length * WHITE_W

  function whiteKeyColor(midi: number) {
    if (highlightNote === midi) return '#fbbf24'
    if (correctNotes.has(midi)) return '#22c55e'
    if (wrongNotes.has(midi)) return '#ef4444'
    if (activeNotes.has(midi)) return '#60a5fa'
    return '#f1f5f9'
  }

  function blackKeyColor(midi: number) {
    if (highlightNote === midi) return '#d97706'
    if (correctNotes.has(midi)) return '#16a34a'
    if (wrongNotes.has(midi)) return '#dc2626'
    if (activeNotes.has(midi)) return '#2563eb'
    return '#1e293b'
  }

  return (
    <div className="overflow-x-auto pb-2">
      <svg
        width={totalWidth}
        height={WHITE_H + 24}
        className="select-none"
        style={{ minWidth: totalWidth }}
      >
        {WHITE_KEYS.map((key, i) => (
          <g key={key.midi} onClick={() => onNoteClick?.(key.midi)} style={{ cursor: 'pointer' }}>
            <rect
              x={i * WHITE_W}
              y={0}
              width={WHITE_W - 1}
              height={WHITE_H}
              rx={3}
              fill={whiteKeyColor(key.midi)}
              stroke="#94a3b8"
              strokeWidth={1}
            />
            <text
              x={i * WHITE_W + WHITE_W / 2}
              y={WHITE_H + 14}
              textAnchor="middle"
              fontSize={9}
              fill="#94a3b8"
            >
              {key.label.replace('#', '♯')}
            </text>
          </g>
        ))}

        {BLACK_KEYS.map((key) => (
          <rect
            key={key.midi}
            x={getBlackX(key)}
            y={0}
            width={BLACK_W}
            height={BLACK_H}
            rx={2}
            fill={blackKeyColor(key.midi)}
            stroke="#0f172a"
            strokeWidth={1}
            style={{ cursor: 'pointer' }}
            onClick={() => onNoteClick?.(key.midi)}
          />
        ))}
      </svg>
    </div>
  )
}
