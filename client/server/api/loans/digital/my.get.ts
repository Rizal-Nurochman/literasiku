import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse, PaginatedResponse } from '~~/shared/types/api'
import type { DigitalLoanResponse } from '~~/shared/types/loans'

export default defineEventHandler(async (event): Promise<PaginatedResponse<DigitalLoanResponse>> => {
  const query = getQuery(event)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<PaginatedResponse<DigitalLoanResponse>>>(`${config.goApiBaseUrl}/api/v1/loans/digital/my`, {
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
