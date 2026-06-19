import { useQuery } from '@tanstack/vue-query'
import { isRef } from 'vue'

export function useCloudQuery<T>(
  sdkFn: (options: any) => Promise<T>,
  queryKey: string,
  params?: any,
) {
  return useQuery(computed(() => {
    const unwrappedParams = isRef(params) ? params.value : params

    return {
      queryKey: unwrappedParams ? [queryKey, unwrappedParams] : [queryKey],
      enabled: import.meta.client,
      queryFn: async () => {
        const result = await sdkFn(unwrappedParams ?? {})
        return result as T ?? null
      },
    }
  }))
}