import { apiCall } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'literasiku_session')

  if (token) {
    await apiCall(
      $fetch(`${config.goApiBaseUrl}/api/v1/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
    )
  }

  deleteCookie(event, 'literasiku_session', { 
    sameSite: 'lax', 
    path: '/' 
  })

  return { success: true }
})