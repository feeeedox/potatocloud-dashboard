<script lang="ts" setup>
import type { User } from '~/types'
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { useApiAction } from '~/composables/useApiAction'
import { userNameAvatarSchema } from '~/lib/schemas'

const props = defineProps<{
  member: User | null
}>()
const emit = defineEmits(['refresh'])
const open = ref(false)

const { handleSubmit, errors, defineField, isSubmitting } = useForm(({
  validationSchema: toTypedSchema(userNameAvatarSchema),
  initialValues: {
    username: props?.member?.username,
    avatar: props?.member?.avatar,
  },
}))

const [username, usernameProps] = defineField('username')
const [avatar, avatarProps] = defineField('avatar')

const { runAction } = useApiAction()

const onSubmit = handleSubmit(async (values) => {
  const result = await runAction(
    () => $fetch<any>(`/api/member/${props?.member?.id}`, { method: 'POST', body: values }),
    'The member has been successfully updated.',
  )

  if (result) {
    open.value = false
    emit('refresh', values)
  }
})
</script>

<template>
  <Dialog v-model:open="open">
    <form @submit="onSubmit">
      <DialogTrigger as-child>
        <DropdownMenuItem @select.prevent>
          Edit Member
        </DropdownMenuItem>
      </DialogTrigger>
      <DialogContent class="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create new member</DialogTitle>
          <DialogDescription>
            Create a new member by filling out the form below.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-4">
          <div class="grid gap-3">
            <Label for="username">Username</Label>
            <Input id="username" v-model="username" :class="{ 'border-destructive': errors.username }" :disabled="isSubmitting" name="username" placeholder="Notch" v-bind="usernameProps" />
            <span v-if="errors.username" class="text-sm text-destructive">
              {{ errors.username }}
            </span>
          </div>
          <div class="grid gap-3">
            <Label for="password">Password</Label>
            <Input id="password" v-model="avatar" :class="{ 'border-destructive': errors.avatar }" :disabled="isSubmitting" name="avatar" placeholder="https://..." v-bind="avatarProps" />
            <span v-if="errors.avatar" class="text-sm text-destructive">
              {{ errors.avatar }}
            </span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose as-child>
            <Button variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <Button :disabled="isSubmitting" type="submit" @click="onSubmit">
            <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
            Update
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
</template>
