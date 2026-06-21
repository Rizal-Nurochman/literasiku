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

export interface FeatureItem {
  icon: string
  title: string
  description: string
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
