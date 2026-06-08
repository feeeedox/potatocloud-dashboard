import type { CloudPlayer } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudPlayers() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const players = ref<CloudPlayer[]>([])
  const status = ref<WsStatus>('connecting')

  const fetchInitialPlayers = async () => {
    try {
      const res = await fetch(`/api/cloud/player`)
      players.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial players', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/players/live`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('player_update', (data) => {
    players.value = data
  })

  onMounted(() => {
    fetchInitialPlayers().then(r => void r)
  })

  return {
    players,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
