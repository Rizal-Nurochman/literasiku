import { pipeline, env, type FeatureExtractionPipeline } from '@huggingface/transformers'
import { Pinecone } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { PDFParse } from 'pdf-parse'
import { throwError } from '~~/server/utils/apiCall'

env.allowLocalModels = true
env.useBrowserCache = false

let extractor: FeatureExtractionPipeline | null = null

async function getExtractor() {
  if (!extractor) {
    extractor = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2',
      {
        dtype: 'q8'
      }
    )
  }

  return extractor
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  if (!body.bookId || !body.fileUrl) {
    throwError({
      statusCode: 400,
      statusMessage: 'bookId and fileUrl are required'
    })
  }

  const config = useRuntimeConfig(event)
  const pineconeApiKey = config.pineconeApiKey
  const pineconeIndexName = config.pineconeIndexName
  
  if (!pineconeApiKey || !pineconeIndexName) {
    throwError({
      statusCode: 500,
      statusMessage: 'Pinecone configuration is missing'
    })
  }
  
  (async () => {
    try {
      console.log(`[AI Embed] Starting background embedding for Book ID: ${body.bookId}, URL: ${body.fileUrl}`)
      
      const pdfResponse = await fetch(body.fileUrl)
      if (!pdfResponse.ok) {
        throw new Error(`Failed to download PDF from ${body.fileUrl}: ${pdfResponse.statusText}`)
      }
      
      const arrayBuffer = await pdfResponse.arrayBuffer()
      const buffer = Buffer.from(arrayBuffer)
      
      console.log(`[AI Embed] Parsing PDF...`)
      
      const parser = new PDFParse({ data: buffer })
      const pdfData = await parser.getText()
      const text = pdfData.text || ''
      
      await parser.destroy()
      
      if (!text.trim()) {
        throw new Error('No text found in PDF')
      }

      console.log(`[AI Embed] Chunking text...`)
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      })
      
      const chunks = await splitter.createDocuments([text])
      console.log(`[AI Embed] Created ${chunks.length} chunks.`)
      
      const model = await getExtractor()
      const pinecone = new Pinecone({ apiKey: pineconeApiKey })
      const index = pinecone.index(pineconeIndexName).namespace(config.pineconeNamespace || 'default')
      
      console.log(`[AI Embed] Embedding & Uploading to Pinecone...`)
      
      const batchSize = 50
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        
        const vectors = await Promise.all(batch.map(async (chunk, chunkIdx) => {
          const content = chunk.pageContent
          const embedding = await model(content, {
            pooling: 'mean',
            normalize: true
          })
          
          return {
            id: `book-${body.bookId}-chunk-${i + chunkIdx}`,
            values: Array.from(embedding.data),
            metadata: {
              bookId: body.bookId,
              text: content
            }
          }
        }))
        
        await index.upsert({ records: vectors })
        console.log(`[AI Embed] Upserted batch ${i / batchSize + 1} / ${Math.ceil(chunks.length / batchSize)}`)
      }
      
      console.log(`[AI Embed] Successfully completed embedding for Book ID: ${body.bookId}`)
    } catch (err: any) {
      console.error(`[AI Embed] Background embedding failed for Book ID: ${body.bookId}:`, err)
    }
  })()

  return {
    status: true,
    message: 'Background embedding process started successfully',
    data: {
      bookId: body.bookId
    }
  }
})