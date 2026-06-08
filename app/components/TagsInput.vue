<script lang="ts" setup>
defineOptions({
  inheritAttrs: false,
})

const tags = defineModel<string[]>({ default: () => [] })

function addTag(flag: string) {
  if (flag && !tags.value.includes(flag)) {
    tags.value.push(flag)
  }
}

function removeTag(flag: string) {
  tags.value = tags.value.filter(f => f !== flag)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <Input
      id="tags-input"
      class="max-w-md"
      v-bind="$attrs"
      @keydown.enter.prevent="addTag($event.target.value); $event.target.value = ''"
    />
    <div class="flex flex-row gap-1">
      <Badge v-for="tag in tags" :key="tag" variant="outline">
        {{ tag }}
        <Icon
          class="ml-1 h-3 w-3 cursor-pointer"
          name="i-lucide-x"
          @click="removeTag(tag)"
        />
      </Badge>
    </div>
  </div>
</template>
