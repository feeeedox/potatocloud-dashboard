import { requireAdmin } from '#server/utils/auth'
import { getValidatedUserOrThrow } from '#server/utils/user'

export default defineEventHandler(async (event) => {
  const currentUser = await requireAdmin(event)

  const user = await getValidatedUserOrThrow(event)

  if (currentUser.id === user.id) {
    throw createError({
      statusCode: 400,
      message: 'You cannot delete your own account',
    })
  }

  if (user.isAdmin) {
    const adminCount = await prisma.user.count({
      where: { isAdmin: true },
    })

    if (adminCount <= 1) {
      throw createError({
        statusCode: 400,
        message: 'Cannot delete the last admin user',
      })
    }
  }

  await prisma.user.delete({
    where: { id: user.id },
  })

  return {
    message: 'User deleted successfully',
  }
})
