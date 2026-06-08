import type { CloudService } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudServices() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const services = ref<CloudService[]>([])
  const status = ref<WsStatus>('connecting')

  const fetchInitialServices = async () => {
    try {
      const res = await fetch(`/api/cloud/service`)
      services.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial services', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/services`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('service_updates', (data) => {
    services.value = data
  })

  onMounted(() => {
    fetchInitialServices().then(r => void r)
  })

  return {
    services,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
