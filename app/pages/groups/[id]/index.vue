<script lang="ts" setup>
import { PlusCircle, Settings2, Square } from 'lucide-vue-next'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { toast } from 'vue-sonner'
import { postApiV1GroupsByGroupNameShutdown, postApiV1GroupsByGroupNameStart } from '~/client/generated';
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Progress } from '~/components/ui/progress'

const route = useRoute()
const groupNameFromUrl = computed(() => route.params.id as string)

const { group, isPending, status: wsStatus } = useCloudGroupDetails(groupNameFromUrl.value)
const status = computed(() => {
  if (isPending.value && !group.value) return 'connecting'
  if (wsStatus.value === 'error' || (!isPending.value && !group.value)) return 'error'
  return 'connected'
})

const getPercentage = (value: number, max: number) => (max > 0 ? (value / max) * 100 : 0)

const { mutate: shutdownGroup, isPending: isStopping } = useCloudMutation(postApiV1GroupsByGroupNameShutdown)
const { mutate: startService, isPending: isStarting } = useCloudMutation(postApiV1GroupsByGroupNameStart)

async function stopAllServers() {
  shutdownGroup(
    {
      path: {
        groupName: groupNameFromUrl.value,
      },
    },
    {
      onSuccess: () => {
        toast.success('All servers stopped successfully')
      },
      onError: (error: any) => {
        if (error?.data) {
          toast.error(error.data.message)
        }
        else {
          toast.error('Failed to stop servers')
        }
      },
    },
  )
}

async function startNewServer() {
  startService(
    {
      path: {
        groupName: groupNameFromUrl.value,
      },
    },
    {
      onSuccess: () => {
        toast.success('Server starting successfully')
      },
      onError: (error: any) => {
        if (error?.data) {
          toast.error(error.data.message)
        }
        else {
          toast.error('Failed to start server')
        }
      },
    },
  )
}

function DetailRow(props: { label: string }, { slots }: any) {
  return h('div', { class: 'flex justify-between items-center py-2 border-b last:border-0 text-sm' }, [
    h('span', { class: 'text-muted-foreground' }, props.label),
    h('span', { class: 'font-medium' }, slots.default?.()),
  ])
}
</script>

