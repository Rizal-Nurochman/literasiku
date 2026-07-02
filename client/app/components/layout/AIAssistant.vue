<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  reasoning?: string
  isReasoningExpanded?: boolean
  toolCalls?: Array<{ name: string; status: 'running' | 'done' }>
  isExpanded?: boolean
  isError?: boolean
}

const { useMeQuery } = useUsers()
const { data: user } = useMeQuery()

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref<ChatMessage[]>([])
const isLoading = ref(false)
const streamStarted = ref(false)

const recommendedQuestions = computed(() => {
  if (!user.value) return []
  if (user.value.role === 'ADMIN') {
    return [
      'Buka halaman manajemen buku perpustakaan',
      'Di mana saya bisa melihat laporan & statistik bulanan?',
      'Tampilkan seluruh riwayat transaksi peminjaman anggota',
      'Bagaimana cara mengelola denda yang telat bayar?'
    ]
  }
  return [
    'Bagaimana cara melihat daftar katalog buku?',
    'Di mana saya bisa melihat riwayat peminjaman buku saya?',
    'Tampilkan buku digital yang bisa langsung dibaca',
    'Saya ingin memperbarui informasi profil saya'
  ]
})

const getFriendlyToolLabel = (name: string) => {
  if (name === 'list_books') return 'Mencari koleksi katalog perpustakaan...'
  if (name === 'search_book_content') return 'Membaca & menganalisis isi buku digital (RAG)...'
  if (name === 'my_loans') return 'Mengambil riwayat transaksi peminjaman Anda...'
  if (name === 'all_loans') return 'Mengambil seluruh data peminjaman di perpustakaan...'
  if (name === 'list_members') return 'Mencari data profil anggota perpustakaan...'
  return 'Sedang memproses permintaan...'
}

/**
 * STOPGAP HEURISTIC — bukan solusi permanen.
 * Backend idealnya mengirim `type: 'reasoning'` terpisah dari `type: 'token'`.
 * Selama itu belum konsisten (tergantung apakah provider model mengekspos
 * reasoning_content), fungsi ini mencoba mendeteksi titik di mana monolog
 * internal berakhir dan jawaban resmi ke user dimulai, berdasarkan pola
 * umum: paragraf pembuka bergaya "internal monologue" (sering berbahasa
 * Inggris, menyebut "the user"/"pengguna", "I should"/"saya akan", dst),
 * diikuti baris kosong lalu sapaan/jawaban resmi.
 */
