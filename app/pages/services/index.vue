<script lang="ts" setup>
import NumberFlow from '@number-flow/vue'

const { stats } = useCloudServiceStats()
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap justify-between gap-2 items-center">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Services
        </h2>
        <p class="text-sm text-muted-foreground">
          See and manage all running services here. You can stop, restart or view the logs of your services.
        </p>
      </div>
    </div>

    <Separator class="bg-white/5" />

    <div class="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-linear-to-t *:data-[slot=card]:from-primary/5  *:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>Running servers</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <NumberFlow
              v-if="stats"
              :value="stats.running!!"
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>Starting servers</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <NumberFlow
              v-if="stats"
              :value="stats.starting!!"
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>Stopping servers</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <NumberFlow
              v-if="stats"
              :value="stats.stopping!!"
            />
          </CardTitle>
        </CardHeader>
      </Card>
      <Card class="@container/card">
        <CardHeader>
          <CardDescription>Total Memory</CardDescription>
          <CardTitle class="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            <NumberFlow
              v-if="stats"
              :value="stats.currentMemoryUsage!!"
            />
            <span class="text-sm text-muted-foreground">
              / MB
            </span>
          </CardTitle>
        </CardHeader>
      </Card>
    </div>
    <Card class="@container/card">
      <CardHeader>
        <CardTitle>
          Services
        </CardTitle>
        <CardDescription>
          <span class="hidden @[540px]/card:block">
            See all your services and their status here. Click on a service to view more details and manage it.
          </span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ServicesTable />
      </CardContent>
    </Card>
  </div>
</template>
