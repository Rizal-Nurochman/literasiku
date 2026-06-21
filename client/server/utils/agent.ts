import type { semanticRoute } from './semantic'

export type AgentInput = {
  prompt: string
  route: ReturnType<typeof semanticRoute>
  useMemory: boolean
  useRag: boolean
  useSkills: boolean
}

export type AgentStep = {
  tool: 'retrieveLibraryContext' | 'retrievePdfContext' | 'retrieveMemoryContext' | 'semanticSearch' | 'summarizeContext' | 'selectSkills' | 'chooseModel'
  reason: string
}

export function planAgentSteps(input: AgentInput) {
  const steps: AgentStep[] = []

  steps.push({ tool: 'chooseModel', reason: 'Memilih model berdasarkan mode dan semantic route.' })
  if (input.useSkills) steps.push({ tool: 'selectSkills', reason: 'Memilih skill yang sesuai intent.' })
  if (input.useMemory) steps.push({ tool: 'retrieveMemoryContext', reason: 'Mencari memory relevan untuk personalisasi.' })
  if (input.useRag && input.route.route === 'pdf_rag') steps.push({ tool: 'retrievePdfContext', reason: 'Mencari konteks PDF relevan.' })
  else if (input.useRag) steps.push({ tool: 'retrieveLibraryContext', reason: 'Mencari konteks library relevan.' })
  if (input.route.useAgent) steps.push({ tool: 'summarizeContext', reason: 'Menyusun konteks menjadi jawaban final.' })

  return steps.slice(0, 5)
}

export function executeAgentStep(step: AgentStep) {
  return {
    tool: step.tool,
    observation: step.reason
  }
}

export function buildFinalAnswer(input: { steps: AgentStep[] }) {
  return input.steps.map(step => `- ${step.reason}`).join('\n')
}

export function runAgent(input: AgentInput) {
  const steps = planAgentSteps(input)
  const observations = steps.map(executeAgentStep)

  return {
    steps,
    observations,
    safeSummary: buildFinalAnswer({ steps })
  }
}
