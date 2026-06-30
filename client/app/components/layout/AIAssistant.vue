<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'

const { useMeQuery } = useUsers()
const { data: user } = useMeQuery()

const isOpen = ref(false)
const inputMessage = ref('')
const messages = ref<Array<{ role: 'user' | 'assistant'; content: string }>>([])
const isLoading = ref(false)

const activeTool = ref<{ name: string; status: 'running' | 'done' } | null>(null)
const streamStarted = ref(false)

const recommendedQuestions = computed(() => {
  if (!user.value) return []
  if (user.value.role === 'ADMIN') {
    return [
      'Tampilkan daftar semua transaksi peminjaman',
      'Berapa total anggota aktif perpustakaan?',
      'Buku digital apa saja yang tersedia?',
      'Adakah denda yang belum dibayar saat ini?'
    ]
  }
  return [
    'Tampilkan daftar peminjaman saya saat ini',
    'Apakah saya memiliki denda yang belum dibayar?',
    'Rekomendasikan buku fiksi yang tersedia',
    'Bagaimana cara meminjam buku digital?'
  ]
})

const currentToolLabel = computed(() => {
  if (!activeTool.value) return ''
  const name = activeTool.value.name
  if (name === 'list_books') return 'Mencari koleksi katalog perpustakaan...'
  if (name === 'search_book_content') return 'Membaca & menganalisis isi buku digital (RAG)...'
  if (name === 'my_loans') return 'Mengambil riwayat transaksi peminjaman Anda...'
  if (name === 'all_loans') return 'Mengambil seluruh data peminjaman di perpustakaan...'
  if (name === 'list_members') return 'Mencari data profil anggota perpustakaan...'
  return 'Sedang memproses permintaan...'
})

const currentToolIcon = computed(() => {
  if (!activeTool.value) return 'i-lucide-loader-2'
  const name = activeTool.value.name
  if (name === 'list_books') return 'i-lucide-book-open'
  if (name === 'search_book_content') return 'i-lucide-brain'
  if (name === 'my_loans' || name === 'all_loans') return 'i-lucide-file-text'
  if (name === 'list_members') return 'i-lucide-users'
  return 'i-lucide-settings'
})

const resetChat = () => {
  messages.value = []
  activeTool.value = null
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
  activeTool.value = null

  const assistantMessage: { role: 'user' | 'assistant'; content: string } = { role: 'assistant', content: '' }
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
              activeTool.value = { name: data.tool, status: data.status }
            } else if (data.type === 'token') {
              streamStarted.value = true
              activeTool.value = null
              assistantMessage.content += data.token
            } else if (data.type === 'done') {
              isLoading.value = false
            } else if (data.type === 'error') {
              assistantMessage.content = data.message || 'Terjadi kesalahan sistem.'
              isLoading.value = false
            }
          } catch {}
        }
      }
    }
  } catch (err: any) {
    assistantMessage.content = err.message || 'Koneksi gagal. Mohon pastikan Anda sudah masuk ke sistem.'
    isLoading.value = false
  }
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

            <div v-for="(msg, index) in messages" :key="index" class="flex flex-col gap-1">
              <div
                v-if="msg.content || (msg.role === 'assistant' && isLoading && !streamStarted && index === messages.length - 1)"
                class="flex gap-2.5 max-w-[90%]"
                :class="msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'"
              >
                <div
                  class="w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold"
                  :class="msg.role === 'user' ? 'bg-primary text-white' : 'bg-default-200 text-default'"
                >
                  <UIcon :name="msg.role === 'user' ? 'i-lucide-user' : 'i-lucide-bot'" class="w-4 h-4" />
                </div>

                <div
                  v-if="msg.role === 'user'"
                  class="rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed bg-primary text-white rounded-tr-none"
                >
                  {{ msg.content }}
                </div>
                
                <div
                  v-else
                  class="rounded-2xl px-4 py-2.5 text-xs shadow-sm leading-relaxed bg-default-100 text-default border border-default rounded-tl-none markdown-content flex-1"
                >
                  <div v-if="msg.content" v-html="renderMarkdown(msg.content)" />
                  
                  <div v-if="isLoading && !streamStarted && index === messages.length - 1" class="mt-2 space-y-3">
                    <div class="border border-primary/20 bg-primary/5 rounded-xl p-3 flex items-center gap-3 animate-pulse">
                      <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                        <UIcon :name="currentToolIcon" class="w-5 h-5" />
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-[10px] font-bold text-primary uppercase tracking-wider">
                          {{ activeTool && activeTool.status === 'running' ? 'Lixi sedang bekerja' : 'Lixi merencanakan jawaban' }}
                        </p>
                        <p class="text-[11px] text-default truncate font-medium mt-0.5">
                          {{ currentToolLabel }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="p-4 border-t border-default bg-default/80">
            <form @submit.prevent="sendMessage(inputMessage)" class="flex gap-2">
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
</style>
