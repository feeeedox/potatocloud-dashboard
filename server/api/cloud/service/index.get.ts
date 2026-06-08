export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = await useCloudClient()

  try {
    const data = await cloudFetch('/api/services', {
      method: 'GET',
    })

    return data
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to fetch cloud services',
    })
  }
})
