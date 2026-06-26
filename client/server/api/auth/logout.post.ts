import { throwError } from "~~/server/utils/apiCall"


export default defineEventHandler(async (event): Promise<{ success: boolean }> => {
  const config=useRuntimeConfig(event)  

  const [error, res] = await apiCall(
    $fetch(`${config.goApiBaseUrl}/auth/logout`)
  )

   if (error) {
    throwError(error)
  }

  return {
    success: true
  }
})
