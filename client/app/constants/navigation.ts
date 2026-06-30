import type { NavLinkItem } from '~/types/landing'

export const NAV_LINKS: NavLinkItem[] = [
  { label: 'Beranda', to: '/#beranda' },
  { label: 'Katalog', to: '/#katalog' },
  { label: 'Fitur', to: '/#fitur' },
  { label: 'Cara Kerja', to: '/#cara-kerja' }
]

export const NAV_USER=(user:any, logoutMutation:any)=> [
  [
    {
      label: user.value?.full_name ?? 'Anggota',
      icon: 'i-lucide-brain-circuit',
      disabled: true
    }
  ],
  [
    {
      label:'Dashboard',
      icon:'i-lucide-home',
      to:user.value.role==='ADMIN'?'/admin':'/dashboard'
    },
  ],
  [
    {
      label: 'Keluar',
      icon: 'i-lucide-log-out',
      onSelect: () => logoutMutation.mutate()
    }
  ]
]

export const NAV_SIDEBAR_ADMIN=[
  [
    {
      label: 'Dashboard',
      icon: 'i-lucide-layout-dashboard',
      to: '/dashboard'
    }
  ],
  [
    {
      label: 'Buku',
      icon: 'i-lucide-book-open',
      to: '/dashboard/buku'
    },
    {
      label: 'Kategori',
      icon: 'i-lucide-tag',
      to: '/dashboard/kategori'
    }
  ],
  [
    {
      label: 'Anggota',
      icon: 'i-lucide-users',
      to: '/dashboard/anggota'
    }
  ],
  [
    {
      label: 'Peminjaman Fisik',
      icon: 'i-lucide-book-copy',
      to: '/dashboard/peminjaman/fisik'
    },
    {
      label: 'Peminjaman Digital',
      icon: 'i-lucide-tablet-smartphone',
      to: '/dashboard/peminjaman/digital'
    }
  ],
  [
    {
      label: 'Denda',
      icon: 'i-lucide-circle-dollar-sign',
      to: '/dashboard/denda'
    },
    {
      label: 'Laporan',
      icon: 'i-lucide-bar-chart-3',
      to: '/dashboard/laporan'
    }
  ]
]

export const NAV_SIDEBAR_USER=[
  {
    label: 'Beranda',
    icon: 'i-lucide-home',
    to: '/dashboard'
  },
  {
    label: 'Katalog',
    icon: 'i-lucide-book-open',
    to: '/dashboard/katalog'
  },
  {
    label: 'Peminjaman Saya',
    icon: 'i-lucide-book-copy',
    to: '/dashboard/peminjaman'
  },
  {
    label: 'Riwayat',
    icon: 'i-lucide-history',
    to: '/dashboard/riwayat'
  },
  {
    label: 'Profil',
    icon: 'i-lucide-user-round',
    to: '/dashboard/profil'
  }
]
