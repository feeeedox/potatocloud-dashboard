import { prisma } from '#server/utils/db'

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

  const newUser = { ...user }
  newUser.password = ''

  await setUserSession(event, {
    user: newUser,
    loggedInAt: new Date(),
  })

  return {
    user: newUser,
  }
})
