import { useEffect, useState, useCallback } from 'react'

export interface MidiNote {
  note: number
  velocity: number
  type: 'noteon' | 'noteoff'
}

interface UseMidiReturn {
  isSupported: boolean
  isConnected: boolean
  deviceName: string | null
  lastNote: MidiNote | null
  activeNotes: Set<number>
  requestAccess: () => void
}

export function useMidi(onNote?: (note: MidiNote) => void): UseMidiReturn {
  const [isSupported] = useState(() => 'requestMIDIAccess' in navigator)
  const [isConnected, setIsConnected] = useState(false)
  const [deviceName, setDeviceName] = useState<string | null>(null)
  const [lastNote, setLastNote] = useState<MidiNote | null>(null)
  const [activeNotes, setActiveNotes] = useState<Set<number>>(new Set())

  const handleMidiMessage = useCallback((event: MIDIMessageEvent) => {
    const [status, note, velocity] = event.data!
    const command = status & 0xf0

    if (command === 0x90 && velocity > 0) {
      const midiNote: MidiNote = { note, velocity, type: 'noteon' }
      setLastNote(midiNote)
      setActiveNotes(prev => new Set(prev).add(note))
      onNote?.(midiNote)
    } else if (command === 0x80 || (command === 0x90 && velocity === 0)) {
      const midiNote: MidiNote = { note, velocity: 0, type: 'noteoff' }
      setLastNote(midiNote)
      setActiveNotes(prev => {
        const next = new Set(prev)
        next.delete(note)
        return next
      })
      onNote?.(midiNote)
    }
  }, [onNote])

  const connectInputs = useCallback((access: MIDIAccess) => {
    let connected = false
    for (const input of access.inputs.values()) {
      input.onmidimessage = handleMidiMessage
      if (!connected) {
        setDeviceName(input.name)
        connected = true
      }
    }
    setIsConnected(connected)

    access.onstatechange = (e: MIDIConnectionEvent) => {
      const port = e.port
      if (port.type === 'input') {
        if (port.state === 'connected') {
          (port as MIDIInput).onmidimessage = handleMidiMessage
          setDeviceName(port.name)
          setIsConnected(true)
        } else {
          setIsConnected(false)
          setDeviceName(null)
        }
      }
    }
  }, [handleMidiMessage])

  const requestAccess = useCallback(() => {
    if (!isSupported) return
    navigator.requestMIDIAccess({ sysex: false })
      .then(connectInputs)
      .catch(() => setIsConnected(false))
  }, [isSupported, connectInputs])

  useEffect(() => {
    requestAccess()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return { isSupported, isConnected, deviceName, lastNote, activeNotes, requestAccess }
}
