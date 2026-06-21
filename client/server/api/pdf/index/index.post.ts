import { z } from 'zod'
import { createTextEmbeddings } from '../../../utils/ai'
import { splitTextIntoChunks } from '../../../utils/chunk'
import { extractPdfText, normalizePdfText } from '../../../utils/pdf'
import { getPineconeNamespace, upsertKnowledgeVectors, type KnowledgeVectorMetadata } from '../../../utils/pinecone'

const jsonSchema = z.object({
  sourceId: z.string().trim().min(1).max(200),
  documentId: z.string().trim().min(1).max(200).optional(),
  title: z.string().trim().max(300).optional(),
  fileName: z.string().trim().max(300).optional(),
  text: z.string().trim().min(1).max(500_000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional()
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

async function readPdfPayload(event: Parameters<Parameters<typeof defineEventHandler>[0]>[0]) {
  const contentType = getHeader(event, 'content-type') ?? ''

  if (contentType.includes('multipart/form-data')) {
    const form = await readMultipartFormData(event)
    const fields = new Map<string, string>()
    let file: { data: Buffer, filename?: string, type?: string } | undefined

    for (const item of form ?? []) {
      if (item.name === 'file' && item.data) file = { data: item.data, filename: item.filename, type: item.type }
      else if (item.name) fields.set(item.name, item.data.toString('utf8'))
    }

    if (!file) throw createError({ statusCode: 400, statusMessage: 'File PDF wajib dikirim.' })

    const extracted = await extractPdfText(file.data)

    return {
      sourceId: fields.get('sourceId') || file.filename || `pdf-${Date.now()}`,
      documentId: fields.get('documentId') || undefined,
      title: fields.get('title') || file.filename,
      fileName: file.filename,
      mimeType: file.type || 'application/pdf',
      pages: extracted.pages,
      metadata: {}
    }
  }

  const parsed = jsonSchema.safeParse(await readBody(event))
  if (!parsed.success) throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Payload PDF tidak valid.' })

  return {
    ...parsed.data,
    mimeType: 'application/pdf',
    pages: [{ page: undefined, text: normalizePdfText(parsed.data.text ?? '') }],
    metadata: parsed.data.metadata ?? {}
  }
}

export default defineEventHandler(async (event) => {
  const payload = await readPdfPayload(event)
  const baseMetadata = sanitizeMetadata(payload.metadata)
  const pageChunks = payload.pages.flatMap((pageInfo, pageIndex) => splitTextIntoChunks(pageInfo.text).map((content, index) => ({
    content,
    page: pageInfo.page,
    chunkIndex: pageIndex * 1000 + index
  }))).slice(0, 100)

  if (!pageChunks.length) throw createError({ statusCode: 400, statusMessage: 'PDF tidak memiliki teks yang bisa di-index.' })

  const { embeddings, usage } = await createTextEmbeddings(pageChunks.map(chunk => chunk.content))
  const createdAt = new Date().toISOString()
  const vectors = pageChunks.map((chunk, index) => ({
    id: `${payload.sourceId}-${index}`,
    values: embeddings[index] ?? [],
    metadata: {
      ...baseMetadata,
      ...(payload.documentId ? { documentId: payload.documentId } : {}),
      ...(payload.title ? { title: payload.title } : {}),
      ...(payload.fileName ? { fileName: payload.fileName } : {}),
      sourceId: payload.sourceId,
      mimeType: 'application/pdf',
      ...(typeof chunk.page === 'number' ? { page: chunk.page } : {}),
      chunkIndex: chunk.chunkIndex,
      content: chunk.content,
      preview: previewText(chunk.content),
      createdAt
    } satisfies KnowledgeVectorMetadata
  }))

  await upsertKnowledgeVectors(vectors)

  return {
    ok: true,
    sourceId: payload.sourceId,
    totalChunks: vectors.length,
    namespace: getPineconeNamespace(),
    usage
  }
})
