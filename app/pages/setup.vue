<script lang="ts" setup>
import { toast } from 'vue-sonner'

const { fetch } = useUserSession()

definePageMeta({
  layout: 'blank',
})

async function handleSignup(form: { username: string, password: string }) {
  try {
    await $fetch('/api/auth/register', {
      method: 'POST',
      body: form,
    })

    toast.success('Account created successfully')

    await fetch()
    await navigateTo('/')
  }
  catch (error) {
    if (error && typeof error === 'object' && 'statusMessage' in error) {
      toast.error('Account creation failed', {
        description: error.statusMessage || 'An error occurred while creating your account. Please try again.',
      })
    }
    else {
      console.error(error)
    }
  }
}
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-6 bg-muted p-6 min-h-svh md:p-10">
    <div class="max-w-sm w-full flex flex-col gap-6">
      <NuxtLink class="flex items-center self-center gap-2 font-medium" to="#">
        <div class="h-6 w-6 flex items-center justify-center rounded-md">
          <img alt="PotatoCloud Logo" class="size-6" src="/images/logo.png">
        </div>
        PotatoCloud.
      </NuxtLink>
      <div class="flex flex-col gap-6">
        <Card>
          <CardHeader class="text-center">
            <CardTitle class="text-xl">
              Welcome to PotatoCloud
            </CardTitle>
            <CardDescription>
              Create your first admin account to get started
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AuthSignUp @signup="handleSignup" />
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>
