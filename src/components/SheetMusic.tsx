import { useEffect, useRef } from 'react'
import type { Exercise, NoteData } from '../data/exercises'

interface Props {
  exercise: Exercise
  activeNoteIndex: number | null
  page: number
  pageSize?: number
  onPageChange: (page: number) => void
}

function parsePitch(pitch: string): { step: string; acc: string; octave: string } {
  const m = pitch.match(/^([A-G])(#|b?)(\d+)$/)
  if (!m) return { step: 'c', acc: '', octave: '4' }
  return { step: m[1].toLowerCase(), acc: m[2], octave: m[3] }
}

function renderStave(
  container: HTMLDivElement,
  notes: NoteData[],
  activeIdx: number | null,
  timeSignature: [number, number],
  showTimeSig: boolean,
) {
  import('vexflow').then(({ Renderer, Stave, StaveNote, Voice, Formatter, Accidental }) => {
    container.innerHTML = ''

    const renderer = new Renderer(container, Renderer.Backends.SVG)
    const width = Math.min(container.clientWidth || 700, 880)
    renderer.resize(width, 160)
    const ctx = renderer.getContext()
    ctx.setFont('Arial', 10)

    const staveX = 10
    const staveWidth = width - 20
    const stave = new Stave(staveX, 20, staveWidth)
    stave.addClef('treble')
    if (showTimeSig) stave.addTimeSignature(`${timeSignature[0]}/${timeSignature[1]}`)
    stave.setContext(ctx).draw()

    const vexNotes = notes.map((n, i) => {
      const { step, acc, octave } = parsePitch(n.pitch)
      const key = `${step}${acc}/${octave}`
      const dur = n.duration === 'w' ? '1' : n.duration === 'h' ? '2' : n.duration === 'q' ? '4' : n.duration === '8' ? '8' : '16'

      const vn = new StaveNote({ keys: [key], duration: dur })

      if (acc === '#') vn.addModifier(new Accidental('#'), 0)
      if (acc === 'b') vn.addModifier(new Accidental('b'), 0)

      if (i === activeIdx) {
        vn.setStyle({ fillStyle: '#fbbf24', strokeStyle: '#fbbf24' })
      }

      return vn
    })

    if (vexNotes.length === 0) return

    const voice = new Voice({
      num_beats: timeSignature[0] * Math.ceil(notes.length / timeSignature[0]),
      beat_value: timeSignature[1],
    })
    voice.setStrict(false)
    voice.addTickables(vexNotes)

    new Formatter().joinVoices([voice]).format([voice], staveWidth - 60)
    voice.draw(ctx, stave)

    const svg = container.querySelector('svg')
    if (svg) { svg.style.width = '100%'; svg.style.height = 'auto' }
  })
}

export function SheetMusic({ exercise, activeNoteIndex, page, pageSize = 8, onPageChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  const totalPages = Math.ceil(exercise.notes.length / pageSize)
  const safeP = Math.min(Math.max(page, 0), totalPages - 1)
  const start = safeP * pageSize
  const pageNotes = exercise.notes.slice(start, start + pageSize)
  const pageActiveIdx = activeNoteIndex !== null ? activeNoteIndex - start : null
  const localActive = pageActiveIdx !== null && pageActiveIdx >= 0 && pageActiveIdx < pageSize ? pageActiveIdx : null

  useEffect(() => {
    if (!containerRef.current) return
    renderStave(containerRef.current, pageNotes, localActive, exercise.timeSignature, safeP === 0)
  }, [exercise, activeNoteIndex, page, pageSize]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-2">
      <div className="bg-white rounded-xl p-2 overflow-x-auto">
        <div ref={containerRef} className="w-full" />
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={() => onPageChange(safeP - 1)}
            disabled={safeP === 0}
            className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
          >
            ← Anterior
          </button>
          <span className="text-xs text-gray-500">
            pág. {safeP + 1} / {totalPages}
          </span>
          <button
            onClick={() => onPageChange(safeP + 1)}
            disabled={safeP >= totalPages - 1}
            className="px-2 py-1 rounded text-xs bg-gray-800 text-gray-400 disabled:opacity-30 hover:bg-gray-700"
          >
            Próxima →
          </button>
        </div>
      )}
    </div>
  )
}
