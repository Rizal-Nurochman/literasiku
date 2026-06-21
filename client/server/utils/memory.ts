import { createTextEmbedding } from './ai'
import { getPineconeMemoryNamespace, queryKnowledgeVectors, upsertKnowledgeVectors, type KnowledgeVectorInput } from './pinecone'

export type MemoryType = 'preference' | 'conversation' | 'fact'

export type MemoryInput = {
  id?: string
  userId: string
  type: MemoryType
  content: string
  metadata?: Record<string, unknown>
}

function memoryEnabled() {
  const config = useRuntimeConfig()

  return String(config.memoryEnabled ?? 'true') !== 'false'
}

function shouldStoreMemory(content: string) {
  const normalized = content.toLowerCase()

  return ['ingat', 'simpan', 'remember', 'catat', 'mulai sekarang'].some(trigger => normalized.includes(trigger))
}

function sanitizeMetadata(metadata: Record<string, unknown> = {}) {
  const safe: Record<string, string | number | boolean | string[]> = {}

  for (const [key, value] of Object.entries(metadata)) {
    if (value === undefined || value === null) continue
    if (['string', 'number', 'boolean'].includes(typeof value)) safe[key] = value as string | number | boolean
    if (Array.isArray(value) && value.every(item => typeof item === 'string')) safe[key] = value as string[]
  }

  return safe
}

export async function upsertMemory(input: MemoryInput) {
  if (!memoryEnabled()) {
    throw createError({ statusCode: 403, statusMessage: 'Memory dinonaktifkan.' })
  }

  if (!shouldStoreMemory(input.content)) {
    throw createError({ statusCode: 400, statusMessage: 'Memory hanya disimpan jika user meminta secara eksplisit.' })
  }

  const createdAt = new Date().toISOString()
  const { embedding } = await createTextEmbedding(input.content)
  const id = input.id ?? `memory-${input.userId}-${Date.now()}`
  const vector: KnowledgeVectorInput = {
    id,
    values: embedding,
    metadata: {
      ...sanitizeMetadata(input.metadata),
      sourceId: input.userId,
      content: input.content,
      type: input.type,
      memoryType: input.type,
      createdAt
    }
  }

  await upsertKnowledgeVectors([vector], getPineconeMemoryNamespace())

  return { ok: true, id, namespace: getPineconeMemoryNamespace() }
}

export async function searchMemory(input: { query: string, userId?: string, topK?: number }) {
  if (!memoryEnabled()) return []

  const { embedding } = await createTextEmbedding(input.query)
  const filter = input.userId ? { sourceId: { $eq: input.userId } } : undefined

  return queryKnowledgeVectors({
    vector: embedding,
    topK: input.topK ?? 3,
    filter,
    namespace: getPineconeMemoryNamespace()
  })
}

export function buildMemoryContext(matches: Awaited<ReturnType<typeof searchMemory>>) {
  if (!matches.length) return 'Tidak ada memory relevan.'

  return matches.map((match, index) => [
    `[M${index + 1}]`,
    `Type: ${match.metadata?.memoryType ?? match.metadata?.type ?? 'memory'}`,
    `Score: ${typeof match.score === 'number' ? match.score.toFixed(4) : '-'}`,
    `Content: ${match.metadata?.content ?? ''}`
  ].join('\n')).join('\n\n')
}

export function sanitizeMemoryForClient(matches: Awaited<ReturnType<typeof searchMemory>>) {
  return matches.map((match, index) => ({
    referenceId: `M${index + 1}`,
    type: match.metadata?.memoryType ?? match.metadata?.type ?? 'memory',
    content: match.metadata?.content,
    createdAt: match.metadata?.createdAt,
    importance: match.metadata?.importance,
    score: match.score
  }))
}
