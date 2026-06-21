import type { FeatureItem } from '~/types/landing'

export const FEATURES: FeatureItem[] = [
  {
    icon: 'i-lucide-search',
    title: 'Katalog Online',
    description: 'Cari buku berdasarkan judul, kategori, dan status ketersediaan tanpa datang ke rak terlebih dahulu.'
  },
  {
    icon: 'i-lucide-book-marked',
    title: 'Peminjaman Buku Fisik',
    description: 'Ajukan peminjaman buku fisik dari akun anggota, lalu ambil sesuai alur perpustakaan.'
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Baca Buku Digital',
    description: 'Akses PDF internal untuk koleksi digital dengan kontrol baca yang tetap berada di aplikasi.'
  },
  {
    icon: 'i-lucide-bot',
    title: 'Chatbot Pembaca Buku',
    description: 'Ajukan pertanyaan tentang isi bacaan dan lihat rujukan jawaban melalui marker sitasi.'
  }
]
