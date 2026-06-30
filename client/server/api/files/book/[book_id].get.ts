import { apiCall, throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '~~/shared/types/api'
import type { FileResponse } from '~~/shared/types/files'

export default defineEventHandler(async (event): Promise<FileResponse[]> => {
  const bookId = getRouterParam(event, 'book_id')
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  const [error, res] = await apiCall(
    $fetch<ApiResponse<FileResponse[]>>(`${config.goApiBaseUrl}/api/v1/files/book/${bookId}`, {
      method: 'GET',
      headers: {
        'Authorization': session ? `Bearer ${session}` : ''
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data || []
})
