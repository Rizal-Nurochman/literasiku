import { updateCategorySchema } from '#shared/schemas/categories.schema'
import type { CategoryResponse } from '#shared/types/categories'
import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'

export default defineEventHandler(async (event): Promise<CategoryResponse> => {
  const id = getRouterParam(event, 'id')
  const body = await readValidatedBody(event, updateCategorySchema.parse)
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<CategoryResponse>>(`${config.goApiBaseUrl}/api/v1/categories/${id}`, {
      method: 'PATCH',
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
