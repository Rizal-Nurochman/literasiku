import { defineNuxtRouteMiddleware, navigateTo, useCookie } from "nuxt/app"

export default defineNuxtRouteMiddleware((to) => {
  const isProtected =
    to.path.startsWith('/dashboard') ||
    to.path.startsWith('/admin')

  if (!isProtected) {
    return
  }

  const session = useCookie<string | null>('literasiku_session')

  if (!session.value) {
    return navigateTo('/auth/login')
  }
})