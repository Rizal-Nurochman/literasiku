import { z } from 'zod'
import { semanticSearch } from '../../utils/semantic'

const paramsSchema = z.object({
  sourceId: z.string().trim().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  const parsed = paramsSchema.safeParse(event.context.params)

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'sourceId tidak valid.' })
  }

  const matches = await semanticSearch({
    prompt: parsed.data.sourceId,
    topK: 100,
    filter: { sourceId: { $eq: parsed.data.sourceId } }
  })

  const first = matches[0]?.metadata

  return {
    sourceId: parsed.data.sourceId,
    title: first?.title,
    fileName: first?.fileName,
    mimeType: first?.mimeType,
    chunks: matches.map(match => ({
      chunkIndex: match.metadata?.chunkIndex,
      page: match.metadata?.page,
      content: match.metadata?.content
    }))
  }
})
