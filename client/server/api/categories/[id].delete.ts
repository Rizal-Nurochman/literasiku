import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<null>>(`${config.goApiBaseUrl}/api/v1/categories/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': session ? `Bearer ${session}` : ''
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.message ?? 'Success'
})
