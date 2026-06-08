export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = useCloudClient()
  const { id } = event.context.params as { id: string }
  const body = await readBody(event)

  try {
    return await cloudFetch(`/api/screens/${id}/command`, {
      method: 'POST',
      body: { command: body.command },
    })
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to execute command',
    })
  }
})
