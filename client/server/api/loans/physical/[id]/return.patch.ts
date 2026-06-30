import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'
import type { LoanResponse } from '~~/shared/types/loans'

export default defineEventHandler(async (event): Promise<LoanResponse> => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<LoanResponse>>(`${config.goApiBaseUrl}/api/v1/loans/physical/${id}/return`, {
      method: 'PATCH',
      body: {},
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
