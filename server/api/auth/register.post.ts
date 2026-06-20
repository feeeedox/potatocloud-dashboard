import { prisma } from '#server/utils/db'
import jwt from 'jsonwebtoken'

export default defineEventHandler(async (event) => {
  const userCount = await prisma.user.count()

  if (userCount > 0) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Registration is disabled. Only admins can create new users.',
    })
  }

  await clearUserSession(event)

  const body = await readBody(event)
  const { username, password } = body

  const existingUser = await prisma.user.findUnique({
    where: {
      username,
    },
  })

  if (existingUser) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username already exists',
    })
  }

  const isFirstUser = true
  const hashedPassword = await hashPassword(password)

  const createdUser = await prisma.user.create({
    data: {
      username,
      avatar: `https://mineskin.eu/helm/${username}/100`,
      password: hashedPassword,
      isAdmin: isFirstUser,
    },
  })

  const backendToken = jwt.sign(
    {
      sub: String(createdUser.id),
      username: createdUser.username,
    },
    // eslint-disable-next-line node/prefer-global/process
    process.env.JWT_SECRET!,
    { expiresIn: '8h', algorithm: 'HS256' },
  )

  const user = {
    id: createdUser.id,
    username: createdUser.username,
    avatar: createdUser.avatar,
    isAdmin: createdUser.isAdmin,
    sessionVersion: createdUser.sessionVersion,
  }

  await setUserSession(event, {
    user,
    backendToken,
    loggedInAt: new Date(),
  }, {
    maxAge: 8 * 60 * 60,
  })

  return {
    user,
  }
})