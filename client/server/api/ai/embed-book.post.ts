import { pipeline, env } from '@huggingface/transformers'
import { Pinecone } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { PDFParse } from 'pdf-parse'

env.allowLocalModels = true
env.useBrowserCache = false

export default defineEventHandler(async (event) => {
  const { bookId, pdfUrl } = await readBody(event)
  const config = useRuntimeConfig(event)

  if (!bookId || !pdfUrl) {
    throw createError({
      statusCode: 400,
      statusMessage: 'bookId and pdfUrl are required'
    })
  }

  const response = await fetch(pdfUrl)

  if (!response.ok) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Failed to download PDF'
    })
  }

  const buffer = Buffer.from(await response.arrayBuffer())
  const parser = new PDFParse({ data: buffer })
  const parsed = await parser.getText()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200
  })

  const chunks = await splitter.createDocuments([parsed.text])

  const extractor = await pipeline(
    'feature-extraction',
    'Xenova/all-MiniLM-L6-v2',
    {
      dtype: 'q8'
    }
  )

  const pinecone = new Pinecone({
    apiKey: config.pineconeApiKey
  })

  const namespace = pinecone
    .index(config.pineconeIndexName)
    .namespace(config.pineconeNamespace)

  const vectors = await Promise.all(
    chunks.map(async (chunk, index) => {
      const output = await extractor(chunk.pageContent, {
        pooling: 'mean',
        normalize: true
      })

      return {
        id: `book-${bookId}-chunk-${index}`,
        values: Array.from(output.data),
        metadata: {
          bookId,
          text: chunk.pageContent
        }
      }
    })
  )

  const batchSize = 100

  for (let i = 0; i < vectors.length; i += batchSize) {
    await namespace.upsert({ records: vectors.slice(i, i + batchSize) })
  }

  return {
    status: true,
    message: 'Book embedded successfully',
    data: {
      bookId,
      chunksProcessed: chunks.length
    }
  }
})