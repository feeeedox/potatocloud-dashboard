import type { CreateClientConfig } from './client/generated/client.gen'

export const createClientConfig: CreateClientConfig = config => ({
  ...config,
  baseURL: process.env.NUXT_PUBLIC_REST_BASE_URL || 'http://localhost:8080',
  async onRequest({ request, options }) {
    if (import.meta.server) return request

    try {
      const { token } = await $fetch<{ token: string }>('/api/auth/token')
      options.headers = options.headers ? new Headers(options.headers) : new Headers()
      options.headers.set('Authorization', `Bearer ${token}`)
    }
    catch (e) {
      console.error('token fetch failed:', e)
    }
  },
})