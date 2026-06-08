export function useCloudClient() {
  const config = useRuntimeConfig()

  const baseURL = config.public.cloudBaseUrl || 'http://127.0.0.1:8080' // Fallback URL if not set in env
  const token = config.cloudToken

  if (!token) {
    console.warn('Cloud token is not set. Please set CLOUD_TOKEN in your environment variables.')
  }

  return $fetch.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    onResponseError({ response }) {
      console.error('[Cloud API Error]:', response.status, response._data)
    },
  })
}
