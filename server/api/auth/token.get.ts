export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session?.backendToken) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized',
    })
  }

  return { token: session.backendToken }
})