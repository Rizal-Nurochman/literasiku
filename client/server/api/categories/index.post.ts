import { createCategorySchema } from '#shared/schemas/categories.schema'
import type { CategoryResponse } from '#shared/types/categories'
import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<CategoryResponse> => {
  const body = await readValidatedBody(event, createCategorySchema.parse)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<CategoryResponse>>(`${config.goApiBaseUrl}/api/v1/categories`, {
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
