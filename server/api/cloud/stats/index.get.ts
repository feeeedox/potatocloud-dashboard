import type { CloudStats } from '~/types/cloud'

export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = await useCloudClient()

  try {
    const data = await cloudFetch('/api/stats', {
      method: 'GET',
    })

    const cloudData = data as CloudStats

    const startTime = cloudData.uptime
    const now = Date.now()

    const diff = now - startTime
    const absoluteDiff = Math.abs(diff)
    const seconds = Math.floor((absoluteDiff / 1000) % 60)
    const minutes = Math.floor((absoluteDiff / (1000 * 60)) % 60)
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    const parts = []
    if (days > 0)
      parts.push(`${days}d`)
    if (hours > 0)
      parts.push(`${hours}h`)
    if (minutes > 0)
      parts.push(`${minutes}m`)
    if (parts.length === 0)
      parts.push(`${seconds}s`)

    const formattedUptime = parts.join(' ')

    return {
      ...cloudData,
      formattedUptime,
    }
  }
  catch {
    return {
      formattedUptime: '0s',
      uptime: 0,
      services: 0,
      groups: 0,
      onlinePlayers: 0,
    }
  }
})
