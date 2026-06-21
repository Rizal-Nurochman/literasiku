import type { FooterColumn } from '~/types/landing'

export const FOOTER_LINKS: FooterColumn[] = [
  {
    label: 'Tentang',
    items: [
      { label: 'Beranda', to: '/' },
      { label: 'Fitur', to: '#fitur' },
      { label: 'Cara Kerja', to: '#cara-kerja' }
    ]
  },
  {
    label: 'Kontak',
    items: [
      { label: 'Perpustakaan', to: 'mailto:perpustakaan@literasiku.local' },
      { label: 'Bantuan Anggota', to: 'mailto:bantuan@literasiku.local' }
    ]
  },
  {
    label: 'Akses',
    items: [
      { label: 'Login Admin', to: '/admin/login' },
      { label: 'Katalog', to: '#katalog' }
    ]
  }
]
