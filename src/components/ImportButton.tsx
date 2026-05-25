import { useRef, useState } from 'react'
import { parseMusicXml } from '../utils/parseMusicXml'
import { parseJsonExercise } from '../utils/parseJsonExercise'
import type { Exercise } from '../data/exercises'

interface Props {
  onImport: (exercise: Exercise) => void
}

const FORMAT_PROMPT = `Converta a partitura abaixo para JSON, extraindo APENAS a melodia principal (clave de sol / mão direita, voz superior).

Regras:
- Notas em formato: "C4", "D#4", "Eb5", "F3" (nota + acidente opcional + oitava)
- Oitava do Dó central = 4 (C4 = MIDI 60)
- Durações: "w"=semibreve, "h"=mínima, "q"=semínima, "8"=colcheia, "16"=semicolcheia
- Ignore acordes (use só a nota mais alta), dinâmicas e articulações
- Dedilhado (finger) de 1 a 5, opcional

Formato exato:
{
  "title": "Nome da Música",
  "bpm": 80,
  "timeSignature": [4, 4],
  "notes": [
    { "pitch": "E5", "duration": "q", "finger": 3 },
    { "pitch": "D#5", "duration": "q" }
  ]
}

[Cole aqui a partitura ou anexe a imagem/PDF]`

export function ImportButton({ onImport }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [copied, setCopied] = useState(false)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!inputRef.current) return
    inputRef.current.value = ''
    if (!file) return

    const isJson = file.name.endsWith('.json')

    const reader = new FileReader()
    reader.onload = () => {
      const text = reader.result as string

      if (isJson) {
        const exercise = parseJsonExercise(text)
        if (!exercise) {
          setStatus('error')
          setMessage('JSON inválido. Verifique o formato.')
          return
        }
        onImport(exercise)
        setStatus('ok')
        setMessage(`"${exercise.title}" — ${exercise.notes.length} notas importadas`)
      } else {
        const result = parseMusicXml(text)
        if (!result) {
          setStatus('error')
          setMessage('MusicXML inválido ou sem notas reconhecidas.')
          return
        }
        onImport(result.exercise)
        setStatus('ok')
        setMessage(`"${result.exercise.title}" — ${result.totalNotes} notas importadas`)
      }
    }
    reader.onerror = () => {
      setStatus('error')
      setMessage('Erro ao ler o arquivo.')
    }
    reader.readAsText(file)
  }

  function copyPrompt() {
    navigator.clipboard.writeText(FORMAT_PROMPT).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap">
        <button
          onClick={() => inputRef.current?.click()}
          className="flex items-center gap-2 px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
        >
          ↑ Importar partitura
        </button>
        <span className="text-xs text-gray-500">.musicxml ou .json</span>
        <button
          onClick={() => setShowPrompt(p => !p)}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          {showPrompt ? 'Fechar' : 'Como converter com IA?'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept=".musicxml,.xml,.json"
          className="hidden"
          onChange={handleFile}
        />
        {status === 'ok' && <span className="text-xs text-green-400">{message}</span>}
        {status === 'error' && <span className="text-xs text-red-400">{message}</span>}
      </div>

      {showPrompt && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 space-y-2">
          <p className="text-xs text-gray-300 font-medium">
            Tire uma foto da partitura (ou cole o PDF) e envie para qualquer IA com este prompt:
          </p>
          <pre className="text-xs text-gray-400 whitespace-pre-wrap leading-relaxed bg-gray-900 rounded p-2 overflow-auto max-h-48">
            {FORMAT_PROMPT}
          </pre>
          <button
            onClick={copyPrompt}
            className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-xs rounded transition-colors"
          >
            {copied ? '✓ Copiado!' : 'Copiar prompt'}
          </button>
          <p className="text-xs text-gray-500">
            Salve a resposta como <code className="text-gray-400">musica.json</code> e importe acima.
          </p>
        </div>
      )}
    </div>
  )
}
