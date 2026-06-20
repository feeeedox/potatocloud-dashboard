import type { ApiPlayer, ApiServiceStats, ApiStatsSummary } from '~/client/generated'

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
  'service_screen_log': ScreenLogResponse
  'screen:list': ScreenListResponse
  'service_update': ApiService
  'stats_summary_update': ApiStatsSummary

  'players_update': ApiPlayer[]
  'groups_update': ApiGroup[]
  'group_details_update': ApiGroup
  'service_details_update': ApiService
  'service_stats_update': ApiServiceStats
  'services_update': ApiService[]
  'pong': null
  'error': string
}

export type WsEventType = keyof WsEventMap

export interface WsEnvelope<T extends WsEventType = WsEventType> {
  type: T
  data: WsEventMap[T]
}

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error'
