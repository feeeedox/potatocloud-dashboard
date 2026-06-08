// composables/useJoinStats.ts
//
// Drop-in für den chartData-Block in deinem bestehenden Chart-Component.
// Liefert das gleiche Array-Format wie dein hardcoded chartData,
// aber live vom PotatoCloud REST-Modul.
//
// Verwendung:
//   const { chartData, refresh, pending } = useJoinStats()

export interface HourlyJoins {
  hour: string // "14:00"
  joins: number
}

export interface JoinStatsResponse {
  total: number
  data: HourlyJoins[]
}

export function useJoinStats() {
  const raw = ref<JoinStatsResponse | null>(null)
  const pending = ref(false)
  const error = ref<string | null>(null)

  const refresh = async () => {
    pending.value = true
    error.value = null
    try {
      raw.value = await $fetch<JoinStatsResponse>(
        `/api/cloud/stats/joins`,
      )
    }
    catch (e: any) {
      error.value = e?.message ?? String(e)
    }
    finally {
      pending.value = false
    }
  }

  const chartData = computed(() => {
    if (!raw.value)
      return []
    return raw.value.data.map(entry => ({
      date: entry.hour,
      joins: entry.joins,
    }))
  })

  const totalJoins = computed(() => raw.value?.total ?? 0)

  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    refresh()
    interval = setInterval(refresh, 60_000)
  })

  onUnmounted(() => {
    if (interval)
      clearInterval(interval)
  })

  return { chartData, totalJoins, refresh, pending, error }
}
