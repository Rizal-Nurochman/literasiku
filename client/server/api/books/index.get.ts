import type { BooksResponse } from '#shared/types/books'
import type { ApiResponse } from '#shared/types/api'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)

  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.search) params.set('search', String(query.search))
  if (query.category_id) params.set('category_id', String(query.category_id))

  const [error, res] = await apiCall(
    $fetch<ApiResponse<BooksResponse>>(`${config.goApiBaseUrl}/api/v1/books?${params.toString()}`, {
      method: 'GET'
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
