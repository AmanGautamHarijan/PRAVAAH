const RECONNECT_DELAY_MS = 3000

export function getLiveSocketUrl() {
  const configured = import.meta.env.VITE_WS_BASE
  if (configured) return `${configured.replace(/\/$/, '')}/ws/live`

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/api/ws/live`
}

export function connectLiveSocket({ onOpen, onMessage, onClose, onError } = {}) {
  let socket
  let reconnectTimer
  let stopped = false

  const connect = () => {
    if (stopped) return

    try {
      socket = new WebSocket(getLiveSocketUrl())
      socket.onopen = () => onOpen?.()
      socket.onmessage = (event) => onMessage?.(event)
      socket.onerror = () => {
        onError?.()
        socket.close()
      }
      socket.onclose = () => {
        onClose?.()
        if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
      }
    } catch {
      onClose?.()
      if (!stopped) reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
    }
  }

  connect()

  return () => {
    stopped = true
    clearTimeout(reconnectTimer)
    socket?.close()
  }
}
