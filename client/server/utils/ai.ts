import { createGateway } from '@ai-sdk/gateway'
import { embed, embedMany } from 'ai'

function getGateway() {
  const apiKey = ensureAiGatewayKey()

  return createGateway({ apiKey })
}

export function ensureAiGatewayKey() {
  const config = useRuntimeConfig()

  if (!config.aiGatewayApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'AI Gateway API key belum dikonfigurasi.'
    })
  }

  return config.aiGatewayApiKey
}

export function getChatModel() {
  const config = useRuntimeConfig()

  return getGateway().chat(String(config.aiChatModel || 'anthropic/claude-sonnet-4.5'))
}

export function getEmbeddingModel() {
  const config = useRuntimeConfig()

  return getGateway().textEmbeddingModel(String(config.aiEmbeddingModel || 'openai/text-embedding-3-small'))
}

export async function createTextEmbedding(value: string) {
  const input = value.trim()

  if (!input) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Teks untuk embedding tidak boleh kosong.'
    })
  }

  try {
    const result = await embed({
      model: getEmbeddingModel(),
      value: input
    })

    return {
      embedding: result.embedding,
      usage: result.usage
    }
  } catch (error) {
    console.error('Embedding gagal:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal membuat embedding.'
    })
  }
}

export async function createTextEmbeddings(values: string[]) {
  const inputs = values.map(value => value.trim()).filter(Boolean)

  if (!inputs.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Daftar teks untuk embedding tidak boleh kosong.'
    })
  }

  try {
    const result = await embedMany({
      model: getEmbeddingModel(),
      values: inputs
    })

    return {
      embeddings: result.embeddings,
      usage: result.usage
    }
  } catch (error) {
    console.error('Batch embedding gagal:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Gagal membuat batch embedding.'
    })
  }
}
