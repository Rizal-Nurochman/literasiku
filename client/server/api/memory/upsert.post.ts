import { z } from 'zod'
import { upsertMemory } from '../../utils/memory'

const bodySchema = z.object({
  id: z.string().trim().min(1).max(200).optional(),
  userId: z.string().trim().min(1).max(200),
  type: z.enum(['preference', 'conversation', 'fact']),
  content: z.string().trim().min(1).max(5_000),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Payload memory tidak valid.' })
  }

  return upsertMemory(parsed.data)
})
