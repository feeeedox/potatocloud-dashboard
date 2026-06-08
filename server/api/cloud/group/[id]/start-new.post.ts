export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = useCloudClient()

  const { id } = event.context.params as { id: string }

  try {
    return await cloudFetch(`/api/groups/${id}/start`, {
      method: 'POST',
    })
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to start a new service in the group',
    })
  }
})
