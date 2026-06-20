import type { User } from '~/types';
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)
  if (!session.user) {
    throw createError({ statusCode: 401, statusMessage: 'Not authenticated' })
  }

  const user = session.user as User

  const token = jwt.sign(
    { sub: String(user.id), username: user.username },
    // eslint-disable-next-line node/prefer-global/process
    process.env.JWT_SECRET!,
    { expiresIn: '60s', algorithm: 'HS256' },
  )

  return { token, expiresIn: 60 }
})