import { useState } from 'react'
import * as Tone from 'tone'

interface Figure {
  name: string
  englishName: string
  symbol: string
  beats: number
  color: string
  pauseSymbol: string
}

const FIGURES: Figure[] = [
  { name: 'Semibreve', englishName: 'Whole', symbol: '𝅝', beats: 4, color: 'bg-purple-600', pauseSymbol: '▬' },
  { name: 'Mínima', englishName: 'Half', symbol: '𝅗𝅥', beats: 2, color: 'bg-blue-600', pauseSymbol: '▬' },
  { name: 'Semínima', englishName: 'Quarter', symbol: '♩', beats: 1, color: 'bg-green-600', pauseSymbol: '𝄽' },
  { name: 'Colcheia', englishName: 'Eighth', symbol: '♪', beats: 0.5, color: 'bg-yellow-600', pauseSymbol: '𝄾' },
  { name: 'Semicolcheia', englishName: '16th', symbol: '𝅘𝅥𝅯', beats: 0.25, color: 'bg-orange-600', pauseSymbol: '𝄿' },
]

const MAX_BEATS = 4

export function NoteGuide() {
  const [playing, setPlaying] = useState<string | null>(null)
  const [showPauses, setShowPauses] = useState(false)

  async function playFigure(fig: Figure) {
    if (playing) return
    await Tone.start()
    setPlaying(fig.name)

    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.02, decay: 0.1, sustain: 0.8, release: 0.3 },
    }).toDestination()

    const durationMap: Record<number, string> = { 4: '1n', 2: '2n', 1: '4n', 0.5: '8n', 0.25: '16n' }
    const dur = durationMap[fig.beats] ?? '4n'

    synth.triggerAttackRelease('C4', dur, Tone.now())

    const ms = (fig.beats / 2) * 1000 + 400
    setTimeout(() => {
      synth.dispose()
      setPlaying(null)
    }, ms)
  }

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-100">Figuras Musicais</h2>
        <button
          onClick={() => setShowPauses(!showPauses)}
          className="text-sm text-gray-400 hover:text-gray-200 transition-colors"
        >
          {showPauses ? 'Ver notas' : 'Ver pausas'}
        </button>
      </div>

      <div className="space-y-2">
        {FIGURES.map(fig => (
          <button
            key={fig.name}
            onClick={() => playFigure(fig)}
            disabled={playing === fig.name}
            className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
              playing === fig.name
                ? 'border-white/40 bg-white/10'
                : 'border-gray-700 hover:border-gray-500 bg-gray-800'
            }`}
          >
            <span className={`text-2xl w-8 text-center ${playing === fig.name ? 'animate-pulse' : ''}`}>
              {showPauses ? fig.pauseSymbol : fig.symbol}
            </span>

            <div className="flex-1 text-left">
              <p className="text-sm font-medium text-gray-100">{fig.name}</p>
              <p className="text-xs text-gray-500">{fig.beats === 0.5 ? '½' : fig.beats === 0.25 ? '¼' : fig.beats} {fig.beats === 1 ? 'tempo' : 'tempos'}</p>
            </div>

            <div className="flex gap-0.5 items-center h-5">
              <div className="h-full flex items-center" style={{ width: `${(fig.beats / MAX_BEATS) * 80 + 8}px` }}>
                <div className={`h-3 rounded-sm w-full ${fig.color} opacity-80`} />
              </div>
            </div>
          </button>
        ))}
      </div>

      <p className="text-xs text-gray-600 text-center">Clique para ouvir a duração</p>
    </div>
  )
}
