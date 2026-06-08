import { toast } from 'vue-sonner'

export function useApiAction() {
  const loading = ref(false)

  const runAction = async (callback: () => Promise<any>, successMessage?: string) => {
    loading.value = true
    try {
      const result = await callback()

      if (successMessage) {
        toast.success('Success', {
          description: successMessage,
        })
      }
      return result
    }
    catch (error: any) {
      const description = error.data?.message || error.statusMessage || 'A unknown error occured.'

      toast.error('Error', {
        description,
      })
      console.error('API Error:', error)
      return null
    }
    finally {
      loading.value = false
    }
  }

  return { runAction, loading }
}
