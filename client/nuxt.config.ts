export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  colorMode: {
    preference: 'light',
    fallback: 'light',
    classSuffix: ''
  },

  ui: {
    theme: {
      colors: [
        'primary',
        'secondary',
        'success',
        'info',
        'warning',
        'error',
        'neutral'
      ],
      defaultVariants: {
        color: 'primary',
        size: 'md'
      }
    }
  },

  runtimeConfig: {
    deepseekApiKey: '',
    deepseekFastModel: 'deepseek-v4-flash',
    deepseekThinkingModel: 'deepseek-v4-pro',
    aiDefaultMode: 'fast',
    aiGatewayApiKey: '',
    aiEmbeddingModel: 'openai/text-embedding-3-small',
    pineconeApiKey: '',
    pineconeIndexName: 'literasiku',
    pineconeNamespace: 'default',
    pineconeMemoryNamespace: 'memory',
    memoryEnabled: 'true',
    ragMinScore: '0.3',
    ragMaxReferences: '8',
    goApiBaseUrl: '',
    goInternalApiKey: ''
  },

  routeRules: {
    '/': { prerender: false }
  },

  compatibilityDate: '2025-01-15',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
