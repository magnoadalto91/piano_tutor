import { useEffect, useRef } from 'react'
import type { Exercise } from '../data/exercises'

interface Props {
  exercise: Exercise
  activeNoteIndex: number | null
}

const DURATION_MAP: Record<string, string> = {
  w: '1', h: '2', q: '4', '8': '8',
}

export function SheetMusic({ exercise, activeNoteIndex }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    containerRef.current.innerHTML = ''

    import('vexflow').then(({ Renderer, Stave, StaveNote, Voice, Formatter, Accidental }) => {
      const div = containerRef.current!
      const renderer = new Renderer(div, Renderer.Backends.SVG)

      const width = Math.min(div.clientWidth || 700, 900)
      renderer.resize(width, 180)
      const context = renderer.getContext()
      context.setFont('Arial', 10)

      const stave = new Stave(10, 30, width - 20)
      stave.addClef('treble').addTimeSignature(`${exercise.timeSignature[0]}/${exercise.timeSignature[1]}`)
      stave.setContext(context).draw()

      const vexNotes = exercise.notes.map((n, idx) => {
        const [noteName, oct] = [n.pitch.replace('#', ''), n.pitch.includes('#') ? n.pitch.slice(-1) : n.pitch.slice(-1)]
        const keys = [`${noteName.toLowerCase()}/${oct}`]
        const dur = DURATION_MAP[n.duration] ?? '4'

        const note = new StaveNote({ keys, duration: dur })

        if (n.pitch.includes('#')) {
          note.addModifier(new Accidental('#'), 0)
        }

        if (idx === activeNoteIndex) {
          note.setStyle({ fillStyle: '#fbbf24', strokeStyle: '#fbbf24' })
        }

        return note
      })

      const voice = new Voice({ num_beats: exercise.timeSignature[0] * Math.ceil(exercise.notes.length / exercise.timeSignature[0]), beat_value: exercise.timeSignature[1] })
      voice.setStrict(false)
      voice.addTickables(vexNotes)

      new Formatter().joinVoices([voice]).format([voice], width - 80)
      voice.draw(context, stave)

      const svgEl = div.querySelector('svg')
      if (svgEl) {
        svgEl.style.width = '100%'
        svgEl.style.height = 'auto'
      }
    })
  }, [exercise, activeNoteIndex])

  return (
    <div className="bg-white rounded-xl p-2 overflow-x-auto">
      <div ref={containerRef} className="w-full" />
    </div>
  )
}
