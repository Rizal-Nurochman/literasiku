import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'
import type { DigitalLoanResponse } from '~~/shared/types/loans'

export default defineEventHandler(async (event): Promise<DigitalLoanResponse> => {
  const id = getRouterParam(event, 'id')
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<DigitalLoanResponse>>(`${config.goApiBaseUrl}/api/v1/loans/digital/${id}/revoke`, {
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
