import { registerSchema } from '#shared/schemas/auth.schema'
import type { AuthSession } from '#shared/types/auth'

export default defineEventHandler(async (event): Promise<AuthSession> => {
  const body = await readValidatedBody(event, registerSchema.parse)

  await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 500))

  return {
    token: `mock-${Date.now()}`,
    user: {
      id: 'usr_1',
      name: body.name,
      email: body.email,
      role: 'anggota'
    }
  }
})
