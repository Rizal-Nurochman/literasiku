import { createDeepSeek } from '@ai-sdk/deepseek'

type ModelMode = 'fast' | 'thinking' | 'auto'

type SelectChatModelInput = {
  mode?: ModelMode
  prompt?: string
  routeRecommendedMode?: 'fast' | 'thinking'
  useAgent?: boolean
}

let providerKey: string | undefined
let provider: ReturnType<typeof createDeepSeek> | undefined

export function getDeepSeekProvider() {
  const config = useRuntimeConfig()

  if (!config.deepseekApiKey) {
    throw createError({
      statusCode: 500,
      statusMessage: 'DeepSeek API key belum dikonfigurasi.'
    })
  }

  if (!provider || providerKey !== config.deepseekApiKey) {
    provider = createDeepSeek({ apiKey: config.deepseekApiKey })
    providerKey = config.deepseekApiKey
  }

  return provider
}

export function getFastModel() {
  const config = useRuntimeConfig()

  return getDeepSeekProvider().chat(config.deepseekFastModel || 'deepseek-v4-flash')
}

export function getThinkingModel() {
  const config = useRuntimeConfig()

  return getDeepSeekProvider().chat(config.deepseekThinkingModel || 'deepseek-v4-pro')
}

export function resolveModelMode(input: SelectChatModelInput = {}) {
  const config = useRuntimeConfig()
  const requestedMode = input.mode ?? (config.aiDefaultMode as ModelMode | undefined) ?? 'fast'

  if (requestedMode === 'fast') return 'fast'
  if (requestedMode === 'thinking') return 'thinking'
  if (input.useAgent) return 'thinking'
  if (input.routeRecommendedMode) return input.routeRecommendedMode

  const prompt = input.prompt?.toLowerCase() ?? ''
  const thinkingTriggers = [
    'analisis',
    'rancang',
    'debug',
    'evaluasi',
    'strategi',
    'kenapa',
    'bandingkan',
    'full reasoning',
    'dokumen panjang',
    'pikirkan matang',
    'planning',
    'multi-step'
  ]

  return thinkingTriggers.some(trigger => prompt.includes(trigger)) ? 'thinking' : 'fast'
}

export function selectChatModel(input: SelectChatModelInput = {}) {
  const mode = resolveModelMode(input)

  return {
    mode,
    model: mode === 'thinking' ? getThinkingModel() : getFastModel()
  }
}
