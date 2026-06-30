import { Pinecone } from '@pinecone-database/pinecone'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { throwError } from '~~/server/utils/apiCall'

async function getCloudEmbeddings(inputs: string | string[], hfToken: string) {
  const url = 'https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2'
  try {
    const res = await $fetch<any>(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${hfToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ inputs })
    })
    return res
  } catch (err: any) {
    throw new Error(`Gagal memanggil Hugging Face Cloud Inference API: ${err.message}`)
  }
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.bookId || !body.query) {
    throwError({
      statusCode: 400,
      statusMessage: 'bookId and query are required'
    })
  }

  const config = useRuntimeConfig(event)

  const embedding = await getCloudEmbeddings(body.query, config.huggingfaceApiKey)

  const pinecone = new Pinecone({
    apiKey: config.pineconeApiKey
  })

  const index = pinecone.index(config.pineconeIndexName)

  const result = await index
    .namespace(config.pineconeNamespace)
    .query({
      vector: Array.from(embedding),
      topK: Number(config.ragMaxReferences ?? 5),
      filter: {
        bookId: {
          $eq: body.bookId
        }
      },
      includeMetadata: true
    })

  const matches = result.matches.filter(
    (m) =>
      m.score !== undefined &&
      m.score >= Number(config.ragMinScore ?? 0.3)
  )

  if (!matches.length) {
    return {
      status: true,
      data: {
        answer:
          'Maaf, saya tidak menemukan informasi yang relevan di buku ini untuk menjawab pertanyaan Anda.',
        contextUsed: []
      }
    }
  }

  const context = matches
    .map((m) => String(m.metadata?.text ?? ''))
    .join('\n\n---\n\n')

  const history = (body.history ?? [])
    .map(
      (item: any) =>
        `${item.role === 'user' ? 'User' : 'AI'}: ${item.content}`
    )
    .join('\n')

  const llm = new ChatOpenAI({
    apiKey: String(config.flazApiKey),
    model: String(config.llmModel),
    configuration: {
      baseURL: String(config.flazBaseUrl)
    }
  })

  const prompt = PromptTemplate.fromTemplate(`
Anda adalah asisten AI perpustakaan cerdas yang membantu anggota memahami isi buku.

Gunakan hanya informasi dari konteks.

Jika jawaban tidak ditemukan, katakan bahwa informasi tidak tersedia.

Konteks:
{context}

Riwayat:
{history}

Pertanyaan:
{query}

Jawaban:
`)

  const chain = prompt
    .pipe(llm)
    .pipe(new StringOutputParser())

  const answer = await chain.invoke({
    context,
    history,
    query: body.query
  })

  return {
    status: true,
    message: 'Berhasil mendapatkan jawaban AI',
    data: {
      answer,
      contextUsed: matches.map((m) => m.metadata?.text)
    }
  }
})