import { z } from 'zod'
import { semanticSearch } from '../../utils/semantic'

const querySchema = z.object({
  sourceId: z.string().trim().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'sourceId wajib diisi.' })
  }

  const matches = await semanticSearch({
    prompt: parsed.data.sourceId,
    topK: 100,
    filter: {
      $and: [
        { sourceId: { $eq: parsed.data.sourceId } },
        { mimeType: { $eq: 'application/pdf' } }
      ]
    }
  })

  return {
    ok: true,
    sourceId: parsed.data.sourceId,
    indexed: matches.length > 0,
    chunks: matches.length
  }
})
