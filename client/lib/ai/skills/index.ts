import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { SkillDefinition } from './types'

export const skillDefinitions: SkillDefinition[] = [
  {
    id: 'source-grounding',
    name: 'Source Grounding',
    description: 'Menjawab dengan citation marker inline dari sumber RAG.',
    triggers: ['referensi', 'sumber', 'citation', 'kutipan', 'notebooklm', 'berdasarkan dokumen', 'dari pdf', 'mana buktinya'],
    priority: 95,
    file: 'source-grounding.md'
  },
  {
    id: 'pdf-reading',
    name: 'PDF Reading',
    description: 'Membaca, meringkas, dan menjawab pertanyaan dari PDF.',
    triggers: ['pdf', 'dokumen', 'halaman', 'bab', 'file'],
    priority: 90,
    file: 'pdf-reading.md'
  },
  {
    id: 'rag-answering',
    name: 'RAG Answering',
    description: 'Menjawab berdasarkan konteks library dari Pinecone.',
    triggers: ['dokumen', 'library', 'buku', 'materi', 'berdasarkan data', 'isi dokumen'],
    priority: 85,
    file: 'rag-answering.md'
  },
  {
    id: 'react-agent',
    name: 'ReAct Agent',
    description: 'Task kompleks multi-step dengan tool internal.',
    triggers: ['analisis', 'rancang', 'debug', 'evaluasi', 'strategi', 'bandingkan', 'pikirkan matang', 'multi-step'],
    priority: 80,
    file: 'react-agent.md'
  },
  {
    id: 'memory',
    name: 'Memory',
    description: 'Menggunakan preferensi dan histori user secara aman.',
    triggers: ['ingat', 'simpan', 'remember', 'catat', 'preferensi', 'histori', 'mulai sekarang'],
    priority: 75,
    file: 'memory.md'
  },
  {
    id: 'summarization',
    name: 'Summarization',
    description: 'Membuat ringkasan jelas dan terstruktur.',
    triggers: ['ringkas', 'rangkuman', 'summary', 'simpulkan', 'inti'],
    priority: 70,
    file: 'summarization.md'
  },
  {
    id: 'citation',
    name: 'Citation',
    description: 'Menjaga rujukan dan sumber tetap akurat.',
    triggers: ['sitasi', 'citation', 'referensi', 'rujukan', 'sumber'],
    priority: 65,
    file: 'citation.md'
  },
  {
    id: 'quiz-generator',
    name: 'Quiz Generator',
    description: 'Membuat latihan soal dari materi.',
    triggers: ['kuis', 'quiz', 'latihan soal', 'pertanyaan pilihan ganda', 'ujian'],
    priority: 60,
    file: 'quiz-generator.md'
  },
  {
    id: 'book-recommendation',
    name: 'Book Recommendation',
    description: 'Merekomendasikan buku berdasarkan kebutuhan user.',
    triggers: ['rekomendasi buku', 'sarankan buku', 'buku apa', 'bacaan'],
    priority: 55,
    file: 'book-recommendation.md'
  },
  {
    id: 'semantic-search',
    name: 'Semantic Search',
    description: 'Mencari makna dan kemiripan antar konsep.',
    triggers: ['semantik', 'makna', 'kemiripan', 'mirip', 'cari bagian'],
    priority: 50,
    file: 'semantic-search.md'
  },
  {
    id: 'general-assistant',
    name: 'General Assistant',
    description: 'Fallback asisten umum Literasiku.',
    triggers: [],
    priority: 10,
    file: 'general-assistant.md'
  }
]

export function getAllSkills() {
  return skillDefinitions
}

export function selectSkillsByPrompt(prompt: string) {
  const normalized = prompt.toLowerCase()
  const selected = skillDefinitions
    .filter(skill => skill.id === 'general-assistant' || skill.triggers.some(trigger => normalized.includes(trigger)))
    .sort((a, b) => b.priority - a.priority)

  const withFallback = selected.some(skill => skill.id === 'general-assistant')
    ? selected
    : [...selected, skillDefinitions.find(skill => skill.id === 'general-assistant')!]

  return withFallback.slice(0, 4)
}

export async function loadSkillContent(skillId: string) {
  const skill = skillDefinitions.find(item => item.id === skillId) ?? skillDefinitions.find(item => item.id === 'general-assistant')!
  const skillPath = join(process.cwd(), 'lib/ai/skills', skill.file)

  return readFile(skillPath, 'utf8')
}

export async function buildSkillPrompt(prompt: string) {
  const skills = selectSkillsByPrompt(prompt)
  const contents = await Promise.all(skills.map(async skill => `## ${skill.name}\n${await loadSkillContent(skill.id)}`))

  return contents.join('\n\n')
}
