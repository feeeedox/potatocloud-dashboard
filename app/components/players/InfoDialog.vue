<script lang="ts" setup>
import type { ApiPlayer } from '~/client/generated'
import { Info } from 'lucide-vue-next'
import { Button } from '~/components/ui/button'

const props = defineProps({
  player: {
    type: Object as () => ApiPlayer,
    required: true,
  },
})

const fields = [
  { label: 'Username', value: props.player.username },
  { label: 'UUID', value: props.player.uniqueId },
  { label: 'Connected Proxy Id', value: props.player?.proxyId },
  { label: 'Connected Server Id', value: props.player?.serverId },
  { label: 'Connected Proxy Name', value: props.player?.proxyName },
  { label: 'Connected Server Name', value: props.player?.serverName },
  { label: 'Server Group', value: props.player?.serverGroup },
  { label: 'Proxy Group', value: props.player?.proxyGroup },
]
</script>

<template>
  <Dialog>
    <DialogTrigger>
      <Button size="sm" variant="ghost">
        <Info class="mr-2 h-4 w-4" />
        Details
      </Button>
    </DialogTrigger>
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Information about {{ player.username }}</DialogTitle>
      </DialogHeader>
      <div class="grid gap-4 py-4">
        <div v-for="field in fields" :key="field.label" class="flex items-center gap-2">
          <span class="font-medium">{{ field.label }}:</span>
          <span>{{ field.value ?? 'N/A' }}</span>
        </div>

        <div v-if="player.properties?.length" class="mt-4">
          <h3 class="mb-2 text-sm font-medium">
            Properties:
          </h3>
          <div class="space-y-2">
            <div v-for="prop in player.properties" :key="prop.name" class="flex items-center gap-2">
              <span class="font-medium">{{ prop.name }}:</span>
              <span>{{ prop.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
</template>
