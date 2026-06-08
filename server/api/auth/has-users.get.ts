import { prisma } from '#server/utils/db'

export default defineEventHandler(async () => {
  const userCount = await prisma.user.count()
  return {
    hasUsers: userCount > 0,
  }
})
