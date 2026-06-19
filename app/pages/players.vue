<script lang="ts" setup>
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

const { players } = useCloudPlayers()
</script>

<template>
  <div class="w-full flex flex-col items-stretch gap-4">
    <div class="flex flex-wrap items-end justify-between gap-2">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">
          Players
        </h2>
        <p class="text-sm text-muted-foreground">
          {{ players.length }} player(s) connected to the cloud.
        </p>
      </div>
    </div>

    <Separator class="bg-white/5" />

    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-[250px]">
              Name
            </TableHead>
            <TableHead class="md:table-cell">
              UUID
            </TableHead>
            <TableHead>Server</TableHead>
            <TableHead class="text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="player in players" :key="player.uniqueId">
            <TableCell class="font-medium">
              <div class="flex items-center gap-3">
                <Avatar class="h-9 w-9 rounded-md border">
                  <AvatarImage
                    :alt="player.username"
                    :src="`https://crafthead.net/avatar/${player.uniqueId}/40`"
                  />
                  <AvatarFallback>{{ player.username != null ? player.username.substring(0, 2) : 'N' }}</AvatarFallback>
                </Avatar>
                <span class="font-bold">{{ player.username }}</span>
              </div>
            </TableCell>

            <TableCell class="md:table-cell">
              <code class="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-xs text-muted-foreground">
                {{ player.uniqueId }}
              </code>
            </TableCell>

            <TableCell>
              <Badge class="font-medium" variant="secondary">
                {{ player.serverName }}
              </Badge>
            </TableCell>

            <TableCell class="text-right">
              <PlayersInfoDialog :player="player" />
            </TableCell>
          </TableRow>

          <TableRow v-if="players.length === 0">
            <TableCell class="h-24 text-center" colspan="4">
              No players online.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>
  </div>
</template>
