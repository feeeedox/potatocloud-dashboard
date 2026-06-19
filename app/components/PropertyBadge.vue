<script lang="ts" setup>
import type { ApiProperty } from '~/client/generated';

defineProps<{
  property: ApiProperty
  hideRemove?: boolean
}>()

const emit = defineEmits(['remove'])

function removeProperty() {
  emit('remove')
}
</script>

<template>
  <Badge variant="outline">
    {{ property.name }}={{ property.value }} (default: {{ property.defaultValue }})
    <Icon
      v-if="!hideRemove"
      class="ml-1 h-3 w-3 cursor-pointer"
      name="i-lucide-x"
      @click="removeProperty()"
    />
  </Badge>
</template>
