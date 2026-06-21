import { convertToModelMessages, createUIMessageStream, createUIMessageStreamResponse, streamText, type UIMessage } from 'ai'
import { z } from 'zod'
import { runAgent } from '../utils/agent'
import { resolveModelMode, selectChatModel } from '../utils/models'
import { buildMemoryContext, sanitizeMemoryForClient, searchMemory } from '../utils/memory'
import { buildReferenceContextBlock, buildRagReferences, sanitizeReferenceForClient } from '../utils/references'
import { retrieveContextFromPinecone, retrievePdfContext } from '../utils/rag'
import { semanticRoute } from '../utils/semantic'
import { buildSkillsSystemPrompt, selectSkillIds } from '../utils/skills'

const bodySchema = z.object({
  messages: z.array(z.any()).min(1, 'Messages tidak boleh kosong.'),
  mode: z.enum(['fast', 'thinking', 'auto']).optional(),
  sourceId: z.string().trim().min(1).max(200).optional(),
  sessionId: z.string().trim().min(1).max(200).optional(),
  userId: z.string().trim().min(1).max(200).optional(),
  topK: z.coerce.number().int().min(1).max(10).default(5),
  useMemory: z.boolean().default(true),
  useSkills: z.boolean().default(true),
  useRag: z.boolean().default(true),
  useAgent: z.boolean().optional(),
  includeReferences: z.boolean().default(true)
})

const BASE_SYSTEM_PROMPT = `Kamu adalah Literasiku AI Agent, asisten digital library dengan kemampuan RAG, PDF understanding, memory, semantic search, dan ReAct-style tool use.

Bahasa:
- Jawab dalam Bahasa Indonesia secara default.
- Jika user memakai bahasa Inggris, boleh jawab Inggris.
- Gunakan gaya jelas, edukatif, dan tidak bertele-tele.

Model behavior:
- Jika mode fast, jawab cepat dan langsung.
- Jika mode thinking, analisis lebih mendalam tetapi jangan tampilkan chain-of-thought internal.
- Jika mode auto, sesuaikan kedalaman jawaban dengan kompleksitas pertanyaan.

RAG policy:
- Gunakan konteks Pinecone jika relevan.
- Jika konteks tidak cukup, katakan data library belum cukup.
- Jangan mengarang isi buku, PDF, halaman, judul, penulis, atau sumber.
- Jika jawaban berdasarkan konteks, sebutkan "berdasarkan data library".
- Jika konteks bertentangan, jelaskan ketidakpastian.

PDF policy:
- Gunakan metadata PDF seperti title, fileName, page, chunkIndex jika tersedia.
- Jangan mengarang nomor halaman.
- Jika PDF belum di-index, katakan PDF belum tersedia di knowledge base.

Memory policy:
- Gunakan memory hanya sebagai personalisasi.
- Memory tidak boleh mengalahkan dokumen.
- Jangan menyimpan data sensitif tanpa izin eksplisit.
- Jangan mengklaim mengingat sesuatu jika tidak ada memory context.

Skills policy:
- Ikuti skill yang dimuat dari lib/ai/skills.
- Skill hanya membantu cara menjawab, bukan sumber fakta.
- Fakta utama harus tetap berasal dari user input, RAG context, atau memory yang valid.

ReAct policy:
- Gunakan pola Reason-Act-Observe secara internal.
- Jangan tampilkan chain-of-thought.
- Tampilkan hanya jawaban final.
- Jika perlu, tampilkan langkah ringkas yang aman.

Semantic policy:
- Gunakan semantic route untuk menentukan apakah pertanyaan adalah general chat, RAG, PDF, memory, summarization, quiz, recommendation, atau reasoning.
- Jika ragu, jawab dengan fallback general assistant dan minta data tambahan secara singkat.

REFERENCE AND CITATION POLICY:
Kamu menerima konteks RAG dengan ID sumber seperti [S1], [S2], [S3].
Gunakan citation marker inline dengan format ⟦S1⟧ setelah klaim yang berasal dari sumber tersebut.
Setiap klaim faktual dari dokumen harus punya citation.
Jangan membuat citation marker yang tidak tersedia dalam konteks.
Jangan mengutip sumber yang tidak mendukung klaim.
Jika tidak ada konteks yang mendukung, jawab bahwa data library belum cukup.
Jangan mengarang halaman, judul, atau sumber.
Gunakan maksimal 2 citation marker per paragraf agar jawaban tetap rapi.
Jika beberapa sumber mendukung klaim yang sama, gunakan citation seperti ⟦S1⟧ ⟦S3⟧.
Citation harus berada dekat dengan kalimat yang didukung, bukan hanya di akhir jawaban.
Jangan menampilkan raw chunk penuh di jawaban utama.
Raw chunk hanya boleh muncul di hover reference card.`

