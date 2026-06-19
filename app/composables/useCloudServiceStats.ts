import type { ApiServiceStats, GetApiV1StatsServicesResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1StatsServices } from '~/client/generated'
import { useWebSocket } from './useWebSocket'

export function useCloudServiceStats() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const wsStats = ref<ApiServiceStats>()
  const status = ref<WsStatus>('connecting')

  const { data: httpStats } = useCloudQuery<GetApiV1StatsServicesResponse>(getApiV1StatsServices, 'stats-services')

  const stats = computed<ApiServiceStats>(() => {
    return wsStats.value ?? httpStats.value ?? {
      currentMemoryUsage: 0,
      running: 0,
      starting: 0,
      stopping: 0,
    }
  })

  const ws = useWebSocket(`${baseUrl}/ws/stats/services`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('stats_update', (data) => {
    wsStats.value = data
  })

  return {
    stats,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
