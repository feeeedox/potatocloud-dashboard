import { requireAdmin } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAdmin(event)

  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const user = await prisma.user.findUnique({
    where: { id: Number(id) },
  })

  if (!user) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  if (currentUser.id === Number(id)) {
    throw createError({
      statusCode: 400,
      message: 'You cannot revoke your own admin rights',
    })
  }

  if (user.isAdmin) {
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    })

    if (adminCount <= 1) {
      throw createError({
        statusCode: 400,
        message: 'Cannot revoke admin rights from the last admin user',
      })
    }
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: {
      isAdmin: !user.isAdmin,
      sessionVersion: { increment: 1 },
    },
    select: {
      id: true,
      username: true,
      avatar: true,
      isAdmin: true,
    },
  })
})
