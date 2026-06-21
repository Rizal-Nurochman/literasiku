import { z } from 'zod'
import { getPineconeIndex, getPineconeMemoryNamespace } from '../../utils/pinecone'

const querySchema = z.object({
  id: z.string().trim().min(1).max(200)
})

export default defineEventHandler(async (event) => {
  const parsed = querySchema.safeParse(getQuery(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'ID memory wajib diisi.' })
  }

  await getPineconeIndex().namespace(getPineconeMemoryNamespace()).deleteOne({ id: parsed.data.id })

  return { ok: true, id: parsed.data.id }
})
