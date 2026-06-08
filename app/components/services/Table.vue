<script lang="ts" setup>
import type { ColumnDef, ColumnFiltersState, ExpandedState, SortingState, VisibilityState } from '@tanstack/vue-table'
import type { CloudService } from '~/types/cloud'
import { Icon } from '@iconify/vue'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'
import { createReusableTemplate } from '@vueuse/core'

import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-vue-next'
import { h, ref } from 'vue'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { formatMillisToTime, valueUpdater } from '@/lib/utils'
import { useCloudServices } from '~/composables/useCloudServices'

export interface ServiceStatus {
  server: string
  status: 'starting' | 'running' | 'stopping' | 'stopped'
  players: number
  maxPlayerCount: number
}

const [DefineTemplate] = createReusableTemplate<{
  payment: {
    id: string
  }
  onExpand: () => void
}>()

const columns: ColumnDef<CloudService>[] = [
  {
    accessorKey: 'service',
    header: 'Server',
    cell: ({ row }) => h('div', { class: 'font-mono' }, row.getValue('service')),
  },
  {
    accessorKey: 'serviceStatus',
    header: 'Status',
    cell: ({ row }) => {
      const status = row.getValue('serviceStatus') as string
      const statusConfig = {
        RUNNING: { icon: 'i-lucide-play-circle', color: 'text-green-500' },
        STARTING: { icon: 'i-lucide-loader-2', color: 'text-yellow-500', animate: true },
        STOPPING: { icon: 'i-lucide-circle-stop', color: 'text-red-500' },
        STOPPED: { icon: 'i-lucide-pause-circle', color: 'text-muted-foreground' },
      }

      // @ts-expect-error - We know that the status is valid (in the best case :)
      const config = statusConfig[status] || statusConfig.stopped

      return h('div', { class: ['flex items-center gap-2 capitalize font-medium', config.color] }, [
        // @ts-expect-error - We know that the icon exists
        h(Icon, {
          name: config.icon,
          class: ['h-4 w-4', config.animate ? 'animate-spin' : ''],
        }),
        h('span', status),
      ])
    },
  },
  {
    accessorKey: 'players',
    header: ({ column }) => {
      return h(Button, {
        variant: 'ghost',
        class: '-ml-4',
        onClick: () => column.toggleSorting(column.getIsSorted() === 'asc'),
      }, () => ['Players', h(ArrowUpDown, { class: 'ml-2 h-4 w-4' })])
    },
    cell: ({ row }) => {
      return h('div', { class: 'font-medium' }, `${row.original.playerCount} / ${row.original.maxPlayerCount}`)
    },
  },
  {
    accessorKey: 'uptime',
    header: () => h('div', { class: 'text-right' }, 'Uptime'),
    cell: ({ row }) => {
      return h('div', { class: 'font-medium text-right' }, formatMillisToTime(row.original.uptime))
    },
  },
]

const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const rowSelection = ref({})
const expanded = ref<ExpandedState>({})
const { services } = useCloudServices()

const table = useVueTable({
  data: services,
  columns,
  getCoreRowModel: getCoreRowModel(),
  getPaginationRowModel: getPaginationRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getExpandedRowModel: getExpandedRowModel(),
  onSortingChange: updaterOrValue => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: updaterOrValue => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: updaterOrValue => valueUpdater(updaterOrValue, columnVisibility),
  onRowSelectionChange: updaterOrValue => valueUpdater(updaterOrValue, rowSelection),
  onExpandedChange: updaterOrValue => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() { return sorting.value },
    get columnFilters() { return columnFilters.value },
    get columnVisibility() { return columnVisibility.value },
    get rowSelection() { return rowSelection.value },
    get expanded() { return expanded.value },
  },
})

function copy(id: string) {
  navigator.clipboard.writeText(id)
}
</script>

<template>
  <DefineTemplate v-slot="{ payment }">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button class="h-8 w-8 p-0" variant="ghost">
          <span class="sr-only">Open menu</span>
          <MoreHorizontal class="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuItem @click="copy(payment.id)">
          Copy payment ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>View customer</DropdownMenuItem>
        <DropdownMenuItem>View payment details</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </DefineTemplate>
  <div class="w-full">
    <div class="flex items-center py-4">
      <Input
        :model-value="table.getColumn('service')?.getFilterValue() as string"
        class="max-w-sm"
        placeholder="Search service..."
        @update:model-value=" table.getColumn('service')?.setFilterValue($event)"
      />
      <DropdownMenu>
        <DropdownMenuTrigger as-child>
          <Button class="ml-auto" variant="outline">
            Columns <ChevronDown class="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuCheckboxItem
            v-for="column in table.getAllColumns().filter((column) => column.getCanHide())"
            :key="column.id"
            :model-value="column.getIsVisible()"
            class="capitalize"
            @update:model-value="(value) => {
              column.toggleVisibility(!!value)
            }"
          >
            {{ column.id }}
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
    <div class="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead v-for="header in headerGroup.headers" :key="header.id">
              <FlexRender v-if="!header.isPlaceholder" :props="header.getContext()" :render="header.column.columnDef.header" />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <template v-for="row in table.getRowModel().rows" :key="row.id">
              <TableRow :data-state="row.getIsSelected() && 'selected'" class="cursor-pointer" @click="navigateTo(`/services/${row.original.service}`)">
                <TableCell v-for="cell in row.getVisibleCells()" :key="cell.id">
                  <FlexRender :props="cell.getContext()" :render="cell.column.columnDef.cell" />
                </TableCell>
              </TableRow>
              <TableRow v-if="row.getIsExpanded()">
                <TableCell :colspan="row.getAllCells().length">
                  {{ JSON.stringify(row.original) }}
                </TableCell>
              </TableRow>
            </template>
          </template>

          <TableRow v-else>
            <TableCell
              :colspan="columns.length"
              class="h-24 text-center"
            >
              No results.
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <div class="flex items-center justify-end space-x-2 py-4">
      <div class="space-x-2">
        <Button
          :disabled="!table.getCanPreviousPage()"
          size="sm"
          variant="outline"
          @click="table.previousPage()"
        >
          Previous
        </Button>
        <Button
          :disabled="!table.getCanNextPage()"
          size="sm"
          variant="outline"
          @click="table.nextPage()"
        >
          Next
        </Button>
      </div>
    </div>
  </div>
</template>
