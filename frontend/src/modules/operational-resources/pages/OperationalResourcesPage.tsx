import { useSearchParams } from 'react-router-dom'
import { useSessionStore } from '@/modules/auth'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { MaterialsPanel } from '../components/MaterialsPanel'
import { MachinesPanel } from '../components/MachinesPanel'
import {
  ResourceTabs,
  type ResourceTab,
} from '../components/ResourceTabs'

export function OperationalResourcesPage() {
  const session = useSessionStore((state) => state.session)
  const [searchParams, setSearchParams] = useSearchParams()
  const tab: ResourceTab =
    searchParams.get('tab') === 'materials' ? 'materials' : 'machines'
  const roles = session?.user.roles ?? []
  const canManage =
    roles.includes('ADMIN') || roles.includes('PRODUCTION')

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación"
        title="Recursos de producción"
        description="Administra el parque de máquinas y las referencias de material que alimentan la ejecución real de las órdenes de trabajo."
      />

      <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3">
        <p className="text-[10px] leading-5 text-slate-600">
          Máquinas y lotes son datos operativos compartidos. Los usuarios
          internos pueden consultarlos; solo ADMIN o PRODUCTION pueden registrar
          o cambiar disponibilidad.
        </p>
      </div>

      <ResourceTabs
        value={tab}
        onChange={(nextTab) => {
          const next = new URLSearchParams(searchParams)
          next.set('tab', nextTab)
          setSearchParams(next, { replace: true })
        }}
      />

      {tab === 'machines' ? (
        <MachinesPanel canManage={canManage} />
      ) : (
        <MaterialsPanel canManage={canManage} />
      )}
    </PageContainer>
  )
}
