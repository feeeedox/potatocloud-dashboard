<script lang="ts" setup>
import { Button } from '~/components/ui/button'

const { groups } = useCloudGroups()

const proxies = computed(() => groups.value.filter(g => g.platform.proxy))
const gameServers = computed(() => groups.value.filter(g => !g.platform.proxy))
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap justify-between gap-2 items-center">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Groups
        </h2>
        <p class="text-sm text-muted-foreground">
          A overview of all your groups. You can manage your groups and their servers here.
        </p>
      </div>

      <Button @click="navigateTo('/groups/create')">
        <Icon class="w-8 h-8" name="lucide:plus" />
        Create Group
      </Button>
    </div>

    <Separator class="bg-white/5" />

    <section v-if="proxies.length > 0" class="flex flex-col gap-5">
      <div class="flex items-center gap-3">
        <div class="size-8 items-center flex justify-center rounded-lg bg-primary/10 border border-primary/20 shadow-inner">
          <Icon class="h-5 w-5 text-primary" name="lucide:network" />
        </div>
        <h2 class="text-xl font-bold tracking-tight text-accent-foreground">
          Proxies
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <GroupsCard v-for="group in proxies" :key="group.name" :group="group" is-proxy />
      </div>
    </section>

    <section v-if="gameServers.length > 0" class="flex flex-col gap-5">
      <div class="flex items-center gap-3">
        <div class="size-8 items-center flex justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 shadow-inner">
          <Icon class="h-5 w-5 text-emerald-500" name="lucide:server" />
        </div>
        <h2 class="text-xl font-bold tracking-tight text-accent-foreground">
          Game Servers
        </h2>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
        <GroupsCard v-for="group in gameServers" :key="group.name" :group="group" />
      </div>
    </section>

    <!--    <div v-if="pending" class="flex justify-center py-20 text-muted-foreground"> -->
    <!--      <Icon class="h-10 w-10 animate-spin" name="lucide:loader-2" /> -->
    <!--    </div> -->
  </div>
</template>
