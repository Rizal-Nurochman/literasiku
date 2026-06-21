export type RagReference = {
  referenceId: string
  sourceId: string
  documentId?: string
  title?: string
  fileName?: string
  mimeType?: string
  page?: number
  chunkIndex?: number
  score?: number
  quote: string
  preview: string
  content: string
  metadata?: Record<string, unknown>
}

export type RagReferenceMap = Record<string, RagReference>

export type SafeRagReference = Omit<RagReference, 'content' | 'metadata'>

export type AIStreamReferenceEvent = {
  type: 'references'
  references: SafeRagReference[]
}

export type AIStreamRouteEvent = {
  type: 'route'
  route: string
  modelMode: 'fast' | 'thinking' | 'auto'
  skills: string[]
  needsReferences: boolean
}

export type AIStreamDeltaEvent = {
  type: 'delta'
  text: string
}

export type AIStreamDoneEvent = {
  type: 'done'
  usedReferences: string[]
}
