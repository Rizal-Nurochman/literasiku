export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@vueuse/motion/nuxt'
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
    flazBaseUrl: process.env.FLAZ_BASE_URL || 'https://ai.flaz.id/v1',
    flazApiKey: process.env.FLAZ_API_KEY || 'sk-7Qf_mQbY3ZAyxhBuckTSHA',
    llmModel: process.env.LLM_MODEL || 'MiniMax-M2.7-highspeed',
    pineconeApiKey: '',
    pineconeIndexName: 'literasiku',
    pineconeNamespace: 'default',
    pineconeMemoryNamespace: 'memory',
    memoryEnabled: 'true',
    ragMinScore: '0.3',
    ragMaxReferences: '8',
    goInternalApiKey: process.env.NUXT_GO_INTERNAL_API_KEY,
    public: {
      goApiBaseUrl: process.env.NUXT_GO_API_BASE_URL || 'http://localhost:8080',
    }
  },

  ssr: true,
  
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
