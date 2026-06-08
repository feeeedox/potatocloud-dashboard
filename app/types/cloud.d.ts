export interface CloudStats {
  formattedUptime: string
  uptime: number
  groups: number
  services: number
  onlinePlayers: number
}

export interface CloudServiceStats {
  running: number
  starting: number
  stopping: number
  currentMemoryUsage: number
}

export interface CloudService {
  service: string
  serviceStatus: string
  playerCount: number
  maxPlayerCount: number
  uptime: number
}

export interface CloudPlayer {
  username: string
  uniqueId: string
  connectedProxyId: number
  connectedServerId: number
  connectedProxyName: string
  connectedServerName: string
  serverGroupDto: CloudGroup
  proxyGroupDto: CloudGroup
  properties: CloudProperty[]
}

export interface CloudGroup {
  name: string
  javaCommand: string
  platform: CloudPlatform
  platformVersion: CloudPlatformVersion
  static: boolean
  fallback: boolean
  localNodeReady: boolean
  onlineServicesCount: number
  onlinePlayerCount: number
  minOnlineCount: number
  maxOnlineCount: number
  maxPlayerCount: number
  maxMemory: number
  startPriority: number
  newServicePercent: number
  customJvmFlags: string[]
  serviceTemplates: string[]
  properties: CloudProperty[]
  useModernVelocityForwarding: boolean
}

export interface CloudProperty {
  name: string
  value: string
  defaultValue: string
}

export interface CloudPlatform {
  name: string
  base: string
  downloadUrl: string
  custom: boolean
  proxy: boolean
  bukkitBased: boolean
  paperBased: boolean
  velocityBased: boolean
  limboBased: boolean
  versions: CloudPlatformVersion[]
  prepareSteps: string[]
}

export interface CloudPlatformVersion {
  name: string
  fullName: string
  downloadUrl: string
  fileHash: string
  local: boolean
  legacy: boolean
}
