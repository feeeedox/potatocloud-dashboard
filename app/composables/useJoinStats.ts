import type { GetApiV1StatsJoinsResponse } from '~/client/generated'
import { computed, onUnmounted } from 'vue'
import { getApiV1StatsJoins } from '~/client/generated'

// todo: this is shit, create a endpoint for the website and let the backend send information about joins here, and display them)

export function useJoinStats() {
  const { data, error } = useCloudQuery<GetApiV1StatsJoinsResponse>(
    getApiV1StatsJoins,
    `join-stats`,
  )

  const chartData = computed(() => {
    const statsData = data.value?.data

    if (!statsData || !Array.isArray(statsData))
      return []

    return statsData.map(entry => ({
      date: entry.hour ?? '',
      joins: entry.joins ?? 0,
    }))
  })

  const totalJoins = computed(() => data.value?.total ?? 0)

  const interval: ReturnType<typeof setInterval> | null = null

  onUnmounted(() => {
    if (interval)
      clearInterval(interval)
  })

  return {
    chartData,
    totalJoins,
    error: computed(() => error.value ? String(error.value) : null),
  }
}