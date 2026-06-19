import type { ApiService, GetApiV1ServicesResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1Services } from '~/client/generated';
import { useWebSocket } from './useWebSocket'

export function useCloudServices() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const wsServices = ref<ApiService[]>()
  const status = ref<WsStatus>('connecting')

  const { data: httpServices } = useCloudQuery<GetApiV1ServicesResponse>(getApiV1Services, 'services')

  const services = computed<ApiService[]>(() => {
    return wsServices.value ?? httpServices.value ?? []
  })

  const ws = useWebSocket(`${baseUrl}/ws/services`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('service_updates', (data) => {
    wsServices.value = data
  })

  return {
    services,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
