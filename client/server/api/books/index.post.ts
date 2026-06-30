import { createBookSchema } from '#shared/schemas/books.schema'
import type { BookResponse } from '#shared/types/books'
import type { ApiResponse } from '#shared/types/api'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, createBookSchema.parse)
  const config = useRuntimeConfig(event)
  const token = getCookie(event, 'literasiku_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Unauthorized' })
  }

  const [error, res] = await apiCall(
    $fetch<ApiResponse<BookResponse>>(`${config.goApiBaseUrl}/api/v1/books`, {
      method: 'POST',
      body,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
