import { pipeline, env } from '@xenova/transformers';
import { Pinecone } from '@pinecone-database/pinecone';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import pdf from 'pdf-parse';

// Setup Transformers.js env
env.allowLocalModels = true;
env.useBrowserCache = false;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { bookId, pdfUrl } = body;

  if (!bookId || !pdfUrl) {
    throw createError({ statusCode: 400, statusMessage: 'bookId and pdfUrl are required' });
  }

  const config = useRuntimeConfig();

  try {
    // 1. Download PDF
    const response = await fetch(pdfUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Parse PDF
    const data = await pdf(buffer);
    const text = data.text;

    // 3. Chunk text
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    const chunks = await splitter.createDocuments([text]);

    // 4. Load Xenova embedding model (all-MiniLM-L6-v2)
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
       quantized: true,
    });

    // 5. Embed and prepare for Pinecone
    const pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
    const index = pinecone.index(config.pineconeIndexName);
    
    const vectors = [];
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      // Generate embedding
      const output = await extractor(chunk.pageContent, { pooling: 'mean', normalize: true });
      const embedding = Array.from(output.data);

      vectors.push({
        id: `book-${bookId}-chunk-${i}`,
        values: embedding,
        metadata: {
          bookId,
          text: chunk.pageContent,
        },
      });
    }

    // Upsert to Pinecone
    // Note: Pinecone has a limit on payload size, batching might be required for huge books.
    // For MVP, we will chunk by 100 vectors per batch
    const batchSize = 100;
    const namespace = index.namespace(config.pineconeNamespace);
    for (let i = 0; i < vectors.length; i += batchSize) {
      const batch = vectors.slice(i, i + batchSize);
      await namespace.upsert(batch);
    }

    return {
      status: true,
      message: 'Book embedded successfully',
      data: {
        bookId,
        chunksProcessed: chunks.length,
      },
    };
  } catch (error: any) {
    console.error('Embedding error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
