import type { AuthUser } from '#shared/types/auth'

export default defineEventHandler(async (event): Promise<AuthUser> => {
  const token = getCookie(event, 'literasiku_session') ?? getHeader(event, 'authorization')?.replace('Bearer ', '')

  await new Promise(resolve => setTimeout(resolve, 250 + Math.random() * 250))

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Sesi tidak ditemukan'
    })
  }

  return {
    id: 'usr_1',
    name: 'Anggota Literasiku',
    email: 'anggota@literasiku.local',
    role: 'anggota'
  }
})
