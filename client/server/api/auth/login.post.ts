import { loginSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'
import { apiCall } from '#shared/utils/apiCall'

export default defineEventHandler(async (event): Promise<AuthSession> => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const config = useRuntimeConfig(event)

  const [error, res] = await apiCall(
    $fetch<AuthSession>(`${config.goApiBaseUrl}/api/v1/auth/login`, {
      method: 'POST',
      body: body,
      headers: {
        'Authorization': `Bearer ${config.goInternalApiKey}`,
        'Content-Type': 'application/json'
      }
    })
  )

  if (error) {
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || error.message || 'Gagal terhubung ke backend utama',
      data: error.data
    })
  }

  return res!
})