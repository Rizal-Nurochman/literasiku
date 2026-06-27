import type { AuthUser } from '#shared/types/auth'

export default defineEventHandler(async (event): Promise<any> => {
  const token = getCookie(event, 'literasiku_session')

  if (!token) {
    throw createError({ statusCode: 401, statusMessage: 'Sesi tidak ditemukan' })
  }

  await new Promise(resolve => setTimeout(resolve, 600))

  return {
    id: 1,
    username: 'misbahulmu',
    full_name: 'misbahul',
    email: 'misbahulmuttaqin395@gmail.com',
    role: 'USER',
    status: 'ACTIVE'
  }
})