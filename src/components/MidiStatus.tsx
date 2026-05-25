interface Props {
  isSupported: boolean
  isConnected: boolean
  deviceName: string | null
  onRetry: () => void
}

export function MidiStatus({ isSupported, isConnected, deviceName, onRetry }: Props) {
  if (!isSupported) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 bg-red-900/40 border border-red-700 rounded-lg text-sm">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>MIDI não suportado neste browser. Use Chrome.</span>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <button
        onClick={onRetry}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 border border-gray-600 rounded-lg text-sm hover:border-yellow-500 transition-colors"
      >
        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
        <span>Conectar MIDI</span>
      </button>
    )
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-green-900/40 border border-green-700 rounded-lg text-sm">
      <span className="w-2 h-2 rounded-full bg-green-500" />
      <span>{deviceName ?? 'Dispositivo MIDI conectado'}</span>
    </div>
  )
}
