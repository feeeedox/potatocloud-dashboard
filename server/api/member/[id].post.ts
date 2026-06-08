import { requireAdmin } from '#server/utils/auth'
import { userUpdateSchema } from '~/lib/schemas'

export default defineEventHandler(async (event) => {
  await requireAdmin(event)

  const result = await readValidatedBody(event, userUpdateSchema.safeParse)

  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Validation failed, check all fields and try again.',
      data: result.error.format(),
    })
  }

  const body = await readBody(event)
  const id = getRouterParam(event, 'id')

  if (!id) {
    throw createError({
      statusCode: 400,
      message: 'User ID is required',
    })
  }

  const userExists = await prisma.user.findUnique({
    where: { id: Number(id) },
  })

  if (!userExists) {
    throw createError({
      statusCode: 404,
      message: 'User not found',
    })
  }

  const fieldsToUpdate: any = {}
  let forceLogout = false

  if (body.username !== undefined && body.username !== userExists.username) {
    fieldsToUpdate.username = body.username
    forceLogout = true
  }

  if (body.avatar !== undefined && body.avatar !== userExists.avatar) {
    fieldsToUpdate.avatar = body.avatar
    forceLogout = true
  }

  if (forceLogout) {
    fieldsToUpdate.sessionVersion = { increment: 1 }
  }

  return prisma.user.update({
    where: { id: Number(id) },
    data: fieldsToUpdate,
    select: {
      id: true,
      username: true,
      avatar: true,
      isAdmin: true,
    },
  })
})
