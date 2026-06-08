<script lang="ts" setup>
import { cn } from '@/lib/utils'

interface Item {
  title: string
  href: string
}

const route = useRoute()

const sidebarNavItems: Item[] = [
  {
    title: 'Members',
    href: '/admin/members',
  },
  {
    title: 'Settings',
    href: '/admin/settings',
  },
]
</script>

<template>
  <nav class="flex lg:flex-col space-x-2 lg:space-x-0 lg:space-y-1">
    <Button
      v-for="item in sidebarNavItems"
      :key="item.title"
      :class="cn(
        'w-full text-left justify-start items-start',
        route.path === item.href && 'bg-muted hover:bg-muted',
      )"
      as-child
      variant="ghost"
    >
      <NuxtLink
        :to="item.href"
      >
        {{ item.title }}
      </NuxtLink>
    </Button>
  </nav>
</template>
