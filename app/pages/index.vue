<script lang="ts" setup>
import NumberFlow from '@number-flow/vue'

const dataCard = ref({
  uptime: '',
  groups: 0,
  services: 0,
  onlinePlayers: 0,
})

const { data } = await useFetch('/api/cloud/stats')

onMounted(() => {
  dataCard.value.uptime = data.value?.formattedUptime ?? '0s'
  dataCard.value.groups = data.value?.groups ?? 0
  dataCard.value.services = data.value?.services ?? 0
  dataCard.value.onlinePlayers = data.value?.onlinePlayers ?? 0
})

const timeRange = ref('30d')

const isDesktop = useMediaQuery('(min-width: 768px)')
watch(isDesktop, () => {
  if (isDesktop.value) {
    timeRange.value = '30d'
  }
  else {
    timeRange.value = '7d'
  }
}, { immediate: true })
</script>

<template>
  <div class="w-full flex flex-col gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="text-2xl font-bold tracking-tight">
        Dashboard
      </h2>
    </div>
    <Separator class="bg-white/5" />
    <main class="@container/main flex flex-1 flex-col gap-4 md:gap-8">
      <div class="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5  *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Online since</CardDescription>
            <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {{ dataCard.uptime }}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Groups</CardDescription>
            <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <NumberFlow
                :value="dataCard.groups"
              />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Online Services</CardDescription>
            <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <NumberFlow
                :value="dataCard.services"
              />
            </CardTitle>
          </CardHeader>
        </Card>
        <Card class="@container/card">
          <CardHeader>
            <CardDescription>Online Players</CardDescription>
            <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <NumberFlow
                :value="dataCard.onlinePlayers"
              />
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
      <Card class="@container/card">
        <CardHeader>
          <CardTitle>Last Joins</CardTitle>
          <CardDescription>
            <span class="hidden @[540px]/card:block">
              Joins in the last 24 hours.
              <span class="text-xs text-muted-foreground font-semibold">
                (Data is being cleared after the cloud restarts)
              </span>
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DashboardLastJoins />
        </CardContent>
      </Card>
    </main>
  </div>
</template>