export default defineEventHandler(async (event) => {
  const parsed = bodySchema.safeParse(await readBody(event))

  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: parsed.error.issues[0]?.message ?? 'Request chat tidak valid.' })
  }

  const body = parsed.data
  const messages = body.messages as UIMessage[]
  const query = messages.toReversed().find(message => message.role === 'user')?.parts
    .filter(part => part.type === 'text')
    .map(part => part.text)
    .join('\n')
    .trim() ?? ''

  if (!query) throw createError({ statusCode: 400, statusMessage: 'Prompt user tidak boleh kosong.' })
  if (query.length > 2_000) throw createError({ statusCode: 400, statusMessage: 'Prompt user terlalu panjang.' })

  const route = semanticRoute(query)
  const useRag = body.useRag && route.useRag
  const useMemory = body.useMemory && (route.useMemory || body.useMemory)
  const useAgent = body.useAgent ?? route.useAgent
  const selected = selectChatModel({
    mode: body.mode,
    prompt: query,
    routeRecommendedMode: route.recommendedModelMode,
    useAgent
  })
  const modelMode = resolveModelMode({
    mode: body.mode,
    prompt: query,
    routeRecommendedMode: route.recommendedModelMode,
    useAgent
  })
  const skillIds = body.useSkills ? selectSkillIds(query, route.skills) : []
  const skillPrompt = body.useSkills ? await buildSkillsSystemPrompt(query, route.skills) : 'Tidak ada skill tambahan yang dimuat.'

  let references = [] as ReturnType<typeof buildRagReferences>
  let referenceContext = 'Tidak ada konteks RAG karena RAG tidak aktif atau belum ada hasil relevan.'

  if (useRag) {
    try {
      const matches = route.route === 'pdf_rag'
        ? await retrievePdfContext({ query, topK: body.topK, sourceId: body.sourceId })
        : await retrieveContextFromPinecone({ query, topK: body.topK, sourceId: body.sourceId })
      references = body.includeReferences ? buildRagReferences(matches) : []
      referenceContext = buildReferenceContextBlock(references)
    } catch (error) {
      console.error('RAG context gagal, chat lanjut tanpa data library:', error)
      referenceContext = 'Data library belum bisa diakses saat ini. Jawab secara umum jika memungkinkan dan jelaskan bahwa jawaban bukan dari data library.'
    }
  }

  let memoryContext = 'Memory tidak aktif atau tidak ada memory relevan.'
  let memoryItems: unknown[] = []

  if (useMemory) {
    try {
      const memoryMatches = await searchMemory({ query, userId: body.userId ?? body.sessionId, topK: 3 })
      memoryContext = buildMemoryContext(memoryMatches)
      memoryItems = sanitizeMemoryForClient(memoryMatches)
    } catch (error) {
      console.error('Memory retrieval gagal:', error)
    }
  }

  const agent = useAgent ? runAgent({ prompt: query, route, useMemory, useRag, useSkills: body.useSkills }) : undefined
  const system = [
    BASE_SYSTEM_PROMPT,
    `Active model mode: ${modelMode}`,
    `Semantic route: ${route.route} (${route.confidence})`,
    `Selected skills: ${skillIds.join(', ') || '-'}`,
    `Skill instructions:\n${skillPrompt}`,
    `Memory Context:\n${memoryContext}`,
    `RAG Reference Context:\n${referenceContext}`,
    agent ? `Agent safe steps:\n${agent.safeSummary}` : 'Agent tidak aktif untuk request ini.'
  ].join('\n\n')

  const stream = createUIMessageStream<UIMessage>({
    originalMessages: messages,
    async execute({ writer }) {
      writer.write({
        type: 'data-route',
        data: {
          type: 'route',
          route: route.route,
          modelMode,
          skills: skillIds,
          needsReferences: route.needsReferences
        }
      })
      writer.write({
        type: 'data-references',
        data: {
          type: 'references',
          references: references.map(sanitizeReferenceForClient)
        }
      })
      writer.write({
        type: 'data-memory',
        data: {
          type: 'memory',
          items: memoryItems
        }
      })

      const result = streamText({
        model: selected.model,
        system,
        messages: await convertToModelMessages(messages)
      })

      writer.merge(result.toUIMessageStream())
    },
    onError(error) {
      console.error('AI stream error:', error)
      return 'AI stream gagal diproses.'
    }
  })

  return createUIMessageStreamResponse({ stream })
})
