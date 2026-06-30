import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'
import type { UserResponse } from '~~/shared/types/users'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<UserResponse>>(`${config.goApiBaseUrl}/api/v1/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': session ? `Bearer ${session}` : ''
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
