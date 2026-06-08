import { requireAdmin } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const { username, password } = await readBody(event)

  if (!username || !password) {
    throw createError({
      statusCode: 400,
      message: 'Username and password are required',
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: { username },
  })

  if (existingUser) {
    throw createError({
      statusCode: 409,
      message: 'Username already exists',
    })
  }

  const newUser = await prisma.user.create({
    data: {
      username,
      avatar: `https://mineskin.eu/helm/${username}/100`,
      password: await hashPassword(password),
      isAdmin: false,
    },
  })

  return {
    id: newUser.id,
    username: newUser.username,
    avatar: newUser.avatar,
    isAdmin: newUser.isAdmin,
  }
})
