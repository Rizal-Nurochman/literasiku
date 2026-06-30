import { Pinecone } from '@pinecone-database/pinecone'
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters'
import { PDFParse } from 'pdf-parse'
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

  if (!body.bookId || !body.fileUrl) {
    throwError({
      statusCode: 400,
      statusMessage: 'bookId and fileUrl are required'
    })
  }

  const config = useRuntimeConfig(event)
  const pineconeApiKey = config.pineconeApiKey
  const pineconeIndexName = config.pineconeIndexName
  const hfToken = config.huggingfaceApiKey
  
  if (!pineconeApiKey || !pineconeIndexName || !hfToken) {
    throwError({
      statusCode: 500,
      statusMessage: 'Pinecone or Hugging Face configuration is missing'
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
      
      const pinecone = new Pinecone({ apiKey: pineconeApiKey })
      const index = pinecone.index(pineconeIndexName).namespace(config.pineconeNamespace || 'default')
      
      console.log(`[AI Embed] Embedding & Uploading to Pinecone via Hugging Face Cloud...`)
      
      const batchSize = 25
      for (let i = 0; i < chunks.length; i += batchSize) {
        const batch = chunks.slice(i, i + batchSize)
        const texts = batch.map(chunk => chunk.pageContent)
        
        const embeddings = await getCloudEmbeddings(texts, hfToken)
        
        const vectors = batch.map((chunk, chunkIdx) => {
          return {
            id: `book-${body.bookId}-chunk-${i + chunkIdx}`,
            values: embeddings[chunkIdx],
            metadata: {
              bookId: body.bookId,
              text: chunk.pageContent
            }
          }
        })
        
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