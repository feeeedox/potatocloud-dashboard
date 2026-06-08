import { prisma } from '#server/utils/db'

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
    return createError({
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

  const user = {
    id: createdUser.id,
    username: createdUser.username,
    avatar: createdUser.avatar,
    isAdmin: createdUser.isAdmin,
    sessionVersion: createdUser.sessionVersion,
  }

  return await setUserSession(event, {
    user,
    loggedInAt: new Date(),
  })
})
