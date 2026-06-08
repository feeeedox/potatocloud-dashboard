import type { CloudGroup } from '~/types/cloud'
import type { WsStatus } from '~/types/websocket'
import { readonly, ref } from 'vue'
import { useWebSocket } from './useWebSocket'

export function useCloudGroupDetails(group: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const stats = ref<CloudGroup | null>(null)
  const status = ref<WsStatus>('connecting')

  const fetchInitialGroup = async () => {
    try {
      const res = await fetch(`/api/cloud/group/${group}`)
      stats.value = await res.json()
    }
    catch (e) {
      console.error('Failed to fetch initial players', e)
    }
  }

  const ws = useWebSocket(`${baseUrl}/ws/group-details?group=${group}`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('group_details', (data: CloudGroup) => {
    stats.value = data
  })

  onMounted(() => {
    fetchInitialGroup().then(r => void r)
  })

  return {
    group: stats,
    status: readonly(status),
  }
}
