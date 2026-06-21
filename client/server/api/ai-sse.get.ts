import { streamText } from 'ai'
import { z } from 'zod'
import { runAgent } from '../utils/agent'
import { selectChatModel } from '../utils/models'
import { buildMemoryContext, sanitizeMemoryForClient, searchMemory } from '../utils/memory'
import { buildReferenceContextBlock, buildRagReferences, extractCitationMarkers, sanitizeReferenceForClient } from '../utils/references'
import { retrieveContextFromPinecone, retrievePdfContext } from '../utils/rag'
import { semanticRoute } from '../utils/semantic'
import { createSSEStream } from '../utils/sse'
import { buildSkillsSystemPrompt, selectSkillIds } from '../utils/skills'

const booleanQuery = z.preprocess(value => String(value ?? 'true') === 'true', z.boolean())

const querySchema = z.object({
  q: z.string().trim().min(1, 'Query q wajib diisi.').max(2_000, 'Query terlalu panjang.'),
  mode: z.enum(['fast', 'thinking', 'auto']).optional(),
  sourceId: z.string().trim().min(1).max(200).optional(),
  sessionId: z.string().trim().min(1).max(200).optional(),
  userId: z.string().trim().min(1).max(200).optional(),
  topK: z.coerce.number().int().min(1).max(10).default(5),
  useMemory: booleanQuery.default(true),
  useSkills: booleanQuery.default(true),
  useRag: booleanQuery.default(true),
  includeReferences: booleanQuery.default(true)
})

const BASE_SYSTEM_PROMPT = `Kamu adalah Literasiku AI Agent, asisten digital library dengan kemampuan RAG, PDF understanding, memory, semantic search, dan ReAct-style tool use.
Jawab dalam Bahasa Indonesia secara default. Jika mode thinking, analisis lebih mendalam tetapi jangan tampilkan chain-of-thought internal.
Gunakan konteks Pinecone jika relevan. Jangan mengarang isi buku, PDF, halaman, judul, penulis, atau sumber.
Gunakan citation marker inline ⟦S1⟧ untuk klaim yang berasal dari RAG. Jangan membuat citation marker yang tidak tersedia.`

export default defineEventHandler((event) => {
  const rawQuery = getQuery(event)

  return createSSEStream(async ({ send, signal }) => {
    const parsed = querySchema.safeParse(rawQuery)

    if (!parsed.success) {
      send('error', { message: parsed.error.issues[0]?.message ?? 'Query SSE tidak valid.' })
      return
    }

    const input = parsed.data
    send('start', { ok: true, message: 'stream started' })

    const route = semanticRoute(input.q)
    const useRag = input.useRag && route.useRag
    const useMemory = input.useMemory && (route.useMemory || input.useMemory)
    const useAgent = route.useAgent
    const selected = selectChatModel({
      mode: input.mode,
      prompt: input.q,
      routeRecommendedMode: route.recommendedModelMode,
      useAgent
    })
    const skillIds = input.useSkills ? selectSkillIds(input.q, route.skills) : []
    const skillPrompt = input.useSkills ? await buildSkillsSystemPrompt(input.q, route.skills) : 'Tidak ada skill tambahan yang dimuat.'

    send('route', {
      route: route.route,
      modelMode: selected.mode,
      skills: skillIds,
      needsReferences: route.needsReferences,
      citationStyle: route.citationStyle
    })

    let references = [] as ReturnType<typeof buildRagReferences>
    let referenceContext = 'Tidak ada konteks RAG.'

    if (useRag) {
      try {
        const matches = route.route === 'pdf_rag'
          ? await retrievePdfContext({ query: input.q, topK: input.topK, sourceId: input.sourceId })
          : await retrieveContextFromPinecone({ query: input.q, topK: input.topK, sourceId: input.sourceId })
        references = input.includeReferences ? buildRagReferences(matches) : []
        referenceContext = buildReferenceContextBlock(references)
        send('references', { items: references.map(sanitizeReferenceForClient) })
        send('context', {
          total: references.length,
          items: references.map(reference => ({
            id: reference.referenceId,
            score: reference.score,
            title: reference.title,
            sourceId: reference.sourceId,
            chunkIndex: reference.chunkIndex
          }))
        })
      } catch (error) {
        console.error('SSE Pinecone query gagal:', error)
        send('error', { message: 'Data library belum bisa diakses saat ini.' })
        return
      }
    } else {
      send('references', { items: [] })
      send('context', { total: 0, items: [] })
    }

    let memoryContext = 'Memory tidak aktif atau tidak ada memory relevan.'

    if (useMemory) {
      try {
        const memoryMatches = await searchMemory({ query: input.q, userId: input.userId ?? input.sessionId, topK: 3 })
        memoryContext = buildMemoryContext(memoryMatches)
        send('memory', { items: sanitizeMemoryForClient(memoryMatches) })
      } catch (error) {
        console.error('SSE memory retrieval gagal:', error)
        send('memory', { items: [] })
      }
    }

    const agent = useAgent ? runAgent({ prompt: input.q, route, useMemory, useRag, useSkills: input.useSkills }) : undefined
    const system = [
      BASE_SYSTEM_PROMPT,
      `Active model mode: ${selected.mode}`,
      `Semantic route: ${route.route}`,
      `Skill instructions:\n${skillPrompt}`,
      `Memory Context:\n${memoryContext}`,
      `RAG Reference Context:\n${referenceContext}`,
      agent ? `Agent safe steps:\n${agent.safeSummary}` : 'Agent tidak aktif.'
    ].join('\n\n')

    let finalText = ''
    const result = streamText({
      model: selected.model,
      system,
      prompt: input.q,
      abortSignal: signal
    })

    for await (const text of result.textStream) {
      if (signal.aborted) return
      finalText += text
      send('delta', { text })
    }

    send('done', {
      ok: true,
      usedReferences: extractCitationMarkers(finalText).filter(id => references.some(reference => reference.referenceId === id))
    })
  })
})
