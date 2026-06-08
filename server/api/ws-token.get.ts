import type { User } from '~/types'
import { generateWebSocketToken } from '#server/utils/wsToken'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  if (!session.user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Not authenticated',
    })
  }

  const user = session.user as User

  const wsToken = await generateWebSocketToken(String(user.id))

  return {
    token: wsToken,
    expiresIn: 3600,
  }
})
