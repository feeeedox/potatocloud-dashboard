import { useQuery } from '@tanstack/vue-query'

export function useCloudQuery<T>(sdkFn: (options: any) => Promise<T>, queryKey: string) {
  return useQuery(computed(() => ({
    queryKey: [queryKey],
    enabled: import.meta.client,
    queryFn: async () => {
      const result = await sdkFn({})
      return result as T ?? null
    },
  })))
}