import type { CloudGroup } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudGroups() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const groups = ref<CloudGroup[]>([])
  const status = ref<WsStatus>('connecting')

  const fetchInitialGroups = async () => {
    try {
      const res = await fetch(`/api/cloud/group`)
      groups.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial players', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/groups`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('groups_update', (data) => {
    groups.value = data
  })

  onMounted(() => {
    fetchInitialGroups().then(r => void r)
  })

  return {
    groups,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
