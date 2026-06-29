import type { StatItem } from '~/types/landing'

export const STATS: StatItem[] = [
  { label: 'Katalog Digital' },
  { label: 'Peminjaman Fisik' },
  { label: 'Peminjaman Digital' },
  { label: 'Chatbot Pembaca' }
]


export const capabilityMeta = [
  {
    icon: 'i-lucide-library',
    description: 'Koleksi bisa ditemukan tanpa menelusuri rak secara manual.',
    gradient: 'from-cyan-500/10 to-blue-500/10 text-cyan-500 border-cyan-500/20'
  },
  {
    icon: 'i-lucide-handshake',
    description: 'Alur pengajuan tetap terhubung dengan buku fisik.',
    gradient: 'from-violet-500/10 to-purple-500/10 text-violet-500 border-violet-500/20'
  },
  {
    icon: 'i-lucide-file-text',
    description: 'Bacaan digital dibuka dalam viewer internal yang terkontrol.',
    gradient: 'from-emerald-500/10 to-teal-500/10 text-emerald-500 border-emerald-500/20'
  },
  {
    icon: 'i-lucide-bot',
    description: 'Pertanyaan anggota dijawab dengan konteks dan marker sitasi.',
    gradient: 'from-orange-500/10 to-red-500/10 text-orange-500 border-orange-500/20'
  }
]