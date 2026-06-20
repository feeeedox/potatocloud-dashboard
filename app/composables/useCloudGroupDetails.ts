import type { ApiGroup, GetApiV1GroupsByGroupNameResponse } from '~/client/generated'
import type { WsStatus } from '~/types/websocket'
import { computed, ref } from 'vue'
import { getApiV1GroupsByGroupName } from '~/client/generated'
import { useWebSocket } from './useWebSocket'

export function useCloudGroupDetails(groupName: string) {
  const config = useRuntimeConfig()
  const baseUrl = config.public.cloudBaseUrl

  const wsGroupData = ref<ApiGroup | null>(null)
  const status = ref<WsStatus>('connecting')

  const { data: httpGroupData, isPending } = useCloudQuery<GetApiV1GroupsByGroupNameResponse>(
    getApiV1GroupsByGroupName,
    `groupDetails-${groupName}`,
    {
      path: {
        groupName,
      },
    },
  )

  const group = computed<ApiGroup | null>(() => {
    return wsGroupData.value ?? (httpGroupData.value as ApiGroup) ?? null
  })

  const ws = useWebSocket(`${baseUrl}/ws/group-details?group=${groupName}`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('group_details', (data: ApiGroup) => {
    wsGroupData.value = data
  })

  return {
    group,
    isPending,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}