import type { BookPreview } from '~/types/landing'

export const CATALOG_FILTERS = [
  'Semua',
  'Teknologi',
  'Pendidikan',
  'Sastra',
  'Riset'
]

export const BOOKS_PREVIEW: BookPreview[] = [
{
    id: 'bk-5',
    title: 'Pengantar Kecerdasan Buatan',
    category: 'Teknologi',
    physicalAvailable: true,
    digitalAvailable: true
  },
  {
    id: 'bk-6',
    title: 'Manajemen Kelas Efektif',
    category: 'Pendidikan',
    physicalAvailable: false,
    digitalAvailable: true
  },
  {
    id: 'bk-7',
    title: 'Teori Kritis Sastra Kontemporer',
    category: 'Sastra',
    physicalAvailable: true,
    digitalAvailable: false
  },
  {
    id: 'bk-8',
    title: 'Analisis Data Kualitatif',
    category: 'Riset',
    physicalAvailable: true,
    digitalAvailable: true
  },
  {
    id: 'bk-9',
    title: 'Arsitektur Cloud Computing',
    category: 'Teknologi',
    physicalAvailable: true,
    digitalAvailable: false
  },
  {
    id: 'bk-10',
    title: 'Statistik untuk Penelitian',
    category: 'Riset',
    physicalAvailable: false,
    digitalAvailable: true
  }
]
