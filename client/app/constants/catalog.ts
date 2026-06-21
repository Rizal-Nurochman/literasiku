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
    id: 'bk-1',
    title: 'Dasar Pemrograman Modern',
    category: 'Teknologi',
    physicalAvailable: true,
    digitalAvailable: true
  },
  {
    id: 'bk-2',
    title: 'Metode Penelitian Terapan',
    category: 'Riset',
    physicalAvailable: true,
    digitalAvailable: false
  },
  {
    id: 'bk-3',
    title: 'Strategi Pembelajaran Aktif',
    category: 'Pendidikan',
    physicalAvailable: false,
    digitalAvailable: true
  },
  {
    id: 'bk-4',
    title: 'Antologi Sastra Nusantara',
    category: 'Sastra',
    physicalAvailable: true,
    digitalAvailable: true
  }
]
