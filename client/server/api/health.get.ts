export default defineEventHandler(() => {
  const config = useRuntimeConfig()

  return {
    ok: true,
    service: 'literasiku-ai',
    deepseekConfigured: Boolean(config.deepseekApiKey),
    embeddingConfigured: Boolean(config.aiGatewayApiKey && config.aiEmbeddingModel),
    pineconeConfigured: Boolean(config.pineconeApiKey && config.pineconeIndexName),
    memoryEnabled: String(config.memoryEnabled ?? 'true') !== 'false',
    sseSupported: true
  }
})
