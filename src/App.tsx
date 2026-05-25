import { useState, useCallback, useEffect } from 'react'
import { PianoKeyboard } from './components/PianoKeyboard'
import { NoteGuide } from './components/NoteGuide'
import { Metronome } from './components/Metronome'
import { SheetMusic } from './components/SheetMusic'
import { MidiStatus } from './components/MidiStatus'
import { ImportButton } from './components/ImportButton'
import { useMidi } from './hooks/useMidi'
import { exercises as builtinExercises } from './data/exercises'
import type { Exercise } from './data/exercises'
import type { MidiNote } from './hooks/useMidi'

type Tab = 'praticar' | 'figuras' | 'metronomo'

const PAGE_SIZE = 8

export default function App() {
  const [tab, setTab] = useState<Tab>('praticar')
  const [allExercises, setAllExercises] = useState<Exercise[]>(builtinExercises)
  const [selectedId, setSelectedId] = useState(builtinExercises[0].id)
  const [activeNoteIndex, setActiveNoteIndex] = useState<number | null>(0)
  const [correctNotes, setCorrectNotes] = useState<Set<number>>(new Set())
  const [wrongNotes, setWrongNotes] = useState<Set<number>>(new Set())
  const [score, setScore] = useState({ hits: 0, misses: 0 })
  const [mode, setMode] = useState<'free' | 'practice'>('free')
  const [page, setPage] = useState(0)

  const selectedExercise = allExercises.find(e => e.id === selectedId) ?? allExercises[0]
  const currentNote = activeNoteIndex !== null ? selectedExercise.notes[activeNoteIndex] : null

  // Auto-advance page when active note moves to next page
  useEffect(() => {
    if (activeNoteIndex === null) return
    const targetPage = Math.floor(activeNoteIndex / PAGE_SIZE)
    setPage(targetPage)
  }, [activeNoteIndex])

  const handleMidiNote = useCallback((midiNote: MidiNote) => {
    if (midiNote.type !== 'noteon') return
    if (mode !== 'practice' || !currentNote) return

    if (midiNote.note === currentNote.midi) {
      setCorrectNotes(prev => new Set(prev).add(midiNote.note))
      setScore(s => ({ ...s, hits: s.hits + 1 }))
      setTimeout(() => {
        setCorrectNotes(prev => { const n = new Set(prev); n.delete(midiNote.note); return n })
        const nextIdx = (activeNoteIndex ?? 0) + 1
        setActiveNoteIndex(nextIdx < selectedExercise.notes.length ? nextIdx : null)
      }, 400)
    } else {
      setWrongNotes(prev => new Set(prev).add(midiNote.note))
      setScore(s => ({ ...s, misses: s.misses + 1 }))
      setTimeout(() => {
        setWrongNotes(prev => { const n = new Set(prev); n.delete(midiNote.note); return n })
      }, 600)
    }
  }, [mode, currentNote, activeNoteIndex, selectedExercise.notes.length])

  const { isSupported, isConnected, deviceName, activeNotes, requestAccess } = useMidi(handleMidiNote)

  function resetExercise() {
    setActiveNoteIndex(0)
    setCorrectNotes(new Set())
    setWrongNotes(new Set())
    setScore({ hits: 0, misses: 0 })
    setPage(0)
  }

  function selectExercise(id: string) {
    setSelectedId(id)
    resetExercise()
  }

  function handleImport(exercise: Exercise) {
    setAllExercises(prev => {
      const filtered = prev.filter(e => e.id !== exercise.id)
      return [...filtered, exercise]
    })
    selectExercise(exercise.id)
    setTab('praticar')
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target !== document.body) return
      if (e.code === 'KeyR') {
        e.preventDefault()
        setCorrectNotes(new Set())
        setWrongNotes(new Set())
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  const highlightNote = mode === 'practice' ? currentNote?.midi ?? null : null
  const finished = mode === 'practice' && activeNoteIndex === null
  const builtinIds = new Set(builtinExercises.map(e => e.id))
  const importedExercises = allExercises.filter(e => !builtinIds.has(e.id))

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex flex-col">
      <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-xl font-bold text-white">🎹 Piano Tutor</h1>
        <MidiStatus isSupported={isSupported} isConnected={isConnected} deviceName={deviceName} onRetry={requestAccess} />
        <nav className="flex gap-1">
          {(['praticar', 'figuras', 'metronomo'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                tab === t ? 'bg-blue-700 text-white' : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              {t === 'praticar' ? 'Praticar' : t === 'figuras' ? 'Figuras' : 'Metrônomo'}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-4 max-w-5xl mx-auto w-full space-y-4">

        {tab === 'praticar' && (
          <>
            {/* Exercise selector */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 uppercase tracking-wide">Exercícios</span>
                {builtinExercises.map(ex => (
                  <button
                    key={ex.id}
                    onClick={() => selectExercise(ex.id)}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      selectedId === ex.id ? 'bg-blue-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                    }`}
                  >
                    {ex.title}
                  </button>
                ))}
              </div>

              {importedExercises.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Importados</span>
                  {importedExercises.map(ex => (
                    <button
                      key={ex.id}
                      onClick={() => selectExercise(ex.id)}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        selectedId === ex.id ? 'bg-indigo-700 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      {ex.title}
                    </button>
                  ))}
                </div>
              )}

              <ImportButton onImport={handleImport} />
            </div>

            {/* Exercise panel */}
            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h2 className="font-semibold text-gray-100">{selectedExercise.title}</h2>
                  <p className="text-sm text-gray-400">{selectedExercise.description}</p>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => { setMode(m => m === 'free' ? 'practice' : 'free'); resetExercise() }}
                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                      mode === 'practice' ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    {mode === 'practice' ? 'Modo Prática ✓' : 'Modo Livre'}
                  </button>
                  <button
                    onClick={resetExercise}
                    className="px-3 py-1.5 rounded-lg text-sm bg-gray-800 text-gray-400 hover:bg-gray-700"
                  >
                    Reiniciar
                  </button>
                </div>
              </div>

              {mode === 'practice' && (
                <div className="flex gap-4 text-sm flex-wrap">
                  <span className="text-green-400">✓ Acertos: {score.hits}</span>
                  <span className="text-red-400">✗ Erros: {score.misses}</span>
                  {currentNote && (
                    <span className="text-amber-400">
                      → Toque: <strong>{currentNote.pitch}</strong>
                      {currentNote.finger ? ` (dedo ${currentNote.finger})` : ''}
                      <span className="text-gray-500 ml-1">
                        [{(activeNoteIndex ?? 0) + 1}/{selectedExercise.notes.length}]
                      </span>
                    </span>
                  )}
                  {finished && <span className="text-purple-400 font-semibold">🎉 Exercício concluído!</span>}
                </div>
              )}

              <SheetMusic
                exercise={selectedExercise}
                activeNoteIndex={activeNoteIndex}
                page={page}
                pageSize={PAGE_SIZE}
                onPageChange={setPage}
              />
            </div>

            <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
              <PianoKeyboard
                activeNotes={activeNotes}
                correctNotes={correctNotes}
                wrongNotes={wrongNotes}
                highlightNote={highlightNote}
              />
            </div>
          </>
        )}

        {tab === 'figuras' && <NoteGuide />}

        {tab === 'metronomo' && (
          <div className="max-w-xs mx-auto">
            <Metronome />
          </div>
        )}
      </main>
    </div>
  )
}
