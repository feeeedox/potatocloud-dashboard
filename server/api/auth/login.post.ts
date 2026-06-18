import { prisma } from '#server/utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const { username, password } = await readBody(event)

  const user = await prisma.user.findUnique({
    where: { username },
  })

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const isPasswordValid = await verifyPassword(user?.password || '', password)

  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  const backendToken = jwt.sign(
    {
      sub: String(user.id),
      username: user.username,
    },
    process.env.JWT_SECRET!,
    { expiresIn: '8h', algorithm: 'HS256' },
  )

  const newUser = { ...user }
  newUser.password = ''

  await setUserSession(event, {
    user: newUser,
    backendToken,
    loggedInAt: new Date(),
  })

  return {
    user: newUser,
  }
})
