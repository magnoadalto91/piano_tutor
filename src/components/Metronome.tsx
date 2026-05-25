import { useEffect } from 'react'
import { useMetronome } from '../hooks/useMetronome'

interface Props {
  onToggle?: (playing: boolean) => void
}

export function Metronome({ onToggle }: Props) {
  const {
    bpm, isPlaying, beat, timeSignature,
    setBpm, setTimeSignature, toggle, soundEnabled, setSoundEnabled
  } = useMetronome()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.code === 'Space' && e.target === document.body) {
        e.preventDefault()
        toggle()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [toggle])

  useEffect(() => { onToggle?.(isPlaying) }, [isPlaying, onToggle])

  const beats = Array.from({ length: timeSignature }, (_, i) => i)

  return (
    <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-100">Metrônomo</h2>

      <div className="flex gap-2 justify-center">
        {beats.map(i => (
          <div
            key={i}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-75 ${
              isPlaying && beat === i
                ? i === 0
                  ? 'bg-amber-400 border-amber-300 scale-110'
                  : 'bg-blue-400 border-blue-300 scale-105'
                : 'bg-gray-800 border-gray-600'
            }`}
          />
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-400">BPM</label>
          <span className="text-sm font-mono text-gray-100 w-8 text-right">{bpm}</span>
        </div>
        <input
          type="range" min={40} max={200} value={bpm}
          onChange={e => setBpm(Number(e.target.value))}
          className="w-full accent-blue-500"
        />
      </div>

      <div className="flex gap-2">
        {[2, 3, 4].map(ts => (
          <button
            key={ts}
            onClick={() => setTimeSignature(ts)}
            className={`flex-1 py-1 rounded text-sm transition-colors ${
              timeSignature === ts
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {ts}/4
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <button
          onClick={toggle}
          className={`flex-1 py-2 rounded-lg font-semibold transition-colors ${
            isPlaying
              ? 'bg-red-700 hover:bg-red-600 text-white'
              : 'bg-blue-700 hover:bg-blue-600 text-white'
          }`}
        >
          {isPlaying ? 'Parar' : 'Iniciar'} <span className="text-xs opacity-60">[Espaço]</span>
        </button>
        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          title={soundEnabled ? 'Desligar som' : 'Ligar som'}
          className={`px-3 py-2 rounded-lg transition-colors ${
            soundEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-800 hover:bg-gray-700 text-gray-500'
          }`}
        >
          {soundEnabled ? '🔊' : '🔇'}
        </button>
      </div>
    </div>
  )
}
