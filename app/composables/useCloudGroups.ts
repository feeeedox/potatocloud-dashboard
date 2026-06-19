import type { GetApiV1GroupsDetailsResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1GroupsDetails } from '~/client/generated';
import { useWebSocket } from './useWebSocket'

export function useCloudGroups() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const wsGroups = ref<ApiGroup[] | null>(null)
  const status = ref<WsStatus>('connecting')

  const { data: httpGroups, isPending } = useCloudQuery<GetApiV1GroupsDetailsResponse>(getApiV1GroupsDetails, 'groups')

  const groups = computed<ApiGroup[]>(() => {
    return wsGroups.value ?? httpGroups.value ?? []
  })

  const ws = useWebSocket(`${baseUrl}/ws/groups`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('groups_update', (data) => {
    wsGroups.value = data
  })

  return {
    isPending,
    groups,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
