import { throwError } from '~~/server/utils/apiCall'
import type { ApiResponse } from '#shared/types/api'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const session = getCookie(event, 'literasiku_session')

  if (!session) {
    throwError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  // Use readMultipartFormData to correctly pass file from client to Go backend
  const formData = await readMultipartFormData(event)
  if (!formData || formData.length === 0) {
    throwError({
      statusCode: 400,
      statusMessage: 'No file provided'
    })
    return
  }

  // Reconstruct FormData for Go backend
  const backendFormData = new FormData()
  
  for (const field of formData!) {
    if (field.name === 'file' && field.filename) {
      // File field
      backendFormData.append(
        'file',
        new Blob([new Uint8Array(field.data)], { type: field.type }),
        field.filename
      )
    } else if (field.name) {
      // Regular text field
      backendFormData.append(field.name, field.data.toString())
    }
  }

  try {
    const res = await $fetch<ApiResponse<any>>(`${config.goApiBaseUrl}/api/v1/uploads`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${session}`
      },
      body: backendFormData
    })
    
    return res.data
  } catch (error: any) {
    throwError({
      statusCode: error.response?.status || 500,
      statusMessage: error.data?.message || 'Failed to upload file to backend'
    })
  }
})
