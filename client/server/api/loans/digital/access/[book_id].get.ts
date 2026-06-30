import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<{ has_access: boolean }> => {
  const bookId = getRouterParam(event, 'book_id')
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<{ has_access: boolean }>>(`${config.goApiBaseUrl}/api/v1/loans/digital/access/${bookId}`, {
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
