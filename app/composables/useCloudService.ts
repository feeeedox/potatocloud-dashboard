import type { CloudService } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudService(server: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const serviceData = ref<CloudService | null>(null)
  const status = ref<WsStatus>('connecting')

  const fetchInitialStats = async () => {
    try {
      const res = await fetch(`/api/cloud/service/${server}`)
      serviceData.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial stats', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/service?name=${server}`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('service_update', (data) => {
    serviceData.value = data
  })

  onMounted(() => {
    fetchInitialStats().then(r => void r)
  })

  return {
    serviceData,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
