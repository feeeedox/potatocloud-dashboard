import type { ApiPlayer, GetApiV1PlayersResponse } from '~/client/generated';
import type { WsStatus } from '~/types/websocket'
import { ref } from 'vue'
import { getApiV1Players } from '~/client/generated';
import { useWebSocket } from './useWebSocket'

export function useCloudPlayers() {
  const config = useRuntimeConfig()
  const baseUrl = config.public.wsBaseUrl

  const wsPlayers = ref<ApiPlayer[] | null>(null)
  const status = ref<WsStatus>('connecting')

  const { data: httpPlayers } = useCloudQuery<GetApiV1PlayersResponse>(getApiV1Players, 'players')

  const players = computed<ApiPlayer[]>(() => {
    return wsPlayers.value ?? httpPlayers.value ?? []
  })

  const ws = useWebSocket(`${baseUrl}/ws/players`, {
    onOpen: () => { status.value = 'connected' },
    onClose: () => { status.value = 'disconnected' },
    onError: () => { status.value = 'error' },
  })

  ws.on('players_update', (data) => {
    wsPlayers.value = data
  })

  return {
    players,
    status: ws.status,
    disconnect: ws.disconnect,
    reconnect: ws.reconnect,
  }
}
