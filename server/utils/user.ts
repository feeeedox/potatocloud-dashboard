import type { H3Event } from 'h3'

export async function getValidatedUserOrThrow(event: H3Event) {
  const id = getRouterParam(event, 'id')

  if (!id || Number.isNaN(Number(id))) {
    throw createError({
      statusCode: 400,
      message: 'Invalid user ID',
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

  return user
}

export function transformUserForResponse(user: any) {
  return {
    id: user.id,
    username: user.username,
    avatar: user.avatar,
    isAdmin: user.isAdmin,
  }
}
