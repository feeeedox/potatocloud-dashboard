import type { WsEnvelope, WsEventMap, WsEventType, WsStatus } from '~/types/websocket'
import { onUnmounted, readonly, ref } from 'vue'

export interface UseWebSocketOptions {
  /** Called once the connection is open. */
  onOpen?: () => void
  /** Called on every clean close. */
  onClose?: (event: CloseEvent) => void
  /** Called on connection errors. */
  onError?: (event: Event) => void
  /**
   * Automatically reconnect after an unexpected disconnect.
   * Set to `false` to disable. Default: true.
   */
  reconnect?: boolean
  /** Base delay in ms before the first reconnect attempt. Default: 1000. */
  reconnectDelay?: number
  /** Maximum reconnect delay in ms (exponential back-off cap). Default: 30_000. */
  reconnectDelayMax?: number
  /** Maximum number of reconnect attempts. Default: Infinity. */
  reconnectAttempts?: number
}

type Handler<T extends WsEventType> = (data: WsEventMap[T]) => void

export function useWebSocket(endpoint: string, options: UseWebSocketOptions = {}) {
  const {
    onOpen,
    onClose,
    onError,
    reconnect = true,
    reconnectDelay = 1_000,
    reconnectDelayMax = 30_000,
    reconnectAttempts = Infinity,
  } = options

  const status = ref<WsStatus>('connecting')
  const error = ref<string | null>(null)

  const handlers = new Map<WsEventType, Set<Handler<any>>>()

  let ws: WebSocket | null = null
  let attempts = 0
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null
  let manualClose = false

  async function buildUrl(base: string): Promise<string> {
    try {
      const { token } = await $fetch('/api/ws-token')
      const sep = base.includes('?') ? '&' : '?'
      return `${base}${sep}apiKey=${encodeURIComponent(token)}`
    }
    catch (error) {
      console.error('[useWebsocket] Failed to get token: ', error)
      throw new Error('Authentication required')
    }
  }

  async function connect() {
    if (typeof window === 'undefined')
      return

    status.value = 'connecting'
    const url = await buildUrl(endpoint)
    ws = new WebSocket(url)

    ws.onopen = () => {
      status.value = 'connected'
      error.value = null
      attempts = 0
      onOpen?.()
    }

    ws.onmessage = (event: MessageEvent) => {
      let envelope: WsEnvelope
      try {
        envelope = JSON.parse(event.data)
      }
      catch {
        console.warn('[useWebSocket] received non-JSON message:', event.data)
        return
      }

      const set = handlers.get(envelope.type as WsEventType)
      if (set) {
        set.forEach(fn => fn(envelope.data))
      }
    }

    ws.onclose = (event: CloseEvent) => {
      status.value = 'disconnected'
      ws = null
      onClose?.(event)

      if (!manualClose && reconnect && attempts < reconnectAttempts) {
        const delay = Math.min(reconnectDelay * 2 ** attempts, reconnectDelayMax)
        attempts++
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    ws.onerror = (event: Event) => {
      status.value = 'error'
      error.value = 'WebSocket error'
      onError?.(event)
    }
  }

  /** Register a typed listener for a specific event type. Returns an unregister function. */
  function on<T extends WsEventType>(type: T, handler: Handler<T>): () => void {
    if (!handlers.has(type))
      handlers.set(type, new Set())
    handlers.get(type)!.add(handler as Handler<any>)

    return () => {
      handlers.get(type)?.delete(handler as Handler<any>)
    }
  }

  /** Send a raw object as JSON. Silently drops messages when not connected. */
  function send(message: unknown): boolean {
    if (ws?.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message))
      return true
    }
    return false
  }

  /** Send a ping to the server. */
  function ping() {
    send({ type: 'ping' })
  }

  /** Close the connection permanently (no reconnect). */
  function disconnect() {
    manualClose = true
    if (reconnectTimer)
      clearTimeout(reconnectTimer)
    ws?.close(1000, 'client disconnect')
  }

  // Start immediately
  connect()

  // Clean up on component unmount
  onUnmounted(disconnect)

  return {
    status: readonly(status),
    error: readonly(error),
    on,
    send,
    ping,
    disconnect,
    reconnect: connect,
  }
}
