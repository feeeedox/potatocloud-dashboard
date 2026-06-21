import { client } from '~/client/generated/client.gen';

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  client.setConfig({
    baseURL: config.public.restBaseUrl || 'http://localhost:8080',
  })
})