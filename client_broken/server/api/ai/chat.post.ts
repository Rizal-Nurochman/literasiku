import { pipeline, env } from '@xenova/transformers';
import { Pinecone } from '@pinecone-database/pinecone';
import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

env.allowLocalModels = true;
env.useBrowserCache = false;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { bookId, query, history = [] } = body;

  if (!bookId || !query) {
    throw createError({ statusCode: 400, statusMessage: 'bookId and query are required' });
  }

  const config = useRuntimeConfig();

  try {
    // 1. Embed query using Xenova Transformers locally
    const extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
       quantized: true,
    });
    const output = await extractor(query, { pooling: 'mean', normalize: true });
    // Make sure we convert the Float32Array to standard JS Array for Pinecone
    const queryEmbedding = Array.from(output.data);

    // 2. Search Pinecone
    const pinecone = new Pinecone({ apiKey: config.pineconeApiKey });
    const index = pinecone.index(config.pineconeIndexName);
    const searchResponse = await index.namespace(config.pineconeNamespace).query({
      vector: queryEmbedding,
      topK: parseInt(config.ragMaxReferences) || 5,
      filter: { bookId: { $eq: bookId } },
      includeMetadata: true,
    });

    const minScore = parseFloat(config.ragMinScore) || 0.3;
    const contextMatches = searchResponse.matches.filter((m) => m.score !== undefined && m.score >= minScore);
    
    const contextTexts = contextMatches.map((m) => m.metadata?.text).join('\n\n---\n\n');

    if (!contextTexts) {
      return {
        status: true,
        data: {
          answer: 'Maaf, saya tidak menemukan informasi yang relevan di buku ini untuk menjawab pertanyaan Anda.',
          contextUsed: [],
        }
      };
    }

    // 3. Generate response with Langchain & Flaz.id OpenAI wrapper
    const llm = new ChatOpenAI({
      openAIApiKey: config.flazApiKey,
      modelName: config.llmModel,
      configuration: {
        baseURL: config.flazBaseUrl,
      },
    });

    const prompt = PromptTemplate.fromTemplate(`
Anda adalah asisten AI perpustakaan cerdas yang bertugas membantu anggota memahami isi buku.
Gunakan konteks buku berikut untuk menjawab pertanyaan pengguna.
Jawablah menggunakan bahasa Indonesia yang baik, mudah dipahami, dan relevan. Jangan halusinasi.

Konteks Buku:
{context}

Histori Chat:
{history}

Pertanyaan: {query}
Jawaban:
`);

    const formattedHistory = history.map((h: any) => `${h.role === 'user' ? 'User' : 'AI'}: ${h.content}`).join('\n');

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    
    const answer = await chain.invoke({
      context: contextTexts,
      history: formattedHistory,
      query: query,
    });

    return {
      status: true,
      message: 'Berhasil mendapatkan jawaban AI',
      data: {
        answer,
        contextUsed: contextMatches.map(m => m.metadata?.text),
      },
    };

  } catch (error: any) {
    console.error('Chat error:', error);
    throw createError({ statusCode: 500, statusMessage: error.message });
  }
});
