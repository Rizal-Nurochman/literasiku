type SSEHandler = (helpers: {
  send: (event: string, data: unknown) => void
  close: () => void
  signal: AbortSignal
}) => Promise<void> | void

export function createSSEEncoder() {
  return new TextEncoder()
}

export function formatSSE(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`
}

export function createSSEStream(handler: SSEHandler) {
  const encoder = createSSEEncoder()
  const abortController = new AbortController()

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(formatSSE(event, data)))
      }

      const close = () => {
        if (!abortController.signal.aborted) abortController.abort()
        try {
          controller.close()
        } catch {
          // Stream may already be closed by the client.
        }
      }

      try {
        await handler({ send, close, signal: abortController.signal })
      } catch (error) {
        console.error('SSE stream error:', error)
        send('error', { message: 'Stream SSE gagal diproses.' })
      } finally {
        close()
      }
    },
    cancel() {
      abortController.abort()
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no'
    }
  })
}
