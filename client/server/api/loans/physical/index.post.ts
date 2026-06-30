import { createLoanSchema } from '#shared/schemas/loans.schema'
import type { LoanResponse } from '#shared/types/loans'
import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<LoanResponse> => {
  const body = await readValidatedBody(event, createLoanSchema.parse)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<LoanResponse>>(`${config.goApiBaseUrl}/api/v1/loans/physical`, {
      method: 'POST',
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
