import { createDigitalLoanSchema } from '#shared/schemas/loans.schema'
import type { DigitalLoanResponse } from '#shared/types/loans'
import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<DigitalLoanResponse> => {
  const body = await readValidatedBody(event, createDigitalLoanSchema.parse)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<DigitalLoanResponse>>(`${config.goApiBaseUrl}/api/v1/loans/digital`, {
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
