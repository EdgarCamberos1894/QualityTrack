export interface NavigationItem {
  label: string
  href?: string
  workOrderTab?: 'production' | 'quality'
}

export const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Expedientes', href: '/job-cases' },
  { label: 'Cotizaciones', href: '/quotations' },
  { label: 'Órdenes de trabajo', href: '/work-orders' },
  {
    label: 'Producción',
    href: '/production',
    workOrderTab: 'production',
  },
  {
    label: 'Calidad',
    href: '/quality',
    workOrderTab: 'quality',
  },
  { label: 'Clientes' },
  { label: 'Usuarios y accesos' },
]
