import { createTextEmbedding } from './ai'
import { queryKnowledgeVectors, type KnowledgeVectorMatch } from './pinecone'

export type SemanticRouteName = 'general_chat' | 'library_rag' | 'pdf_rag' | 'memory_query' | 'summarization' | 'quiz_generation' | 'book_recommendation' | 'agentic_reasoning' | 'coding_help'

export type SemanticRouteResult = {
  route: SemanticRouteName
  confidence: number
  recommendedModelMode: 'fast' | 'thinking'
  skills: string[]
  useRag: boolean
  useMemory: boolean
  useAgent: boolean
  needsReferences: boolean
  citationStyle: 'inline-hover' | 'none'
  sourceGroundingRequired: boolean
}

function hasAny(prompt: string, words: string[]) {
  return words.some(word => prompt.includes(word))
}

export function semanticRoute(prompt: string): SemanticRouteResult {
  const normalized = prompt.toLowerCase()

  let result: SemanticRouteResult = {
    route: 'general_chat',
    confidence: 0.62,
    recommendedModelMode: 'fast',
    skills: ['general-assistant'],
    useRag: false,
    useMemory: false,
    useAgent: false,
    needsReferences: false,
    citationStyle: 'none',
    sourceGroundingRequired: false
  }

  if (hasAny(normalized, ['debug', 'kode', 'coding', 'typescript', 'nuxt', 'error stack'])) {
    result = { ...result, route: 'coding_help', confidence: 0.75, recommendedModelMode: 'thinking', skills: ['react-agent'], useAgent: true }
  }

  if (hasAny(normalized, ['rekomendasi buku', 'sarankan buku', 'bacaan'])) {
    result = { ...result, route: 'book_recommendation', confidence: 0.78, skills: ['book-recommendation'], useRag: true, useMemory: true }
  }

  if (hasAny(normalized, ['kuis', 'quiz', 'latihan soal', 'pilihan ganda'])) {
    result = { ...result, route: 'quiz_generation', confidence: 0.8, skills: ['quiz-generator', 'rag-answering'], useRag: true }
  }

  if (hasAny(normalized, ['ringkas', 'rangkuman', 'summary', 'simpulkan', 'inti dokumen', 'inti pdf'])) {
    result = { ...result, route: 'summarization', confidence: 0.82, skills: ['summarization', 'rag-answering', 'source-grounding'], useRag: true, needsReferences: true, citationStyle: 'inline-hover', sourceGroundingRequired: true }
  }

  if (hasAny(normalized, ['ingat', 'simpan', 'remember', 'catat', 'preferensi', 'histori', 'mulai sekarang'])) {
    result = { ...result, route: 'memory_query', confidence: 0.8, skills: ['memory'], useMemory: true }
  }

  if (hasAny(normalized, ['pdf', 'halaman', 'bab', 'file dokumen', 'dokumen panjang'])) {
    result = { ...result, route: 'pdf_rag', confidence: 0.88, recommendedModelMode: 'thinking', skills: ['pdf-reading', 'rag-answering', 'source-grounding'], useRag: true, useAgent: hasAny(normalized, ['analisis', 'bandingkan', 'dokumen panjang']), needsReferences: true, citationStyle: 'inline-hover', sourceGroundingRequired: true }
  }

  if (hasAny(normalized, ['dokumen', 'library', 'buku', 'materi', 'berdasarkan data', 'berdasarkan dokumen', 'sumber', 'referensi', 'mana buktinya'])) {
    result = { ...result, route: 'library_rag', confidence: Math.max(result.confidence, 0.84), skills: ['rag-answering', 'source-grounding'], useRag: true, needsReferences: true, citationStyle: 'inline-hover', sourceGroundingRequired: true }
  }

  if (hasAny(normalized, ['analisis', 'rancang', 'evaluasi', 'strategi', 'kenapa', 'bandingkan', 'full reasoning', 'pikirkan matang', 'multi-step'])) {
    result = { ...result, route: result.useRag ? result.route : 'agentic_reasoning', confidence: Math.max(result.confidence, 0.86), recommendedModelMode: 'thinking', skills: [...new Set([...result.skills, 'react-agent'])], useAgent: true }
  }

  if (result.confidence < 0.5) return semanticRoute('')

  return result
}

export function buildSemanticQuery(prompt: string) {
  return prompt.replace(/\s+/g, ' ').trim().slice(0, 2_000)
}

export function rankSemanticMatches(matches: KnowledgeVectorMatch[]) {
  return [...matches].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}

export function dedupeSemanticMatches(matches: KnowledgeVectorMatch[]) {
  const seen = new Set<string>()

  return rankSemanticMatches(matches).filter((match) => {
    const content = match.metadata?.content?.toLowerCase().replace(/\s+/g, ' ').slice(0, 220) ?? match.id
    const key = `${match.metadata?.sourceId ?? ''}:${match.metadata?.page ?? ''}:${content}`

    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function semanticSearch(input: { prompt: string, topK?: number, filter?: Record<string, unknown>, namespace?: string }) {
  const { embedding } = await createTextEmbedding(buildSemanticQuery(input.prompt))
  const matches = await queryKnowledgeVectors({
    vector: embedding,
    topK: input.topK ?? 5,
    filter: input.filter,
    namespace: input.namespace
  })

  return dedupeSemanticMatches(matches)
}
