import type { RagReference, SafeRagReference } from '../../lib/ai/references/types'
import type { KnowledgeVectorMatch, KnowledgeVectorMetadata } from './pinecone'
import { dedupeSemanticMatches, rankSemanticMatches } from './semantic'

const SENSITIVE_METADATA_KEYS = new Set(['apiKey', 'authorization', 'token', 'secret', 'password', 'embedding', 'values', 'vector'])

function trimText(value: string, maxLength: number) {
  const normalized = value.replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trim()}...`
}

function getNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function getString(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function sanitizeMetadata(metadata: KnowledgeVectorMetadata | undefined) {
  const safe: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(metadata ?? {})) {
    if (SENSITIVE_METADATA_KEYS.has(key)) continue
    if (value === undefined || value === null) continue
    if (['string', 'number', 'boolean'].includes(typeof value) || Array.isArray(value)) safe[key] = value
  }

  return safe
}

export function buildRagReferences(matches: KnowledgeVectorMatch[]) {
  const config = useRuntimeConfig()
  const minScore = Number(config.ragMinScore ?? 0.3)
  const maxReferences = Math.min(Number(config.ragMaxReferences ?? 8), 10)
  const filtered = dedupeSemanticMatches(rankSemanticMatches(matches))
    .filter(match => typeof match.score !== 'number' || match.score >= minScore)
    .slice(0, maxReferences)

  return filtered.map((match, index): RagReference => {
    const metadata = match.metadata
    const content = getString(metadata?.content) ?? ''
    const title = getString(metadata?.title) ?? getString(metadata?.fileName) ?? metadata?.sourceId
    const preview = getString(metadata?.preview) ?? trimText(content, 220)

    return {
      referenceId: `S${index + 1}`,
      sourceId: metadata?.sourceId ?? match.id,
      documentId: getString(metadata?.documentId),
      title,
      fileName: getString(metadata?.fileName),
      mimeType: getString(metadata?.mimeType),
      page: getNumber(metadata?.page),
      chunkIndex: getNumber(metadata?.chunkIndex),
      score: match.score,
      quote: trimText(content, 500),
      preview: trimText(preview, 220),
      content,
      metadata: sanitizeMetadata(metadata)
    }
  })
}

export function buildReferenceContextBlock(references: RagReference[]) {
  if (!references.length) return 'Tidak ada reference RAG yang cukup relevan.'

  return references.map(reference => [
    `[${reference.referenceId}]`,
    `Title: ${reference.title ?? '-'}`,
    `File: ${reference.fileName ?? '-'}`,
    `Page: ${reference.page ?? 'Halaman tidak tersedia'}`,
    `Chunk: ${reference.chunkIndex ?? '-'}`,
    `Score: ${typeof reference.score === 'number' ? reference.score.toFixed(4) : '-'}`,
    'Content:',
    reference.content
  ].join('\n')).join('\n\n')
}

export function sanitizeReferenceForClient(reference: RagReference): SafeRagReference {
  return {
    referenceId: reference.referenceId,
    sourceId: reference.sourceId,
    documentId: reference.documentId,
    title: reference.title,
    fileName: reference.fileName,
    mimeType: reference.mimeType,
    page: reference.page,
    chunkIndex: reference.chunkIndex,
    score: reference.score,
    quote: trimText(reference.quote, 500),
    preview: trimText(reference.preview, 220)
  }
}

export function extractCitationMarkers(text: string) {
  return [...text.matchAll(/⟦(S\d+|M\d+)⟧/g)].map(match => match[1])
}

export function validateCitationMarkers(text: string, references: Pick<RagReference, 'referenceId'>[]) {
  const valid = new Set(references.map(reference => reference.referenceId))

  return text.replace(/⟦(S\d+|M\d+)⟧/g, (marker, id) => valid.has(id) ? marker : '')
}

export function attachReferencesToAnswer(answer: string, references: RagReference[]) {
  return {
    answer: validateCitationMarkers(answer, references),
    references: references.map(sanitizeReferenceForClient),
    usedReferences: extractCitationMarkers(answer).filter(id => references.some(reference => reference.referenceId === id))
  }
}
