export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()
  await fetch()

  if (!loggedIn.value) {
    return navigateTo('/login')
  }

  if (to.path.startsWith('/admin')) {
    const { user } = useUserSession()

    if (!user?.value?.isAdmin) {
      return navigateTo('/')
    }
  }
})
