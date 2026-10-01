import { PageContainer } from '@/shared/components/layout/PageContainer'
import { PageHeader } from '@/shared/components/layout/PageHeader'
import { Badge } from '@/shared/components/ui/Badge'
import { Card } from '@/shared/components/ui/Card'

const workflowStages = [
  'Solicitud',
  'Expediente',
  'Cotización',
  'Orden de trabajo',
  'Hoja de ruta',
  'Producción',
  'Calidad',
  'Entrega',
]

export function HomePage() {
  return (
    <PageContainer>
      <PageHeader
        eyebrow="Operación interna"
        title="Panel de operación"
        description="QualityTrack conecta el flujo comercial, productivo y de calidad en un expediente trazable de principio a fin."
      />

      <div className="grid gap-6 @5xl/page:grid-cols-[1.4fr_0.6fr]">
        <Card className="p-6">
          <div className="mb-5 flex flex-wrap items-center gap-3">
            <h2 className="text-base font-semibold text-slate-950">
              Flujo principal
            </h2>
            <Badge tone="info">Trazabilidad integral</Badge>
          </div>

          <ol className="grid gap-3 sm:grid-cols-2">
            {workflowStages.map((stage, index) => (
              <li
                key={stage}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-bold text-blue-600">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="text-sm font-medium text-slate-700">
                  {stage}
                </span>
              </li>
            ))}
          </ol>
        </Card>

        <Card className="p-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
            Expediente 360
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-950">
            Una sola cadena de origen
          </h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Solicitud, caso, cotización, orden, producción, calidad, documentos
            y entrega convergen en el mismo historial auditable.
          </p>

          <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <p className="text-xs font-semibold text-teal-800">
              Sesión protegida
            </p>
            <p className="mt-1 text-xs leading-5 text-teal-700">
              Las rutas operativas requieren autenticación y el acceso se
              adjunta automáticamente a las solicitudes API.
            </p>
          </div>
        </Card>
      </div>
    </PageContainer>
  )
}
