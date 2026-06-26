import { registerSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'
import { throwError } from '~~/server/utils/apiCall'

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

  const payload={
    username:body.username,
    password:body.password,
    'full_name':body.fullName,
    email:body.email
  }

  const [error, res] = await apiCall(
    $fetch<AuthSession>(`${config.goApiBaseUrl}/auth/register`, {
      method: 'POST',
      body:payload,
      headers: {
        'Authorization': `Bearer ${config.goInternalApiKey}`,
        'Content-Type': 'application/json'
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res!
})