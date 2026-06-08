export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = useCloudClient()

  try {
    return await cloudFetch('/api/platform', {
      method: 'GET',
    })
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to fetch cloud stats',
    })
  }
})
