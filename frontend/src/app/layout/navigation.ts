export interface NavigationItem {
  label: string
  href?: string
}

export const navigationItems: NavigationItem[] = [
  { label: 'Inicio', href: '/' },
  { label: 'Expedientes', href: '/job-cases' },
  { label: 'Cotizaciones' },
  { label: 'Órdenes de trabajo', href: '/work-orders' },
  { label: 'Producción' },
  { label: 'Calidad' },
  { label: 'Clientes' },
  { label: 'Usuarios y accesos' },
]
