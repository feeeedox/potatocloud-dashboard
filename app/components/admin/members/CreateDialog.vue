<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import { useApiAction } from '~/composables/useApiAction'
import { userNamePasswordSchema } from '~/lib/schemas'

const emit = defineEmits(['refresh'])
const open = ref(false)

const { handleSubmit, errors, defineField, isSubmitting } = useForm(({
  validationSchema: toTypedSchema(userNamePasswordSchema),
  initialValues: {
    username: '',
    password: '',
  },
}))

const [username, usernameProps] = defineField('username')
const [password, passwordProps] = defineField('password')

function generateRandomPassword() {
  password.value = crypto.getRandomValues(new Uint8Array(16)).reduce((acc, byte) => acc + byte.toString(16).padStart(2, '0'), '')
}

const { runAction } = useApiAction()

const onSubmit = handleSubmit(async (values) => {
  const result = await runAction(
    () => $fetch<any>('/api/member', { method: 'POST', body: values }),
    'The member has been successfully created.',
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
        <Button>Create member</Button>
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
            <PasswordInput id="password" v-model="password" :class="{ 'border-destructive': errors.password }" :disabled="isSubmitting" name="password" placeholder="*******" v-bind="passwordProps" />
            <span v-if="errors.password" class="text-sm text-destructive">
              {{ errors.password }}
            </span>
            <Button size="sm" type="button" variant="secondary" @click="generateRandomPassword">
              Generate password
            </Button>
            <p class="text-xs text-muted-foreground">
              The password can be changed later by the member themselves.
            </p>
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
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </form>
  </Dialog>
</template>
