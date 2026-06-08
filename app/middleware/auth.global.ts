export default defineNuxtRouteMiddleware(async (to) => {
  const { loggedIn, fetch } = useUserSession()
  await fetch()

  const { hasUsers } = await $fetch('/api/auth/has-users')

  const publicRoutes = ['/login', '/register', '/setup']

  if (!hasUsers && to.path !== '/setup') {
    return navigateTo('/setup')
  }

  if (hasUsers && to.path === '/setup') {
    if (loggedIn.value) {
      return navigateTo('/')
    }
    return navigateTo('/login')
  }

  if (publicRoutes.includes(to.path)) {
    if (loggedIn.value) {
      return navigateTo('/')
    }
    return
  }

  if (!loggedIn.value) {
    return navigateTo('/login')
  }
})
