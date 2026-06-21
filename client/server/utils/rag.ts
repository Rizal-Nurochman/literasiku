import type { UIMessage } from 'ai'
import { createTextEmbedding } from './ai'
import { queryKnowledgeVectors, type KnowledgeVectorMatch } from './pinecone'
import { dedupeSemanticMatches, rankSemanticMatches } from './semantic'

type RetrieveContextInput = {
  query: string
  topK?: number
  sourceId?: string
  mimeType?: string
}

function buildFilter(input: RetrieveContextInput) {
  const conditions: Record<string, unknown>[] = []

  if (input.sourceId) conditions.push({ sourceId: { $eq: input.sourceId } })
  if (input.mimeType) conditions.push({ mimeType: { $eq: input.mimeType } })

  if (!conditions.length) return undefined
  if (conditions.length === 1) return conditions[0]

  return { $and: conditions }
}

export function extractLatestUserTextFromUIMessages(messages: UIMessage[]) {
  const latestUserMessage = [...messages].reverse().find(message => message.role === 'user')

  if (!latestUserMessage) return ''

  return latestUserMessage.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n')
    .trim()
}

export async function retrieveContextFromPinecone(input: RetrieveContextInput) {
  const topK = Math.min(Math.max(input.topK ?? 5, 1), 10)
  const { embedding } = await createTextEmbedding(input.query)
  const matches = await queryKnowledgeVectors({
    vector: embedding,
    topK,
    filter: buildFilter(input)
  })

  return dedupeSemanticMatches(rankSemanticMatches(matches))
}

export async function retrievePdfContext(input: Omit<RetrieveContextInput, 'mimeType'>) {
  return retrieveContextFromPinecone({ ...input, mimeType: 'application/pdf' })
}

export function buildContextBlock(matches: KnowledgeVectorMatch[]) {
  if (!matches.length) {
    return 'Data library belum cukup untuk menjawab pertanyaan ini.'
  }

  return matches.map((match, index) => {
    const metadata = match.metadata

    return [
      `Konteks ${index + 1}`,
      `Source ID: ${metadata?.sourceId ?? '-'}`,
      `Title: ${metadata?.title ?? '-'}`,
      `File: ${metadata?.fileName ?? '-'}`,
      `Page: ${metadata?.page ?? 'Halaman tidak tersedia'}`,
      `Chunk: ${metadata?.chunkIndex ?? '-'}`,
      `Score: ${typeof match.score === 'number' ? match.score.toFixed(4) : '-'}`,
      `Content: ${metadata?.content ?? ''}`
    ].join('\n')
  }).join('\n\n')
}
