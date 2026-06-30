import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse, PaginatedResponse } from '~~/shared/types/api'
import type { LoanResponse } from '~~/shared/types/loans'

export default defineEventHandler(async (event): Promise<PaginatedResponse<LoanResponse>> => {
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')
  const query = getQuery(event)

  const [error, res] = await apiCall(
    $fetch<ApiResponse<PaginatedResponse<LoanResponse>>>(`${config.goApiBaseUrl}/api/v1/loans/physical`, {
      method: 'GET',
      query,
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
