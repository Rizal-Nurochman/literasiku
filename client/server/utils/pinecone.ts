import { Pinecone } from '@pinecone-database/pinecone'

type PineconeMetadataValue = string | number | boolean | string[]

export type KnowledgeVectorMetadata = Record<string, PineconeMetadataValue> & {
  sourceId: string
  content: string
}

export type KnowledgeVectorInput = {
  id: string
  values: number[]
  metadata: KnowledgeVectorMetadata
}

export type QueryKnowledgeVectorInput = {
  vector: number[]
  topK?: number
  filter?: Record<string, unknown>
  namespace?: string
}

export type KnowledgeVectorMatch = {
  id: string
  score?: number
  metadata?: KnowledgeVectorMetadata
}

let pineconeClient: Pinecone | undefined
let pineconeClientKey: string | undefined

function ensurePineconeConfig() {
  const config = useRuntimeConfig()

  if (!config.pineconeApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Pinecone API key belum dikonfigurasi.'
    })
  }

  if (!config.pineconeIndexName) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Pinecone index name belum dikonfigurasi.'
    })
  }

  return config
}

function toSafePineconeError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error)

  if (/not found|404|host|index/i.test(message)) {
    return createError({
      statusCode: 500,
      statusMessage: 'Pinecone index belum dibuat atau nama index salah.'
    })
  }

  return createError({
    statusCode: 500,
    statusMessage: 'Operasi Pinecone gagal.'
  })
}

export function getPineconeClient() {
  const config = ensurePineconeConfig()

  if (!pineconeClient || pineconeClientKey !== config.pineconeApiKey) {
    pineconeClient = new Pinecone({ apiKey: config.pineconeApiKey })
    pineconeClientKey = config.pineconeApiKey
  }

  return pineconeClient
}

export function getPineconeIndex() {
  const config = ensurePineconeConfig()

  return getPineconeClient().index(config.pineconeIndexName)
}

export function getPineconeNamespace() {
  const config = useRuntimeConfig()

  return config.pineconeNamespace || 'default'
}

export function getPineconeMemoryNamespace() {
  const config = useRuntimeConfig()

  return config.pineconeMemoryNamespace || 'memory'
}

export async function upsertKnowledgeVectors(input: KnowledgeVectorInput[], namespace = getPineconeNamespace()) {
  if (!input.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Tidak ada vector untuk disimpan.'
    })
  }

  try {
    await getPineconeIndex().namespace(namespace).upsert({
      records: input.map(record => ({
        id: record.id,
        values: record.values,
        metadata: record.metadata as Record<string, PineconeMetadataValue>
      }))
    })

    return { namespace, count: input.length }
  } catch (error) {
    console.error('Pinecone upsert gagal:', error)
    throw toSafePineconeError(error)
  }
}

export async function queryKnowledgeVectors(input: QueryKnowledgeVectorInput) {
  if (!input.vector.length) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Vector query tidak boleh kosong.'
    })
  }

  try {
    const result = await getPineconeIndex().namespace(input.namespace ?? getPineconeNamespace()).query({
      vector: input.vector,
      topK: input.topK ?? 5,
      includeMetadata: true,
      includeValues: false,
      filter: input.filter
    })

    return (result.matches ?? []).map(match => ({
      id: match.id,
      score: match.score,
      metadata: match.metadata as KnowledgeVectorMetadata | undefined
    })) satisfies KnowledgeVectorMatch[]
  } catch (error) {
    console.error('Pinecone query gagal:', error)
    throw toSafePineconeError(error)
  }
}
