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
  const xmlInputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<'idle' | 'ok' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [showPrompt, setShowPrompt] = useState(false)
  const [showJsonPanel, setShowJsonPanel] = useState(false)
  const [jsonText, setJsonText] = useState('')
  const [copied, setCopied] = useState(false)

  function importJson(text: string) {
    const exercise = parseJsonExercise(text)
    if (!exercise) {
      setStatus('error')
      setMessage('JSON inválido. Verifique o formato.')
      return
    }
    onImport(exercise)
    setStatus('ok')
    setMessage(`"${exercise.title}" — ${exercise.notes.length} notas importadas`)
    setShowJsonPanel(false)
    setJsonText('')
  }

  function handleXmlFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!xmlInputRef.current) return
    xmlInputRef.current.value = ''
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      const result = parseMusicXml(reader.result as string)
      if (!result) {
        setStatus('error')
        setMessage('MusicXML inválido ou sem notas reconhecidas.')
        return
      }
      onImport(result.exercise)
      setStatus('ok')
      setMessage(`"${result.exercise.title}" — ${result.totalNotes} notas importadas`)
    }
    reader.onerror = () => { setStatus('error'); setMessage('Erro ao ler o arquivo.') }
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
          onClick={() => { setShowJsonPanel(p => !p); setStatus('idle') }}
          className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 text-white rounded-lg text-sm transition-colors"
        >
          ↑ Colar JSON
        </button>
        <button
          onClick={() => xmlInputRef.current?.click()}
          className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-sm transition-colors"
        >
          ↑ MusicXML
        </button>
        <button
          onClick={() => setShowPrompt(p => !p)}
          className="text-xs text-indigo-400 hover:text-indigo-300 underline"
        >
          {showPrompt ? 'Fechar' : 'Como converter com IA?'}
        </button>
        <input ref={xmlInputRef} type="file" accept=".musicxml,.xml" className="hidden" onChange={handleXmlFile} />
        {status === 'ok' && <span className="text-xs text-green-400">{message}</span>}
        {status === 'error' && <span className="text-xs text-red-400">{message}</span>}
      </div>

      {showJsonPanel && (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 space-y-2">
          <p className="text-xs text-gray-400">Cole o JSON gerado pela IA:</p>
          <textarea
            autoFocus
            value={jsonText}
            onChange={e => setJsonText(e.target.value)}
            placeholder={'{\n  "title": "Minha Música",\n  "bpm": 80,\n  "timeSignature": [4, 4],\n  "notes": [\n    { "pitch": "C4", "duration": "q" }\n  ]\n}'}
            className="w-full h-48 bg-gray-900 text-gray-200 text-xs font-mono rounded p-2 border border-gray-700 focus:border-indigo-500 focus:outline-none resize-y"
            spellCheck={false}
          />
          <div className="flex gap-2">
            <button
              onClick={() => importJson(jsonText)}
              disabled={!jsonText.trim()}
              className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-600 disabled:opacity-40 text-white rounded-lg text-sm transition-colors"
            >
              Importar
            </button>
            <button
              onClick={() => { setShowJsonPanel(false); setJsonText(''); setStatus('idle') }}
              className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

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
        </div>
      )}
    </div>
  )
}
