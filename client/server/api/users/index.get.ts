import type { UsersResponse } from '#shared/types/users'
import type { ApiResponse } from '#shared/types/api'
import { apiCall, throwError } from '~~/server/utils/apiCall'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const query = getQuery(event)
  const session = getCookie(event, 'literasiku_session')

  const params = new URLSearchParams()
  if (query.page) params.set('page', String(query.page))
  if (query.limit) params.set('limit', String(query.limit))
  if (query.search) params.set('search', String(query.search))
  if (query.role) params.set('role', String(query.role))

  const [error, res] = await apiCall(
    $fetch<ApiResponse<UsersResponse>>(`${config.goApiBaseUrl}/api/v1/users?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Authorization': session ? `Bearer ${session}` : ''
      }
    })
  )

  if (error) {
    throwError(error)
  }

  return res?.data!
})
