import { updateUserSchema } from '#shared/schemas/users.schema'
import type { UserResponse } from '#shared/types/users'
import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<UserResponse> => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateUserSchema.parse)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<UserResponse>>(`${config.goApiBaseUrl}/api/v1/users/${id}`, {
      method: 'PATCH',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': session ? `Bearer ${session}` : ''
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
