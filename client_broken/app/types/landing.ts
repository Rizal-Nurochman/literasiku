export interface NavLinkItem {
  label: string
  to: string
}

export interface BookPreview {
  id: string
  title: string
  category: string
  physicalAvailable: boolean
  digitalAvailable: boolean
}

export interface FeatureVisual {
  type: any
  component?: string
  data?: any
}

export interface FeatureStats {
  label: string
  value: string
  trend?: string
  trendUp?: boolean
}

export interface FeatureItem {
  icon: string
  title: string
  description: string
  colSpan?: 1 | 2 // Lebar card (1 atau 2 kolom)
  rowSpan?: 1 | 2 // Tinggi card (1 atau 2 baris)
  visual: FeatureVisual
  stats?: FeatureStats[]
  badges?: string[]
  gradient?: string
}

export interface StepItem {
  title: string
  description: string
  icon: string
}

export interface RoleItem {
  role: string
  features: string[]
}

export interface StatItem {
  label: string
}

export interface FooterColumn {
  label: string
  items: {
    label: string
    to: string
  }[]
}
