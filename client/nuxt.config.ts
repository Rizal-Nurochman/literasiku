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
    pineconeApiKey: '',
    pineconeIndexName: 'literasiku',
    pineconeNamespace: 'default',
    ragMinScore: '0.3',
    ragMaxReferences: '8',
    goApiBaseUrl: process.env.NUXT_GO_API_BASE_URL || 'http://localhost:8080',
    goInternalApiKey: process.env.NUXT_GO_INTERNAL_API_KEY,
    flazApiKey: process.env.FLAZ_API_KEY || '',
    flazBaseUrl: process.env.FLAZ_BASE_URL || 'https://ai.flaz.id/v1',
    llmModel: process.env.LLM_MODEL || 'MiniMax-M2.7-highspeed',
    huggingfaceApiKey: process.env.HUGGINGFACE_API_KEY || ''
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
