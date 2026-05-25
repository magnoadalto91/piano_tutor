interface MIDIOptions {
  sysex?: boolean
  software?: boolean
}

interface MIDIAccess extends EventTarget {
  inputs: MIDIInputMap
  outputs: MIDIOutputMap
  sysexEnabled: boolean
  onstatechange: ((e: MIDIConnectionEvent) => void) | null
}

interface MIDIInputMap {
  values(): IterableIterator<MIDIInput>
  entries(): IterableIterator<[string, MIDIInput]>
  size: number
}

interface MIDIOutputMap {
  values(): IterableIterator<MIDIOutput>
  size: number
}

interface MIDIPort extends EventTarget {
  id: string
  name: string | null
  type: 'input' | 'output'
  state: 'connected' | 'disconnected' | 'pending'
  connection: 'open' | 'closed' | 'pending'
  version: string | null
  manufacturer: string | null
}

interface MIDIInput extends MIDIPort {
  type: 'input'
  onmidimessage: ((e: MIDIMessageEvent) => void) | null
}

interface MIDIOutput extends MIDIPort {
  type: 'output'
  send(data: number[], timestamp?: number): void
}

interface MIDIMessageEvent extends Event {
  data: Uint8Array
  receivedTime: number
}

interface MIDIConnectionEvent extends Event {
  port: MIDIPort
}

interface Navigator {
  requestMIDIAccess(options?: MIDIOptions): Promise<MIDIAccess>
}