const THINKING_OPENER = /^(the user|pengguna|user is asking|i should|i need to|i'll|i will|let me|berdasarkan|saya akan)\b/i

const ANSWER_BOUNDARY_PATTERNS = [
  /\n{2,}(?=(halo|baik|selamat|tentu|berikut|silakan|oke|ok)\b)/i,
  /\n{2,}(?=\*\*)/,
]

function splitMergedContent(raw: string): { reasoning: string; content: string; stillThinking: boolean } {
  if (!raw) return { reasoning: '', content: '', stillThinking: false }

  for (const pattern of ANSWER_BOUNDARY_PATTERNS) {
    const match = raw.match(pattern)
    if (match && typeof match.index === 'number' && match.index > 0) {
      return {
        reasoning: raw.slice(0, match.index).trim(),
        content: raw.slice(match.index).trim(),
        stillThinking: false
      }
    }
  }

  if (THINKING_OPENER.test(raw.trim())) {
    return { reasoning: raw.trim(), content: '', stillThinking: true }
  }

  return { reasoning: '', content: raw, stillThinking: false }
}

function getDisplayParts(msg: ChatMessage) {
  if (msg.reasoning) {
    return { reasoning: msg.reasoning, content: msg.content, stillThinking: false }
  }
  return splitMergedContent(msg.content)
}

const resetChat = () => {
  messages.value = []
  streamStarted.value = false
  isLoading.value = false
}

watch(isOpen, (newVal) => {
  if (newVal) {
    resetChat()
  }
})

const sendMessage = async (text: string) => {
  if (!text.trim() || isLoading.value) return

  const userQuery = text.trim()
  inputMessage.value = ''
  messages.value.push({ role: 'user', content: userQuery })

  isLoading.value = true
  streamStarted.value = false

  const assistantMessage: ChatMessage = {
    role: 'assistant',
    content: '',
    reasoning: '',
    isReasoningExpanded: true,
    toolCalls: [],
    isExpanded: true,
    isError: false
  }
  messages.value.push(assistantMessage)

  try {
    const response = await fetch('/api/ai/agent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query: userQuery,
        messages: messages.value.slice(0, -2)
      })
    })

    if (!response.ok) {
      throw new Error('Gagal terhubung dengan server.')
    }

    const reader = response.body?.getReader()
    if (!reader) {
      throw new Error('Gagal memulai stream data.')
    }

    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        const cleaned = line.trim()
        if (cleaned.startsWith('data: ')) {
          try {
            const data = JSON.parse(cleaned.substring(6))
            if (data.type === 'log') {
              if (!assistantMessage.toolCalls) {
                assistantMessage.toolCalls = []
              }
              const existing = assistantMessage.toolCalls.find(t => t.name === data.tool)
              if (existing) {
                existing.status = data.status
              } else {
                assistantMessage.toolCalls.push({ name: data.tool, status: data.status })
              }
            } else if (data.type === 'reasoning') {
              if (assistantMessage.isReasoningExpanded === undefined) {
                assistantMessage.isReasoningExpanded = true
              }
              assistantMessage.reasoning = (assistantMessage.reasoning || '') + data.token
            } else if (data.type === 'token') {
              streamStarted.value = true
              assistantMessage.content += data.token

              if (assistantMessage.reasoning) {
                assistantMessage.isReasoningExpanded = false
              } else {
                const parts = splitMergedContent(assistantMessage.content)
                if (!parts.stillThinking && parts.content) {
                  assistantMessage.isReasoningExpanded = false
                }
              }
            } else if (data.type === 'done') {
              isLoading.value = false
            } else if (data.type === 'error') {
              assistantMessage.isError = true
              assistantMessage.content = data.message || 'Terjadi kesalahan sistem.'
              isLoading.value = false
            }
          } catch {}
        }
      }
    }
  } catch (err: any) {
    assistantMessage.isError = true
    assistantMessage.content = err.message || 'Koneksi gagal. Mohon pastikan Anda sudah masuk ke sistem.'
    isLoading.value = false
  }
}

const retryLastMessage = () => {
  const reversed = [...messages.value].reverse()
  const lastUserIndex = reversed.findIndex(m => m.role === 'user')
  if (lastUserIndex === -1) return

  const actualIndex = messages.value.length - 1 - lastUserIndex
  const lastUserMsg = messages.value[actualIndex]
  if (!lastUserMsg) return
  const userQuery = lastUserMsg.content

  messages.value = messages.value.slice(0, actualIndex)
  sendMessage(userQuery)
}

const toggleIsAIOpen = () => {
  isOpen.value = !isOpen.value
  resetChat()
}

const renderMarkdown = (text: string) => {
  try {
    const rawHtml = marked.parse(text)
    return DOMPurify.sanitize(String(rawHtml))
  } catch {
    return text
  }
}
</script>

