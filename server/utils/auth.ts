import type { H3Event } from 'h3'
import type { User } from '~/types'

export async function requireAdmin(event: H3Event) {
  const session = await getUserSession(event)
  const userSession = session.user as User

  if (!userSession)
    throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: { isAdmin: true, sessionVersion: true },
  })

  if (!dbUser || !dbUser.isAdmin || dbUser.sessionVersion !== userSession.sessionVersion) {
    await clearUserSession(event)

    throw createError({
      statusCode: 403,
      statusMessage: 'Session got invalidated, please log in again',
    })
  }

  return session.user as User
}

export async function requireAuthenticated(event: H3Event) {
  const session = await getUserSession(event)
  const userSession = session.user as User

  if (!userSession)
    throw createError({ statusCode: 401, message: 'Unauthorized' })

  const dbUser = await prisma.user.findUnique({
    where: { id: userSession.id },
    select: { sessionVersion: true },
  })

  if (!dbUser || dbUser.sessionVersion !== userSession.sessionVersion) {
    await clearUserSession(event)

    throw createError({
      statusCode: 403,
      statusMessage: 'Session got invalidated, please log in again',
    })
  }

  return session.user as User
}
