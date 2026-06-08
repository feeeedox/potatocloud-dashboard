import type { CloudServiceStats } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudServiceStats() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const stats = ref<CloudServiceStats>()
  const status = ref<WsStatus>('connecting')

  const fetchInitialStats = async () => {
    try {
      const res = await fetch(`/api/cloud/stats/services`)
      stats.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial stats', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/stats/services`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('stats_update', (data) => {
    stats.value = data
  })

  onMounted(() => {
    fetchInitialStats().then(r => void r)
  })

  return {
    stats,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
