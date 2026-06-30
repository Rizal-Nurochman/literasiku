import type { BookResponse } from '#shared/types/books'
import type { ApiResponse } from '#shared/types/api'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const id = getRouterParam(event, 'id')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<BookResponse>>(`${config.goApiBaseUrl}/api/v1/books/${id}`, {
      method: 'GET'
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
