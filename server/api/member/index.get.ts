import { requireAdmin } from '#server/utils/auth'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  return prisma.user.findMany({
    select: {
      id: true,
      username: true,
      avatar: true,
      isAdmin: true,
    },
  })
})
