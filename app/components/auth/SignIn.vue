<script lang="ts" setup>
import { toTypedSchema } from '@vee-validate/zod'
import { Loader2 } from 'lucide-vue-next'
import { useForm } from 'vee-validate'
import PasswordInput from '~/components/PasswordInput.vue'

const emit = defineEmits(['login'])

const { handleSubmit, errors, defineField, isSubmitting } = useForm(({
  validationSchema: toTypedSchema(loginSchema),
  initialValues: {
    username: '',
    password: '',
  },
}))

const [username, usernameProps] = defineField('username')
const [password, passwordProps] = defineField('password')

const onSubmit = handleSubmit((values) => {
  emit('login', values)
})
</script>

<template>
  <form class="grid gap-6" @submit="onSubmit">
    <div class="grid gap-2">
      <Label :class="{ 'text-destructive': errors.username }" for="username">
        Username
      </Label>
      <Input
        id="username"
        v-model="username"
        :class="{ 'border-destructive': errors.username }"
        :disabled="isSubmitting"
        auto-capitalize="none"
        auto-complete="username"
        auto-correct="off"
        placeholder="Notch"
        type="text"
        v-bind="usernameProps"
      />
      <span v-if="errors.username" class="text-sm text-destructive">
        {{ errors.username }}
      </span>
    </div>
    <div class="grid gap-2">
      <div class="flex items-center">
        <Label :class="{ 'text-destructive': errors.password }" class="flex-1" for="password">
          Password
        </Label>
      </div>
      <PasswordInput id="password" v-model="password" :class="{ 'border-destructive': errors.password }" :disabled="isSubmitting" v-bind="passwordProps" />
      <span v-if="errors.password" class="text-sm text-destructive">
        {{ errors.password }}
      </span>
    </div>
    <Button :disabled="isSubmitting" class="w-full" type="submit">
      <Loader2 v-if="isSubmitting" class="mr-2 h-4 w-4 animate-spin" />
      Login
    </Button>
  </form>
</template>

<style scoped>

</style>
