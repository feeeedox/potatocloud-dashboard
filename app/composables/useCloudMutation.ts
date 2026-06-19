import { useMutation } from '@tanstack/vue-query'

export function useCloudMutation<TFn extends (...args: any[]) => any>(sdkFn: TFn) {
  return useMutation({
    mutationFn: async (variables: Parameters<TFn>[0]) => {
      return await sdkFn(variables) as Awaited<ReturnType<TFn>>
    },
  })
}