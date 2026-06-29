import type { RoleItem } from '~/types/landing'

export const ROLES: RoleItem[] = [
  {
    role: 'Untuk Anggota',
    features: [
      'Cari katalog buku',
      'Ajukan peminjaman',
      'Baca PDF internal',
      'Lihat riwayat peminjaman',
      'Tanya chatbot pembaca'
    ]
  },
  {
    role: 'Untuk Admin',
    features: [
      'Kelola data buku',
      'Kelola data anggota',
      'Upload PDF koleksi',
      'Catat pengembalian',
      'Pantau laporan perpustakaan'
    ]
  }
]
