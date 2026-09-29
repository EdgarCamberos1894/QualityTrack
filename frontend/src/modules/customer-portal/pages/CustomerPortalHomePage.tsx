import { Link } from 'react-router-dom'
import { PageContainer } from '@/shared/components/layout/PageContainer'
import { Card } from '@/shared/components/ui/Card'
import { useCustomerPortalContext } from '../hooks/useCustomerPortalContext'

export function CustomerPortalHomePage() {
  const { customer } = useCustomerPortalContext()

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">
          Portal de cliente
        </p>
        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
          {customer.customerName}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Consulta el estado de tus solicitudes y responde las cotizaciones
          disponibles para tu empresa.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-600">
            Cotizaciones
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Revisa propuestas y revisiones
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Aprueba, solicita ajustes o rechaza las cotizaciones enviadas por el
            equipo comercial.
          </p>
          <Link
            to={`/portal/${customer.customerId}/quotations`}
            className="mt-5 inline-flex text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver cotizaciones
          </Link>
        </Card>

        <Card className="p-5">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Próximamente
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Solicitudes y documentos
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Estos módulos se incorporarán sobre el mismo contexto de empresa.
          </p>
        </Card>
      </div>
    </PageContainer>
  )
}
