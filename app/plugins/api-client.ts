import { client } from '~/client/generated/client.gen';

export default defineNuxtPlugin(async () => {
  client.setConfig({
    baseURL: 'http://localhost:8080',
  })
})