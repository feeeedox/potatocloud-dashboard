<script lang="ts" setup>
import type { User } from '~/types'

const { data: members, refresh } = await useFetch<User[]>('/api/member', { default: () => [] })

const q = ref('')

const filteredMembers = computed(() => {
  return members.value.filter((member) => {
    const searchTerm = q.value.toLowerCase()
    return member.username.toLowerCase().includes(searchTerm)
  })
})

const { runAction, loading } = useApiAction()

async function toggleAdmin(member: User) {
  await runAction(
    () => $fetch<any>(`/api/member/${member.id}/toggle-admin`, { method: 'POST' }),
    'The member has been successfully updated.',
  )
  await refresh()
}

async function deleteMember(member: User) {
  await runAction(
    () => $fetch<any>(`/api/member/${member.id}`, { method: 'DELETE' }),
    'The member has been successfully deleted.',
  )
  await refresh()
}
</script>

<template>
  <div>
    <h3 class="text-lg font-medium">
      Members
    </h3>
    <p class="text-sm text-muted-foreground">
      Manage your team members and their permissions.
    </p>
  </div>
  <Separator />
  <div class="flex flex-row gap-4 items-center">
    <Input v-model="q" placeholder="Search members..." />
    <AdminMembersCreateDialog @refresh="refresh" />
  </div>
  <div class="grid grid-rows-1 gap-4">
    <div
      v-for="member in filteredMembers"
      :key="member.id"
      class="flex items-center justify-between rounded-md border p-4"
    >
      <div class="flex items-center gap-2 w-full">
        <div class="flex flex-row gap-2 items-center">
          <Avatar>
            <AvatarImage :src="member.avatar" />
            <AvatarFallback>
              {{ member.username.slice(0, 2).toUpperCase() }}
            </AvatarFallback>
          </Avatar>
          <p class="text-sm font-medium text-foreground">
            {{ member.username }}
          </p>
        </div>
        <div class="grow" />
        <div class="flex flex-row gap-2 items-center">
          <div class="flex items-center gap-3">
            <Checkbox
              :id="`admin-${member.id}`"
              v-model="member.isAdmin"
              :disabled="loading"
              @update:model-value="toggleAdmin(member)"
            />
            <Label for="admin">Admin</Label>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button size="icon" variant="ghost">
                <Icon name="lucide:more-vertical" size="18" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <AdminMembersEditDialog :member="member" @refresh="refresh" />
              <AlertDialog>
                <AlertDialogTrigger as-child>
                  <DropdownMenuItem variant="destructive" @select.prevent>
                    Delete Member
                  </DropdownMenuItem>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the member
                      and remove all their data.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction :disabled="loading" @click="deleteMember(member)">
                      <span v-if="!loading">Delete</span>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  </div>
</template>
