<script lang="ts" setup>
import type { SidebarMenuButtonVariants } from '~/components/ui/sidebar'
import type { NavLink } from '~/types/nav'
import { useSidebar } from '~/components/ui/sidebar'

withDefaults(defineProps<{
  item: NavLink
  size?: SidebarMenuButtonVariants['size']
}>(), {
  size: 'default',
})

const { setOpenMobile } = useSidebar()
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem :disabled="item.soon">
      <SidebarMenuButton :class="item.soon && 'opacity-50 cursor-not-allowed'" :data-active="item.link === $route.path" :size="size" :tooltip="item.title" as-child>
        <NuxtLink :to="item.soon ? '' : item.link" @click="setOpenMobile(false)">
          <Icon :name="item.icon || ''" />
          <span :class="item.soon ? 'select-none' : ''">{{ item.title }}</span>
          <span v-if="item.new" class="rounded-md bg-[#adfa1d] px-1.5 py-0.5 text-xs text-black leading-none no-underline group-hover:no-underline">
            New
          </span>
          <span v-if="item.soon" class="rounded-md bg-neutral-600 px-1.5 py-0.5 text-xs text-white leading-none no-underline group-hover:no-underline select-none">
            Soon
          </span>
        </NuxtLink>
      </SidebarMenuButton>
    </SidebarMenuItem>
  </SidebarMenu>
</template>

<style scoped>

</style>