<template>
  <div>
    <UButton
      v-if="user"
      class="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-xl flex items-center justify-center bg-gradient-to-tr from-primary-600 to-secondary-500 hover:from-primary-500 hover:to-secondary-400 text-white transition-all transform hover:scale-110 border-0 group"
      @click="toggleIsAIOpen"
    >
      <UIcon name="i-lucide-sparkles" class="w-6 h-6 animate-pulse group-hover:rotate-12 transition-transform duration-300" />
    </UButton>

    <USlideover
      v-model:open="isOpen"
      title="Lixi - Teman Membacamu"
      description="Tanya apa saja tentang buku, peminjaman, atau operasional perpustakaan."
    >
      <template #content>
        <div class="flex flex-col h-full bg-default/95 backdrop-blur">
          <div class="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
            <div v-if="messages.length === 0" class="space-y-6 py-6">
              <div class="text-center space-y-2">
                <div class="inline-flex p-3 rounded-full bg-primary/10 text-primary">
                  <UIcon name="i-lucide-bot" class="w-8 h-8" />
                </div>
                <h3 class="text-md font-bold text-default">Halo, {{ user?.full_name?.split(' ')[0] }}!</h3>
                <p class="text-xs text-muted max-w-[280px] mx-auto">
                  Saya Lixi, teman membacamu. Saya siap membantumu mencari katalog buku, melacak riwayat peminjaman, dan denda.
                </p>
              </div>

              <div class="space-y-2">
                <p class="text-xs font-semibold text-muted tracking-wider uppercase px-1">Rekomendasi Pertanyaan</p>
                <div class="grid grid-cols-1 gap-2">
                  <button
                    v-for="(q, idx) in recommendedQuestions"
                    :key="idx"
                    class="text-left text-xs p-3 rounded-lg border border-default bg-default-100 hover:bg-primary/5 hover:border-primary/30 transition-all text-default font-medium flex items-center justify-between group"
                    @click="sendMessage(q)"
                  >
                    <span>{{ q }}</span>
                    <UIcon name="i-lucide-arrow-right" class="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </button>
                </div>
              </div>
            </div>

            <div v-for="(msg, index) in messages" :key="index" class="flex flex-col gap-2">
              <div
                v-if="msg.role === 'user'"
                class="flex gap-2.5 max-w-[90%] ml-auto flex-row-reverse"
              >
                <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-primary text-white">
                  <UIcon name="i-lucide-user" class="w-4 h-4" />
                </div>
                <div class="rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed bg-primary text-white rounded-tr-none">
                  {{ msg.content }}
                </div>
              </div>

              <div
                v-else
                class="flex flex-col gap-2 max-w-[90%] mr-auto"
              >
                <div
                  v-if="msg.toolCalls && msg.toolCalls.length > 0"
                  class="flex gap-2.5 opacity-70 hover:opacity-100 transition-opacity duration-200"
                >
                  <div class="w-7 h-7 shrink-0 flex items-center justify-center text-xs text-muted">
                    <UIcon name="i-lucide-activity" class="w-4 h-4 text-primary/70 animate-pulse" />
                  </div>
                  <div class="border border-dashed border-default-300 bg-default-50/60 rounded-xl overflow-hidden shadow-xs flex-1 min-w-[200px]">
                    <button
                      type="button"
                      class="w-full flex items-center justify-between p-2 text-[10px] font-semibold text-muted hover:bg-default-100/50 transition-colors"
                      @click="msg.isExpanded = !msg.isExpanded"
                    >
                      <span class="flex items-center gap-1.5">
                        <UIcon v-if="msg.toolCalls.some(t => t.status === 'running')" name="i-lucide-loader-2" class="w-3 h-3 text-primary animate-spin" />
                        <UIcon v-else name="i-lucide-check-circle" class="w-3 h-3 text-success" />
                        Proses Berpikir Lixi ({{ msg.toolCalls.length }} langkah)
                      </span>
                      <UIcon :name="msg.isExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3 h-3 transition-transform" />
                    </button>
                    <div v-show="msg.isExpanded" class="p-2 border-t border-default-200/50 space-y-1.5 text-[9px] bg-default-100/30">
                      <div v-for="(tool, tIdx) in msg.toolCalls" :key="tIdx" class="flex items-center gap-2 text-muted-foreground">
                        <UIcon
                          :name="tool.status === 'running' ? 'i-lucide-loader-2 animate-spin text-primary' : 'i-lucide-check-circle-2 text-success'"
                          class="w-3 h-3 shrink-0"
                        />
                        <span>{{ getFriendlyToolLabel(tool.name) }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  v-if="getDisplayParts(msg).reasoning"
                  class="flex gap-2.5 opacity-60 hover:opacity-100 transition-opacity duration-200"
                >
                  <div class="w-7 h-7 shrink-0 flex items-center justify-center text-xs text-muted">
                    <UIcon name="i-lucide-brain" class="w-4 h-4 text-primary/70 animate-pulse" />
                  </div>
                  <div class="border border-dashed border-default-300 bg-default-50/50 rounded-xl overflow-hidden shadow-xs flex-1 min-w-[200px]">
                    <button
                      type="button"
                      class="w-full flex items-center justify-between p-2 text-[10px] font-semibold text-muted hover:bg-default-100/50 transition-colors"
                      @click="msg.isReasoningExpanded = !msg.isReasoningExpanded"
                    >
                      <span class="flex items-center gap-1.5">
                        <UIcon v-if="getDisplayParts(msg).stillThinking && index === messages.length - 1" name="i-lucide-loader-2" class="w-3 h-3 text-primary animate-spin" />
                        <UIcon v-else name="i-lucide-check-circle" class="w-3 h-3 text-success" />
                        Analisis Internal Lixi
                      </span>
                      <UIcon :name="msg.isReasoningExpanded ? 'i-lucide-chevron-up' : 'i-lucide-chevron-down'" class="w-3 h-3 transition-transform" />
                    </button>
                    <div v-show="msg.isReasoningExpanded" class="p-2.5 border-t border-default-200/50 text-[10px] text-muted-foreground leading-relaxed bg-default-100/30 whitespace-pre-line italic">
                      {{ getDisplayParts(msg).reasoning }}
                    </div>
                  </div>
                </div>

                <div
                  v-if="getDisplayParts(msg).content || msg.isError || (isLoading && !streamStarted && index === messages.length - 1)"
                  class="flex gap-2.5"
                >
                  <div class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold bg-default-200 text-default">
                    <UIcon name="i-lucide-bot" class="w-4 h-4" />
                  </div>
                  <div class="rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed bg-default-100 text-default border border-default rounded-tl-none markdown-content flex-1 min-w-[200px]">
                    <div v-if="msg.isError" class="mt-2">
                      <UAlert
                        color="error"
                        variant="subtle"
                        title="Gagal Memuat Respons"
                        icon="i-lucide-alert-triangle"
                        :description="msg.content"
                      >
                        <template #actions>
                          <UButton
                            size="xs"
                            color="error"
                            variant="solid"
                            label="Coba Lagi"
                            @click="retryLastMessage"
                          />
                        </template>
                      </UAlert>
                    </div>

                    <div
                      v-else-if="getDisplayParts(msg).content"
                      v-html="renderMarkdown(getDisplayParts(msg).content)"
                      :class="{ 'streaming-active': isLoading && streamStarted && index === messages.length - 1 }"
                    />

                    <div v-if="isLoading && !streamStarted && index === messages.length - 1 && !getDisplayParts(msg).reasoning" class="space-y-2 py-2">
                      <USkeleton class="h-3 w-[85%]" />
                      <USkeleton class="h-3 w-[95%]" />
                      <USkeleton class="h-3 w-[60%]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-default bg-default/80">
            <form class="flex gap-2" @submit.prevent="sendMessage(inputMessage)">
              <UInput
                v-model="inputMessage"
                placeholder="Tanyakan sesuatu..."
                class="flex-1 text-xs"
                :disabled="isLoading"
                autofocus
                size="md"
              />
              <UButton
                type="submit"
                color="primary"
                icon="i-lucide-send"
                :disabled="!inputMessage.trim() || isLoading"
                size="md"
              />
            </form>
          </div>
        </div>
      </template>
    </USlideover>
  </div>
</template>

<style scoped>
.markdown-content :deep(p) {
  margin-bottom: 0.5rem;
}
.markdown-content :deep(p:last-child) {
  margin-bottom: 0;
}
.markdown-content :deep(ul), .markdown-content :deep(ol) {
  padding-left: 1.25rem;
  margin-bottom: 0.5rem;
  list-style-type: disc;
}
.markdown-content :deep(a) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background-color: var(--ui-primary, #3b82f6);
  color: #ffffff;
  font-weight: 600;
  font-size: 11px;
  border-radius: 9999px;
  padding: 4px 12px;
  margin-top: 4px;
  margin-bottom: 4px;
  text-decoration: none;
  transition: all 0.2s ease-in-out;
  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
}
.markdown-content :deep(a:hover) {
  opacity: 0.9;
  transform: translateY(-1px);
}
.streaming-active :deep(p:last-child)::after {
  content: '▋';
  display: inline-block;
  margin-left: 3px;
  color: var(--ui-primary, #3b82f6);
  animation: blink 0.8s step-start infinite;
}
@keyframes blink {
  50% { opacity: 0; }
}
</style>