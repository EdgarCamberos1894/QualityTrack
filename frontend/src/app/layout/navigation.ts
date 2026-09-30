import type { SystemRole } from '@/modules/auth'

export interface NavigationItem {
  label: string
  href?: string
  workOrderTab?: 'production' | 'quality' | 'delivery'
  requiredRole?: SystemRole
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
  { label: 'Recursos', href: '/resources' },
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
  { label: 'Documentos', href: '/documents' },
  { label: 'Clientes' },
  {
    label: 'Usuarios y accesos',
    href: '/internal-users',
    requiredRole: 'ADMIN',
  },
]
