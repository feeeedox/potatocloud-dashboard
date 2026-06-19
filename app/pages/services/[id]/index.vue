<script lang="ts" setup>
import { computed, ref } from 'vue'

const route = useRoute()
const serviceId = computed(() => route.params.id as string)

const loading = ref(true)

async function stopService() {
  try {
    await $fetch(`/api/cloud/service/${serviceId.value}/stop`, {
      method: 'POST',
    })

    window.location.reload()
  }
  catch (e) {
    console.error('Stop failed', e)
  }
}

function getStatusColor(statusObj: { [key: string]: unknown } | undefined) {
  const status = (statusObj?.name || statusObj || 'UNKNOWN').toString().toUpperCase()

  const map: Record<string, string> = {
    RUNNING: 'text-emerald-400',
    STARTING: 'text-yellow-400',
    STOPPING: 'text-orange-400',
    STOPPED: 'text-muted-foreground',
    PREPARING: 'text-blue-400',
  }
  return map[status] ?? 'text-muted-foreground'
}

function getStatusDot(statusObj: { [p: string]: unknown } | undefined) {
  const status = (statusObj?.name || statusObj || 'UNKNOWN').toString().toUpperCase()

  const map: Record<string, string> = {
    RUNNING: 'bg-emerald-400',
    STARTING: 'bg-yellow-400',
    STOPPING: 'bg-orange-400',
    STOPPED: 'bg-neutral-600',
    PREPARING: 'bg-blue-400',
  }
  return map[status] ?? 'bg-neutral-600'
}

const { serviceData } = useCloudService(serviceId.value)
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-6">
    <div class="flex flex-wrap justify-between gap-3 items-start">
      <div>
        <h2 class="text-2xl font-bold tracking-tight font-mono">
          {{ serviceId.toUpperCase() }}
        </h2>
        <p class="text-sm text-muted-foreground mt-0.5 flex items-center gap-2">
          <template v-if="serviceData">
            <span :class="getStatusDot(serviceData.state)" class="inline-block w-2 h-2 rounded-full" />
            <span :class="getStatusColor(serviceData.state)" class="font-medium capitalize">
              {{ serviceData.state }}
            </span>
            <span class="text-muted-foreground/50">·</span>
            <span>{{ formatSecondsToTime(Number(serviceData.uptime)) }} uptime</span>
          </template>
          <template v-else-if="loading">
            <span class="text-muted-foreground/60">Loading...</span>
          </template>
        </p>
      </div>

      <div class="flex items-center gap-2">
        <AlertDialog>
          <AlertDialogTrigger as-child>
            <Button
              size="sm"
              variant="destructive"
            >
              <Icon class="h-3.5 w-3.5 mr-1.5" name="lucide:square" />
              Stop
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will immediately stop the service and disconnect all players.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction @click="stopService">Stop Service</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    <div
      class="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4"
    >
      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <Icon class="h-3.5 w-3.5" name="lucide:users" />
            Players
          </CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <template v-if="serviceData">
              {{ serviceData.playerCount }}
              <span class="text-sm font-normal text-muted-foreground">/ {{ serviceData.maxPlayers }}</span>
            </template>
            <template v-else>
              <span class="text-muted-foreground text-xl">—</span>
            </template>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <Icon class="h-3.5 w-3.5" name="lucide:clock" />
            Uptime
          </CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl font-mono">
            <template v-if="serviceData">
              {{ formatSecondsToTime(Number(serviceData.uptime)) }}
            </template>
            <template v-else>
              <span class="text-muted-foreground text-xl">—</span>
            </template>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <Icon class="h-3.5 w-3.5" name="lucide:activity" />
            Status
          </CardDescription>
          <CardTitle class="text-2xl font-semibold @[250px]/card:text-3xl">
            <template v-if="serviceData">
              <span :class="getStatusColor(serviceData.state)" class="flex items-center gap-2">
                <span :class="getStatusDot(serviceData.state)" class="w-2.5 h-2.5 rounded-full" />
                {{ serviceData.state }}
              </span>
            </template>
            <template v-else>
              <span class="text-muted-foreground text-xl">—</span>
            </template>
          </CardTitle>
        </CardHeader>
      </Card>

      <Card class="@container/card">
        <CardHeader>
          <CardDescription class="flex items-center gap-1.5">
            <Icon class="h-3.5 w-3.5" name="lucide:gauge" />
            Fill Rate
          </CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <template v-if="serviceData && serviceData.maxPlayers!! > 0">
              {{ Math.round((serviceData.playerCount!! / serviceData.maxPlayers!!) * 100) }}%
            </template>
            <template v-else>
              <span class="text-muted-foreground text-xl">—</span>
            </template>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>

    <Card>
      <CardHeader class="pb-3">
        <CardTitle class="flex items-center gap-2 text-base">
          <Icon class="h-4 w-4 text-emerald-400" name="lucide:terminal" />
          Live Console
        </CardTitle>
        <CardDescription>
          Real-time output from {{ serviceId }}. Use the input below to send commands.
        </CardDescription>
      </CardHeader>
      <CardContent class="pt-0">
        <ServicesConsole :screen-name="serviceId" />
      </CardContent>
    </Card>
  </div>
</template>
