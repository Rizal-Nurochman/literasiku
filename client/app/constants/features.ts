import type { FeatureItem } from '~/types/landing'

export const FEATURES: FeatureItem[] = [
  {
    icon: 'i-lucide-search',
    title: 'Katalog Online',
    description: 'Cari buku berdasarkan judul, kategori, dan status ketersediaan tanpa datang ke rak terlebih dahulu.',
    colSpan: 2,
    rowSpan: 1,
    gradient: 'from-cyan-500/20 to-blue-500/20',
    badges: ['Real-time', 'Filter Advanced'],
    stats: [
      { label: 'Buku Tersedia', value: '12,450', trend: '+12%', trendUp: true },
      { label: 'Kategori', value: '48', trend: '+3', trendUp: true }
    ],
    visual: {
      type: 'mockup',
      component: 'CatalogSearchMockup',
      data: {
        searchQuery: 'Machine Learning',
        results: [
          { title: 'Deep Learning Fundamentals', author: 'Andrew Ng', available: true },
          { title: 'Python for Data Science', author: 'Jake VanderPlas', available: true },
          { title: 'AI Ethics Handbook', author: 'Timnit Gebru', available: false }
        ]
      }
    }
  },
  {
    icon: 'i-lucide-book-marked',
    title: 'Peminjaman Buku Fisik',
    description: 'Ajukan peminjaman buku fisik dari akun anggota, lalu ambil sesuai alur perpustakaan.',
    colSpan: 1,
    rowSpan: 2,
    gradient: 'from-violet-500/20 to-purple-500/20',
    badges: ['Digital Queue', 'Auto-reminder'],
    stats: [
      { label: 'Rule 1', value: 'Maks 5 Buku', trend: 'Batas pinjaman', trendUp: true },
      { label: 'Rule 2', value: 'Durasi 7 Hari', trend: 'Maksimal waktu', trendUp: true },
      { label: 'Rule 3', value: 'Denda Rp 2k', trend: 'Per hari terlambat', trendUp: false },
      { label: 'Rule 4', value: '1x Perpanjang', trend: 'Via aplikasi', trendUp: true },
      { label: 'Rule 5', value: 'Ambil 24 Jam', trend: 'Batas waktu loket', trendUp: true },
      { label: 'Rule 6', value: 'Wajib KTA', trend: 'Saat pengambilan', trendUp: true }
    ],
    visual: {
      type: 'diagram',
      component: 'BorrowingFlowDiagram',
      data: {
        steps: [
          { icon: 'i-lucide-search', label: 'Cari Buku', status: 'completed' },
          { icon: 'i-lucide-calendar', label: 'Pilih Tanggal', status: 'completed' },
          { icon: 'i-lucide-check-circle', label: 'Konfirmasi', status: 'active' },
          { icon: 'i-lucide-package', label: 'Ambil Buku', status: 'pending' }
        ],
        currentStep: 2
      }
    }
  },
  {
    icon: 'i-lucide-file-text',
    title: 'Baca Buku Digital',
    description: 'Akses PDF internal untuk koleksi digital dengan kontrol baca yang tetap berada di aplikasi.',
    colSpan: 2,
    rowSpan: 1,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    badges: ['PDF Viewer', 'Offline Mode', 'Annotation'],
    stats: [
      { label: 'Buku Digital', value: '8,320', trend: '+156 bulan ini', trendUp: true },
      { label: 'Waktu Baca', value: '127 jam', trend: '+23%', trendUp: true }
    ],
    visual: {
      type: 'mockup',
      component: 'PDFReaderMockup',
      data: {
        currentPage: 42,
        totalPages: 328,
        title: 'Introduction to Algorithms',
        highlights: 12,
        bookmarks: 5,
        zoom: '125%'
      }
    }
  },
  {
    icon: 'i-lucide-bot',
    title: 'Chatbot Pembaca Buku',
    description: 'Tanya langsung ke chatbot berbasis AI untuk mendapatkan ringkasan, rekomendasi, dan jawaban terkait buku.',
    colSpan: 1,
    rowSpan: 2,
    gradient: 'from-orange-500/20 to-red-500/20',
    badges: ['AI-Powered', 'RAG System', 'Citation'],
    stats: [
      { label: 'Pertanyaan', value: '1,247', trend: 'Terjawab', trendUp: true },
      { label: 'Akurasi', value: '94%', trend: 'Based on reviews', trendUp: true }
    ],
    visual: {
      type: 'mockup',
      component: 'ChatbotMockup',
      data: {
        messages: [
          { role: 'user', text: 'Apa itu RAG system?' },
          { 
            role: 'assistant', 
            text: 'RAG (Retrieval-Augmented Generation) adalah sistem AI yang menggabungkan pencarian informasi dengan generation...',
            citations: ['⟦S1', '⟦S2']
          }
        ],
        isTyping: false
      }
    }
  },
  {
    icon: 'i-lucide-shield-check',
    title: 'Keamanan Data',
    description: 'Enkripsi end-to-end untuk semua data pribadi dan riwayat baca Anda.',
    colSpan: 1,
    rowSpan: 1,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    badges: ['SSL/TLS', 'GDPR Compliant'],
    stats: [
      { label: 'Uptime', value: '99.9%', trend: 'SLA Guarantee', trendUp: true }
    ],
    visual: {
      type: 'icon-grid',
      component: 'SecurityFeaturesGrid',
      data: {
        features: [
          { icon: 'i-lucide-lock', label: 'End-to-end Encryption' },
          { icon: 'i-lucide-user-check', label: 'Two-Factor Auth' },
          { icon: 'i-lucide-database', label: 'Daily Backup' },
          { icon: 'i-lucide-shield', label: 'Privacy First' }
        ]
      }
    }
  },
  {
    icon: 'i-lucide-users',
    title: 'Komunitas Pembaca',
    description: 'Bergabung dengan grup diskusi dan bagikan review buku favorit Anda.',
    colSpan: 1,
    rowSpan: 1,
    gradient: 'from-pink-500/20 to-rose-500/20',
    badges: ['Discussion Groups', 'Book Clubs'],
    stats: [
      { label: 'Member Aktif', value: '3,847', trend: '+234 minggu ini', trendUp: true },
      { label: 'Diskusi', value: '156', trend: 'Bulan ini', trendUp: true }
    ],
    visual: {
      type: 'stats',
      component: 'CommunityStats',
      data: {
        topGenres: [
          { name: 'Technology', count: 423, color: 'bg-cyan-500' },
          { name: 'Business', count: 312, color: 'bg-violet-500' },
          { name: 'Science', count: 287, color: 'bg-emerald-500' },
          { name: 'Fiction', count: 198, color: 'bg-orange-500' }
        ]
      }
    }
  },
]