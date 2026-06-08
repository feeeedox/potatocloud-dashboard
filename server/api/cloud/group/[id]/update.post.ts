import { updateGroupSchema } from '~/lib/schemas'

export default defineEventHandler(async (event) => {
  await requireAuthenticated(event)

  const cloudFetch = useCloudClient()

  const { id } = event.context.params as { id: string }

  const body = await readBody(event)

  const result = await readValidatedBody(event, updateGroupSchema.safeParse)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed, check all fields and try again.',
      data: result.error.format(),
    })
  }

  try {
    return await cloudFetch(`/api/groups/${id}/update`, {
      method: 'POST',
      body,
    })
  }
  catch (error: any) {
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.data?.message || 'Failed to fetch cloud stats',
    })
  }
})
