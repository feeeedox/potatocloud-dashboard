import type { ApiService, GetApiV1ServicesByNameResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1ServicesByName } from '~/client/generated';
import { useWebSocket } from './useWebSocket'

export function useCloudService(server: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.wsBaseUrl

  const wsServiceData = ref<ApiService | null>(null)
  const status = ref<WsStatus>('connecting')

  const { data: httpServiceData } = useCloudQuery<GetApiV1ServicesByNameResponse>(getApiV1ServicesByName, `services-${server}`, {
    path: {
      name: server,
    },
  })

  const serviceData = computed<ApiService>(() => {
    return wsServiceData.value ?? (httpServiceData.value as ApiService)
  })

  const ws = useWebSocket(`${baseUrl}/ws/services/${server}`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('service_details_update', (data) => {
    wsServiceData.value = data
  })

  return {
    serviceData,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
