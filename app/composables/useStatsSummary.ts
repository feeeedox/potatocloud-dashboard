import type { ApiStatsSummary, GetApiV1StatsSummaryResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1StatsSummary } from '~/client/generated';
import { useWebSocket } from './useWebSocket'

export function useStatsSummary() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.wsBaseUrl

  const wsStats = ref<ApiStatsSummary | null>(null)
  const status = ref<WsStatus>('connecting')

  const { data: httpStats } = useCloudQuery<GetApiV1StatsSummaryResponse>(getApiV1StatsSummary, 'stats-summary')

  const stats = computed<ApiStatsSummary>(() => {
    return wsStats.value ?? (httpStats.value as ApiStatsSummary)
  })

  const ws = useWebSocket(`${baseUrl}/ws/stats/summary`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('stats_summary_update', (data) => {
    wsStats.value = data
  })

  return {
    stats,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
