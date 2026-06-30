import type { ApiResponse } from '#shared/types/api'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'literasiku_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const [error, res] = await apiCall(
    $fetch<ApiResponse<null>>(`${config.goApiBaseUrl}/api/v1/books/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data ?? null
})