<template>
  <div class="max-w-5xl mx-auto space-y-8">
    <div v-if="status === 'connecting' && !group" class="text-muted-foreground text-sm animate-pulse">
      Connecting to live updates...
    </div>

    <div v-else-if="status === 'error'" class="text-destructive text-sm font-medium">
      Connection to cloud lost.
    </div>

    <template v-if="group">
      <section>
        <div class="flex items-center gap-3 mb-1">
          <h1 class="text-2xl font-semibold tracking-tight">
            {{ group.name }}
          </h1>

          <Badge :variant="group.onlineServicesCount!! > 0 ? 'default' : 'secondary'" class="gap-1.5">
            <span
              :class="group.onlineServicesCount!! > 0 ? 'bg-green-500' : 'bg-slate-400'"
              class="w-1.5 h-1.5 rounded-full"
            />
            {{ group.onlineServicesCount!! > 0 ? 'online' : 'offline' }}
          </Badge>

          <Badge v-if="group.platform?.proxy" variant="secondary">
            proxy
          </Badge>
          <Badge v-if="group.fallback" variant="info">
            fallback
          </Badge>
          <Badge v-if="group.staticServices" variant="outline">
            static
          </Badge>
        </div>
        <p class="text-sm text-muted-foreground">
          {{ group.platform?.name }} <span class="mx-1 text-border">|</span> {{ group.platformVersion?.name }}
        </p>
      </section>

      <div class="flex flex-wrap gap-2">
        <Button :disabled="isStopping" class="gap-2" size="sm" variant="secondary" @click="stopAllServers()">
          <Square class="w-4 h-4" /> Stop all servers
        </Button>
        <Button :disabled="isStarting" class="gap-2" size="sm" variant="default" @click="startNewServer()">
          <PlusCircle class="w-4 h-4" /> Start new server
        </Button>
        <Button class="gap-2" size="sm" variant="outline" @click="navigateTo(`/groups/${group.name}/edit`)">
          <Settings2 class="w-4 h-4" /> Manage group
        </Button>
        <Button class="gap-2" size="sm" variant="destructive" @click="navigateTo(`/groups/${group.name}/edit`)">
          <Icon class="w-4 h-4" name="lucide:trash-2" /> Delete group
        </Button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-medium text-muted-foreground uppercase">
              Online Servers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ group.onlineServicesCount }} <span class="text-sm font-normal text-muted-foreground">/ {{ group.maxServices }}</span>
            </div>
            <Progress :model-value="getPercentage(group.onlineServicesCount!!, group.maxServices!!)" class="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-medium text-muted-foreground uppercase">
              Online Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ group.onlinePlayerCount }} <span class="text-sm font-normal text-muted-foreground">/ {{ group.maxPlayers }}</span>
            </div>
            <Progress :model-value="getPercentage(group.onlinePlayerCount!!, group.maxPlayers!!)" class="h-1.5 mt-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-medium text-muted-foreground uppercase">
              Max Memory
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ group.maxMemory }} <span class="text-sm font-normal text-muted-foreground uppercase">MB</span>
            </div>
            <p class="text-[10px] text-muted-foreground mt-1">
              per server instance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader class="pb-2">
            <CardTitle class="text-xs font-medium text-muted-foreground uppercase">
              Start Threshold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div class="text-2xl font-bold">
              {{ group.startPercentage }}<span class="text-sm font-normal text-muted-foreground">%</span>
            </div>
            <p class="text-[10px] text-muted-foreground mt-1">
              auto-scale trigger
            </p>
          </CardContent>
        </Card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle class="text-sm">
              Configuration
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <DetailRow label="Java Command">
              <code class="text-xs bg-muted px-1 rounded">{{ group.javaCommand }}</code>
            </DetailRow>
            <DetailRow label="Static">
              <Badge :variant="group.staticServices ? 'default' : 'secondary'">
                {{ group.staticServices }}
              </Badge>
            </DetailRow>
            <DetailRow label="Min / Max Online">
              {{ group.minServices }} / {{ group.maxServices }}
            </DetailRow>
            <DetailRow label="Start Priority">
              {{ group.startPriority }}
            </DetailRow>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle class="text-sm">
              Platform Details
            </CardTitle>
          </CardHeader>
          <CardContent class="space-y-1">
            <DetailRow label="Name">
              {{ group.platform?.name }}
            </DetailRow>
            <DetailRow label="Version">
              {{ group.platformVersion?.fullName }}
            </DetailRow>
            <DetailRow label="Proxy">
              <Badge :variant="group.platform?.proxy ? 'success' : 'secondary'">
                {{ group.platform?.proxy }}
              </Badge>
            </DetailRow>
            <DetailRow label="Paper-based">
              <Badge :variant="group.platform?.paperBased ? 'success' : 'secondary'">
                {{ group.platform?.paperBased }}
              </Badge>
            </DetailRow>
          </CardContent>
        </Card>
      </div>

      <div class="space-y-4">
        <Card v-if="group.customJvmFlags?.length">
          <CardHeader>
            <CardTitle class="text-sm">
              JVM Flags
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-2">
            <code v-for="flag in group.customJvmFlags" :key="flag" class="text-[11px] bg-muted border rounded px-1.5 py-0.5 font-mono">
              {{ flag }}
            </code>
          </CardContent>
        </Card>

        <Card v-if="group.templates?.length">
          <CardHeader>
            <CardTitle class="text-sm">
              Service Templates
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-2">
            <Badge v-for="tpl in group.templates" :key="tpl" variant="secondary">
              {{ tpl }}
            </Badge>
          </CardContent>
        </Card>

        <Card v-if="group.properties?.length">
          <CardHeader>
            <CardTitle class="text-sm">
              Custom Properties
            </CardTitle>
          </CardHeader>
          <CardContent class="flex flex-wrap gap-2">
            <PropertyBadge
              v-for="prop in group.properties"
              :key="prop.name"
              :property="prop"
              hide-remove
            />
          </CardContent>
        </Card>
      </div>
    </template>
  </div>
</template>
