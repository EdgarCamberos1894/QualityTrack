export interface NavigationItem {
  label: string
  href?: string
  workOrderTab?: 'production' | 'quality' | 'delivery'
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
  {
    label: 'Entregas',
    href: '/deliveries',
    workOrderTab: 'delivery',
  },
  { label: 'Clientes' },
  { label: 'Usuarios y accesos' },
]
