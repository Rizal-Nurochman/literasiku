<script setup lang="ts">
import { Chat } from '@ai-sdk/vue'
import { DefaultChatTransport, type UIMessage } from 'ai'
import type { RagReferenceMap, SafeRagReference } from '../../lib/ai/references/types'

const input = ref('')
const mode = ref<'fast' | 'thinking' | 'auto'>('auto')
const useRag = ref(true)
const useMemory = ref(true)
const useSkills = ref(true)
const chat = new Chat<UIMessage>({
  transport: new DefaultChatTransport({
    api: '/api/ai',
    body: () => ({
      mode: mode.value,
      useRag: useRag.value,
      useMemory: useMemory.value,
      useSkills: useSkills.value,
      includeReferences: true
    })
  }),
  messages: []
})

const messages = computed(() => chat.messages)
const status = computed(() => chat.status)
const error = computed(() => chat.error?.message)
const isLoading = computed(() => status.value === 'submitted' || status.value === 'streaming')

function getTextParts(message: UIMessage) {
  return message.parts.filter(part => part.type === 'text').map(part => part.text)
}

function getReferences(message: UIMessage) {
  const map: Record<string, SafeRagReference> = {}

  for (const part of message.parts as Array<{ type: string, data?: unknown }>) {
    if (part.type !== 'data-references') continue
    const data = part.data as { references?: SafeRagReference[] } | undefined

    for (const reference of data?.references ?? []) {
      map[reference.referenceId] = reference
    }
  }

  return map as RagReferenceMap
}

function hasReferences(message: UIMessage) {
  return Object.keys(getReferences(message)).length > 0
}

async function sendMessage() {
  const text = input.value.trim()

  if (!text || isLoading.value) return

  input.value = ''
  await chat.sendMessage({ text })
}

async function stopStreaming() {
  await chat.stop()
}
</script>

<template>
  <div class="min-h-screen bg-white text-neutral-900 dark:bg-neutral-950 dark:text-white">
    <UPageHero
      title="Literasiku AI Agent"
      description="Tanyakan buku, PDF, materi, atau penjelasan dari data library dengan referensi yang bisa di-hover."
      :links="[{ label: 'DeepSeek Fast/Thinking', icon: 'i-lucide-brain-circuit', color: 'primary', size: 'xl' }, { label: 'NotebookLM-style References', icon: 'i-lucide-quote', color: 'neutral', variant: 'subtle', size: 'xl' }]"
    />

    <UPageSection>
      <div class="mx-auto flex max-w-5xl flex-col gap-4">
        <UCard :ui="{ body: 'p-0 sm:p-0' }">
          <div class="flex h-[min(72vh,760px)] min-h-[560px] flex-col">
            <div class="flex flex-wrap items-center justify-between gap-3 border-b border-default px-4 py-3">
              <div class="flex items-center gap-2">
                <UIcon
                  name="i-lucide-library-big"
                  class="size-5 text-primary"
                />
                <span class="text-sm font-semibold">Digital Library Assistant</span>
              </div>

              <div class="flex flex-wrap items-center gap-2">
                <USelect
                  v-model="mode"
                  size="sm"
                  class="w-32"
                  :items="[
                    { label: 'Auto', value: 'auto' },
                    { label: 'Fast', value: 'fast' },
                    { label: 'Thinking', value: 'thinking' }
                  ]"
                />
                <USwitch
                  v-model="useRag"
                  size="sm"
                  label="RAG"
                />
                <USwitch
                  v-model="useMemory"
                  size="sm"
                  label="Memory"
                />
                <USwitch
                  v-model="useSkills"
                  size="sm"
                  label="Skills"
                />
                <UBadge
                  :color="isLoading ? 'primary' : 'neutral'"
                  variant="subtle"
                >
                  {{ isLoading ? 'Streaming' : 'Ready' }}
                </UBadge>
              </div>
            </div>

            <div class="flex-1 overflow-y-auto px-4 py-5">
              <div
                v-if="messages.length"
                class="space-y-5"
              >
                <div
                  v-for="message in messages"
                  :key="message.id"
                  class="flex"
                  :class="message.role === 'user' ? 'justify-end' : 'justify-start'"
                >
                  <div
                    class="max-w-[86%] rounded-lg px-4 py-3 text-sm leading-6 shadow-sm"
                    :class="message.role === 'user'
                      ? 'bg-primary text-white'
                      : 'bg-neutral-100 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100'"
                  >
                    <div
                      v-if="message.role === 'assistant'"
                      class="mb-2"
                    >
                      <UBadge
                        size="sm"
                        :color="hasReferences(message) ? 'primary' : 'neutral'"
                        variant="subtle"
                      >
                        {{ hasReferences(message) ? 'Berdasarkan data library' : 'Jawaban umum' }}
                      </UBadge>
                    </div>

                    <template
                      v-for="(text, index) in getTextParts(message)"
                      :key="`${message.id}-${index}`"
                    >
                      <AiMessageWithReferences
                        v-if="message.role === 'assistant'"
                        :text="text"
                        :references="getReferences(message)"
                      />
                      <p
                        v-else
                        class="whitespace-pre-wrap"
                      >
                        {{ text }}
                      </p>
                    </template>

                    <AiReferencePanel
                      v-if="message.role === 'assistant'"
                      :references="getReferences(message)"
                    />
                  </div>
                </div>
              </div>

              <div
                v-else
                class="grid h-full place-items-center text-center"
              >
                <div class="max-w-sm space-y-3">
                  <UIcon
                    name="i-lucide-book-open-text"
                    class="mx-auto size-11 text-primary"
                  />
                  <h2 class="text-lg font-semibold">
                    Mulai bertanya ke Literasiku
                  </h2>
                  <p class="text-sm text-muted">
                    Jawaban dari library akan punya marker referensi seperti S1 yang bisa di-hover untuk melihat bukti chunk.
                  </p>
                </div>
              </div>
            </div>

            <div
              v-if="error"
              class="border-t border-error/20 bg-error/5 px-4 py-3 text-sm text-error"
            >
              {{ error }}
            </div>

            <form
              class="flex gap-3 border-t border-default p-4"
              @submit.prevent="sendMessage"
            >
              <UInput
                v-model="input"
                class="flex-1"
                size="xl"
                placeholder="Tanyakan isi buku, PDF, atau minta ringkasan dengan referensi..."
                :disabled="isLoading"
              />

              <UButton
                v-if="isLoading"
                type="button"
                color="neutral"
                variant="subtle"
                size="xl"
                icon="i-lucide-square"
                @click="stopStreaming"
              />

              <UButton
                v-else
                type="submit"
                color="primary"
                size="xl"
                icon="i-lucide-send"
                :disabled="!input.trim()"
              >
                Kirim
              </UButton>
            </form>
          </div>
        </UCard>
      </div>
    </UPageSection>
  </div>
</template>
