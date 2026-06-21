import { z } from 'zod'
import { sanitizeMemoryForClient, searchMemory } from '../../utils/memory'

const querySchema = z.object({
  q: z.string().trim().min(1).max(2_000),
  userId: z.string().trim().min(1).max(200).optional(),
  topK: z.coerce.number().int().min(1).max(10).default(5)
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Query memory tidak valid.' })
  }

  const matches = await searchMemory({ query: parsed.data.q, userId: parsed.data.userId, topK: parsed.data.topK })

  return {
    ok: true,
    items: sanitizeMemoryForClient(matches)
  }
})
