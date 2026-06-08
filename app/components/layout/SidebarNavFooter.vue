<script lang="ts" setup>
import type { User } from '~/types';
import { useSidebar } from '~/components/ui/sidebar';

defineProps<{
  user: User
}>()

const { isMobile, setOpenMobile } = useSidebar()

const { clear, fetch } = useUserSession()

async function handleLogout() {
  await fetch()
  await clear()
  navigateTo('/login')
}

const showModalTheme = ref(false)
</script>

<template>
  <SidebarMenu>
    <SidebarMenuItem>
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <SidebarMenuButton
            class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            size="lg"
          >
            <Avatar class="h-8 w-8 rounded-lg">
              <AvatarImage :alt="user.username" :src="user.avatar" />
              <AvatarFallback class="rounded-lg">
                {{ user.username.split(' ').map((n) => n[0]).join('') }}
              </AvatarFallback>
            </Avatar>
            <div class="grid flex-1 text-left text-sm leading-tight">
              <span class="truncate font-semibold">{{ user.username }}</span>
            </div>
            <Icon class="ml-auto size-4" name="i-lucide-chevrons-up-down" />
          </SidebarMenuButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          :side="isMobile ? 'bottom' : 'right'"
          align="end"
          class="min-w-56 w-[--radix-dropdown-menu-trigger-width] rounded-lg"
        >
          <DropdownMenuLabel class="p-0 font-normal">
            <div class="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar class="h-8 w-8 rounded-lg">
                <AvatarImage :alt="user.username" :src="user.avatar" />
                <AvatarFallback class="rounded-lg">
                  {{ user.username.split(' ').map((n) => n[0]).join('') }}
                </AvatarFallback>
              </Avatar>
              <div class="grid flex-1 text-left text-sm leading-tight">
                <span class="truncate font-semibold">{{ user.username }}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
                    <DropdownMenuItem as-child>
              <NuxtLink external target="_blank" to="https://github.com/feeeedox/potatocloud-dashboard">
                <Icon name="i-lucide-github" />
                Github Repository
              </NuxtLink>
            </DropdownMenuItem>
            <DropdownMenuItem @click="showModalTheme = true">
              <Icon name="i-lucide-paintbrush" />
              Theme
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem @click="handleLogout">
            <Icon name="i-lucide-log-out" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </SidebarMenuItem>
  </SidebarMenu>

  <Dialog v-model:open="showModalTheme">
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Customize</DialogTitle>
        <DialogDescription class="text-xs text-muted-foreground">
          Customize & Preview in Real Time
        </DialogDescription>
      </DialogHeader>
      <ThemeCustomize />
    </DialogContent>
  </Dialog>

  <p class="px-3 text-center">
    <span class="text-xs text-muted-foreground">
      Made with 💚 by <a class="underline" href="https://github.com/feeeedox" target="_blank">feeeedox</a>
    </span>
  </p>
</template>

<style scoped>

</style>
