import type { ApiPlayer } from '~/client/generated'
import type { CloudGroup } from '~/types/cloud'

export interface ScreenLogEvent {
  screenName: string
  line: string
}

export interface ScreenLogsResponse {
  screen: string
  logs: string[]
}

export interface ScreenListResponse {
  screens: Screen[]
}

export interface Screen {
  name: string
  lastUpdate: number
}

export interface WsGroupPayload {
  name: string
  platform: string
  platformVersion: string
  isProxy: boolean
  isFallback: boolean
  isStatic: boolean
  onlineServicesCount: number
  minOnlineCount: number
  maxOnlineCount: number
  onlinePlayerCount: number
  maxPlayers: number
  maxMemory: number
  startPercentage: number
  startPriority: number
}

export interface WsEventMap {
  'screen:logs:batch': ScreenLogDto
  'screen:list': ScreenListResponse
  'service_update': ApiService

  'player_update': ApiPlayer[]
  'groups_update': ApiGroup[]
  'group_details': CloudGroup
  'stats_update': ApiStats
  'service_updates': ApiService[]
  'pong': null
  'error': string
}

export type WsEventType = keyof WsEventMap

export interface WsEnvelope<T extends WsEventType = WsEventType> {
  type: T
  data: WsEventMap[T]
}

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
