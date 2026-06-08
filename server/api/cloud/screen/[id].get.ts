export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = await useCloudClient()
  const { id } = event.context.params as { id: string }

  try {
    const data = await cloudFetch(`/api/screens/${id}/logs`, {
      method: 'GET',
    })

    return data
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to fetch cloud stats',
    })
  }
})
