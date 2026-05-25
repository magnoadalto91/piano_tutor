import { useRef, useState } from 'react'
import { parseMusicXml } from '../utils/parseMusicXml'
import type { Exercise } from '../data/exercises'

interface Props {
  onImport: (exercise: Exercise) => void
}

export function ImportButton({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!inputRef.current) return
    inputRef.current.value = ''

    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = parseMusicXml(reader.result as string)
      if (!result) {
        setStatus('error')
        setMessage('Arquivo inválido ou sem notas reconhecidas.')
        return
      }
      onImport(result.exercise)
      setStatus('ok')
      setMessage(`"${result.exercise.title}" — ${result.totalNotes} notas importadas`)
    }
    reader.onerror = () => {
      setStatus('error')
      setMessage('Erro ao ler o arquivo.')
    }
    reader.readAsText(file)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <button
        onClick={() => inputRef.current?.click()}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
      >
        ↑ Importar MusicXML
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".musicxml,.xml,.mxl"
        className="hidden"
        onChange={handleFile}
      />
      {status === 'ok' && (
        <span className="text-xs text-green-400">{message}</span>
      )}
      {status === 'error' && (
        <span className="text-xs text-red-400">{message}</span>
      )}
    </div>
  )
}
