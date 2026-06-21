import { z } from 'zod'
import { createTextEmbeddings } from '../utils/ai'
import { splitTextIntoChunks } from '../utils/chunk'
import { getPineconeNamespace, upsertKnowledgeVectors, type KnowledgeVectorMetadata } from '../utils/pinecone'

const metadataSchema = z.record(z.string(), z.unknown()).default({})

const documentSchema = z.object({
  id: z.string().trim().min(1).max(200).optional(),
  content: z.string().trim().min(1).max(20_000),
  metadata: metadataSchema.optional()
})

const bodySchema = z.object({
  sourceId: z.string().trim().min(1).max(200),
  documentId: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().max(300).optional(),
  fileName: z.string().trim().max(300).optional(),
  mimeType: z.string().trim().max(120).optional(),
  content: z.string().trim().min(1).max(500_000).optional(),
  metadata: metadataSchema.optional(),
  documents: z.array(documentSchema).max(100).optional()
}).refine(body => Boolean(body.content || body.documents?.length), {
  message: 'Kirim content atau documents untuk di-index.'
})

function previewText(content: string) {
  const normalized = content.replace(/\s+/g, ' ').trim()

  return normalized.length <= 220 ? normalized : `${normalized.slice(0, 219).trim()}...`
}

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  const safe: Record<string, string | number | boolean | string[]> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) continue
    if (['apiKey', 'authorization', 'token', 'secret', 'password', 'embedding', 'vector', 'values'].includes(key)) continue
    if (['string', 'number', 'boolean'].includes(typeof value)) safe[key] = value as string | number | boolean
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) safe[key] = value as string[]
  }

  return safe
}

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Request indexing tidak valid.' })
  }

  const body = parsed.data
  const baseMetadata = sanitizeMetadata(body.metadata)
  const chunks = body.documents?.length
    ? body.documents.map((document, index) => ({
        id: document.id,
        content: document.content.trim(),
        metadata: sanitizeMetadata(document.metadata),
        chunkIndex: index
      }))
    : splitTextIntoChunks(body.content ?? '').map((content, index) => ({
        id: undefined,
        content,
        metadata: {},
        chunkIndex: index
      }))

  if (!chunks.length) throw createError({ statusCode: 400, statusMessage: 'Tidak ada chunk valid untuk di-index.' })
  if (chunks.length > 100) throw createError({ statusCode: 400, statusMessage: 'Jumlah chunk maksimal 100 per request.' })

  const { embeddings, usage } = await createTextEmbeddings(chunks.map(chunk => chunk.content))
  const createdAt = new Date().toISOString()

  const vectors = chunks.map((chunk, index) => ({
    id: chunk.id ?? `${body.sourceId}-${index}`,
    values: embeddings[index] ?? [],
    metadata: {
      ...baseMetadata,
      ...chunk.metadata,
      ...(body.documentId ? { documentId: body.documentId } : {}),
      ...(body.title ? { title: body.title } : {}),
      ...(body.fileName ? { fileName: body.fileName } : {}),
      ...(body.mimeType ? { mimeType: body.mimeType } : {}),
      sourceId: body.sourceId,
      content: chunk.content,
      preview: previewText(chunk.content),
      chunkIndex: chunk.chunkIndex,
      createdAt
    } satisfies KnowledgeVectorMetadata
  }))

  await upsertKnowledgeVectors(vectors)

  return {
    ok: true,
    sourceId: body.sourceId,
    totalChunks: vectors.length,
    namespace: getPineconeNamespace(),
    usage
  }
})
