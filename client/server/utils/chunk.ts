type ChunkOptions = {
  chunkSize?: number
  overlap?: number
}

export function splitTextIntoChunks(text: string, options: ChunkOptions = {}) {
  const chunkSize = Math.max(options.chunkSize ?? 1000, 200)
  const overlap = Math.min(Math.max(options.overlap ?? 150, 0), chunkSize - 1)
  const normalized = text.replace(/\s+/g, ' ').trim()

  if (!normalized) return []
  if (normalized.length <= chunkSize) return [normalized]

  const chunks: string[] = []
  let start = 0

  while (start < normalized.length) {
    let end = Math.min(start + chunkSize, normalized.length)

    if (end < normalized.length) {
      const nextBoundary = Math.max(
        normalized.lastIndexOf('. ', end),
        normalized.lastIndexOf('! ', end),
        normalized.lastIndexOf('? ', end),
        normalized.lastIndexOf(' ', end)
      )

      if (nextBoundary > start + Math.floor(chunkSize * 0.6)) {
        end = nextBoundary + 1
      }
    }

    const chunk = normalized.slice(start, end).trim()
    if (chunk) chunks.push(chunk)

    if (end >= normalized.length) break
    start = Math.max(end - overlap, start + 1)
  }

  return chunks
}
