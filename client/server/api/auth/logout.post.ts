export default defineEventHandler(async (): Promise<{ success: boolean }> => {
  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 300))

  return {
    success: true
  }
})
