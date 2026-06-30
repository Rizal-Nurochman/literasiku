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
      to: '/admin'
    }
  ],
  [
    {
      label: 'Buku',
      icon: 'i-lucide-book-open',
      to: '/admin/buku'
    },
    {
      label: 'Kategori',
      icon: 'i-lucide-tag',
      to: '/admin/kategori'
    }
  ],
  [
    {
      label: 'Anggota',
      icon: 'i-lucide-users',
      to: '/admin/anggota'
    }
  ],
  [
    {
      label: 'Peminjaman Fisik',
      icon: 'i-lucide-book-copy',
      to: '/admin/peminjaman/fisik'
    },
    {
      label: 'Peminjaman Digital',
      icon: 'i-lucide-tablet-smartphone',
      to: '/admin/peminjaman/digital'
    }
  ],
  [
    {
      label: 'Denda',
      icon: 'i-lucide-circle-dollar-sign',
      to: '/admin/denda'
    },
    {
      label: 'Laporan',
      icon: 'i-lucide-bar-chart-3',
      to: '/admin/laporan'
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
