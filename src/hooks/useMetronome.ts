import { useEffect, useRef, useState, useCallback } from 'react'
import * as Tone from 'tone'

interface UseMetronomeReturn {
  bpm: number
  isPlaying: boolean
  beat: number
  timeSignature: number
  setBpm: (bpm: number) => void
  setTimeSignature: (ts: number) => void
  toggle: () => void
  soundEnabled: boolean
  setSoundEnabled: (v: boolean) => void
}

export function useMetronome(): UseMetronomeReturn {
  const [bpm, setBpmState] = useState(80)
  const [isPlaying, setIsPlaying] = useState(false)
  const [beat, setBeat] = useState(0)
  const [timeSignature, setTimeSignatureState] = useState(4)
  const [soundEnabled, setSoundEnabled] = useState(true)

  const synthRef = useRef<Tone.Synth | null>(null)
  const loopRef = useRef<Tone.Loop | null>(null)
  const beatRef = useRef(0)

  useEffect(() => {
    synthRef.current = new Tone.Synth({
      oscillator: { type: 'triangle' },
      envelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 },
    }).toDestination()
    return () => {
      synthRef.current?.dispose()
      loopRef.current?.dispose()
      Tone.getTransport().stop()
    }
  }, [])

  const setBpm = useCallback((value: number) => {
    setBpmState(value)
    Tone.getTransport().bpm.value = value
  }, [])

  const setTimeSignature = useCallback((ts: number) => {
    setTimeSignatureState(ts)
    beatRef.current = 0
  }, [])

  const toggle = useCallback(async () => {
    await Tone.start()
    const transport = Tone.getTransport()

    if (isPlaying) {
      transport.stop()
      loopRef.current?.stop()
      setIsPlaying(false)
      setBeat(0)
      beatRef.current = 0
    } else {
      transport.bpm.value = bpm
      loopRef.current?.dispose()

      loopRef.current = new Tone.Loop((time) => {
        const currentBeat = beatRef.current
        setBeat(currentBeat)

        if (soundEnabled && synthRef.current) {
          const freq = currentBeat === 0 ? 'G5' : 'C5'
          synthRef.current.triggerAttackRelease(freq, '32n', time)
        }

        beatRef.current = (currentBeat + 1) % timeSignature
      }, '4n')

      loopRef.current.start(0)
      transport.start()
      setIsPlaying(true)
    }
  }, [isPlaying, bpm, soundEnabled, timeSignature])

  return { bpm, isPlaying, beat, timeSignature, setBpm, setTimeSignature, toggle, soundEnabled, setSoundEnabled }
}
