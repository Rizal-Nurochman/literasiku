import { loginSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event): Promise<AuthSession> => {
  const body = await readValidatedBody(event, loginSchema.parse)
  const config = useRuntimeConfig(event)

  const [error, res] = await apiCall(
    $fetch<AuthSession>(`${config.goApiBaseUrl}/auth/login`, {
      method: 'POST',
      body: {
        'email':body.email,
        'password':body.password
      },
      headers: {
        'Content-Type': 'application/json'
      }
    })
  )

  console.log(res)

  if (error) {
    throwError(error)
  }

  return res!
})