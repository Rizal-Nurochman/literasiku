import { loginSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'
import { apiCall } from '~~/server/utils/apiCall'
import { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<AuthSession> => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const config = useRuntimeConfig(event)

  const [error, res] = await apiCall(
    $fetch<ApiResponse<AuthSession>>(`${config.goApiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      body: body,
      headers: {
        'Content-Type': 'application/json'
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})