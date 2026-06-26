import { registerSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'

export const apiCall = async <T>(promise: Promise<T>): Promise<[any, T | null]> => {
  try {
    const data = await promise
    return [null, data]
  } catch (error) {
    return [error, null]
  }
}

export default defineEventHandler(async (event): Promise<AuthSession> => {
  const body = await readValidatedBody(event, registerSchema.parse)
  const config = useRuntimeConfig(event)

  const [error, res] = await apiCall(
    $fetch<AuthSession>(`${config.goApiBaseUrl}/api/v1/auth/register`, {
      method: 'POST',
      body: body,
      headers: {
        'Authorization': `Bearer ${config.goInternalApiKey}`,
        'Content-Type': 'application/json'
      }
    })
  )

  if (error) {
    console.log(error)
    throw createError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || error.message || 'Gagal terhubung ke backend utama',
      data: error.data
    })
  }

  return res!
})