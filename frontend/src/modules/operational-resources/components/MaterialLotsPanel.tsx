import { useEffect, useMemo, useState } from 'react'
import {
  useMaterialCertificateFileActions,
  useMaterialLots,
  useMaterialMutations,
  type MaterialDto,
  type MaterialLotDto,
} from '@/modules/materials'
import { EmptyState } from '@/shared/components/feedback/EmptyState'
import { ErrorState } from '@/shared/components/feedback/ErrorState'
import { LoadingState } from '@/shared/components/feedback/LoadingState'
import { Badge } from '@/shared/components/ui/Badge'
import { Button } from '@/shared/components/ui/Button'
import { Card } from '@/shared/components/ui/Card'
import { cn } from '@/shared/lib/cn'
import { getErrorMessage } from '@/shared/lib/getErrorMessage'
import { formatResourceDate } from '../model/resourcePresenter'
import type { CreateMaterialLotFormValues } from '../schemas/resource.schemas'
import { CreateMaterialLotDialog } from './CreateMaterialLotDialog'
import { MaterialCertificateDialog } from './MaterialCertificateDialog'

interface MaterialLotsPanelProps {
  material: MaterialDto | null
  canManage: boolean
  highlightedLotId: number | null
}

export function MaterialLotsPanel({
  material,
  canManage,
  highlightedLotId,
}: MaterialLotsPanelProps) {
  const lotsQuery = useMaterialLots(material?.id ?? null)
  const mutations = useMaterialMutations()
  const certificateFile = useMaterialCertificateFileActions()
  const [createOpen, setCreateOpen] = useState(false)
  const [certificateLot, setCertificateLot] = useState<MaterialLotDto | null>(
    null,
  )

  const lots = useMemo(() => lotsQuery.data ?? [], [lotsQuery.data])

  useEffect(() => {
    if (
      !highlightedLotId ||
      !lots.some((lot) => lot.id === highlightedLotId)
    ) {
      return
    }

    const timeout = window.setTimeout(() => {
      document
        .getElementById(`material-lot-${highlightedLotId}`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 50)

    return () => window.clearTimeout(timeout)
  }, [highlightedLotId, lots])

  if (!material) {
    return (
      <Card className="overflow-hidden">
        <div className="p-5">
          <EmptyState
            title="Selecciona un material"
            description="Aquí verás sus lotes, proveedor, fecha de recepción y cantidad recibida."
          />
        </div>
      </Card>
    )
  }

  const createLot = async (values: CreateMaterialLotFormValues) => {
    try {
      await mutations.createLot.mutateAsync({
        materialId: material.id,
        payload: {
          lotNumber: values.lotNumber.trim(),
          supplier: values.supplier.trim() || undefined,
          receivedAt: values.receivedAt
            ? new Date(values.receivedAt).toISOString()
            : undefined,
          quantityReceived: values.quantityReceived,
        },
      })
      return true
    } catch {
      return false
    }
  }

  const uploadCertificate = async (file: File) => {
    if (!certificateLot) return false

    try {
      await mutations.uploadCertificate.mutateAsync({
        materialId: material.id,
        lotId: certificateLot.id,
        file,
      })
      setCertificateLot(null)
      return true
    } catch {
      return false
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wide text-amber-700">
            {material.code}
          </p>
          <h2 className="mt-1 text-base font-semibold text-slate-950">
            {material.name}
          </h2>
          <p className="mt-1 text-[10px] leading-5 text-slate-500">
            Unidad: {material.unit}
            {material.specification
              ? ' · ' + material.specification
              : ''}
          </p>
          {!lotsQuery.isPending && !lotsQuery.isError ? (
            <p className="mt-2 text-[9px] font-semibold text-slate-400">
              {lots.length}{' '}
              {lots.length === 1 ? 'lote registrado' : 'lotes registrados'}
            </p>
          ) : null}
        </div>

        {canManage ? (
          <Button
            size="sm"
            onClick={() => {
              mutations.createLot.reset()
              setCreateOpen(true)
            }}
          >
            Registrar lote
          </Button>
        ) : null}
      </div>

      {certificateFile.error ? (
        <div className="px-5 pt-4">
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
            {getErrorMessage(certificateFile.error)}
          </p>
        </div>
      ) : null}

      {lotsQuery.isPending ? (
        <div className="p-5">
          <LoadingState label="Cargando lotes…" />
        </div>
      ) : lotsQuery.isError ? (
        <div className="p-5">
          <ErrorState
            error={lotsQuery.error}
            title="No pudimos cargar los lotes"
          />
        </div>
      ) : lots.length === 0 ? (
        <div className="p-5">
          <EmptyState
            title="Sin lotes registrados"
            description="Registra una recepción para que el material pueda utilizarse con trazabilidad en producción."
          />
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {lots.map((lot) => (
            <article
              id={`material-lot-${lot.id}`}
              key={lot.id}
              className={cn(
                'scroll-mt-24 grid gap-4 px-5 py-4 transition md:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_150px_minmax(210px,auto)] md:items-center',
                highlightedLotId === lot.id &&
                  'bg-amber-50/70 ring-2 ring-inset ring-amber-200',
              )}
            >
              <div>
                <p className="text-xs font-semibold text-slate-950">
                  {lot.lotNumber}
                </p>
                <p className="mt-1 text-[10px] text-slate-500">
                  {lot.supplier ?? 'Proveedor no especificado'}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-400">
                  Recepción
                </p>
                <p className="mt-1 text-[10px] text-slate-700">
                  {formatResourceDate(lot.receivedAt)}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-wide text-slate-400">
                  Cantidad recibida
                </p>
                <p className="mt-1 text-xs font-semibold text-slate-950">
                  {lot.quantityReceived} {material.unit}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 md:justify-end">
                {lot.certificateDocumentVersionId ? (
                  <>
                    <Badge tone="success">Certificado</Badge>
                    {lot.certificateDocumentId ? (
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={certificateFile.busyLotId === lot.id}
                        onClick={() =>
                          void certificateFile.open(
                            lot.id,
                            lot.certificateDocumentId as number,
                            lot.certificateDocumentVersionId as number,
                          )
                        }
                      >
                        {certificateFile.busyLotId === lot.id
                          ? 'Abriendo…'
                          : 'Ver'}
                      </Button>
                    ) : null}
                  </>
                ) : (
                  <Badge tone="neutral">Sin certificado</Badge>
                )}

                {canManage ? (
                  <Button
                    size="sm"
                    variant={lot.certificateDocumentVersionId ? 'ghost' : 'secondary'}
                    onClick={() => {
                      mutations.uploadCertificate.reset()
                      setCertificateLot(lot)
                    }}
                  >
                    {lot.certificateDocumentVersionId
                      ? 'Actualizar'
                      : 'Adjuntar'}
                  </Button>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      <CreateMaterialLotDialog
        material={createOpen ? material : null}
        submitting={mutations.createLot.isPending}
        error={mutations.createLot.error}
        onClose={() => {
          mutations.createLot.reset()
          setCreateOpen(false)
        }}
        onSubmit={createLot}
      />

      <MaterialCertificateDialog
        material={material}
        lot={certificateLot}
        submitting={mutations.uploadCertificate.isPending}
        error={mutations.uploadCertificate.error}
        onClose={() => {
          mutations.uploadCertificate.reset()
          setCertificateLot(null)
        }}
        onSubmit={uploadCertificate}
      />
    </Card>
  )
}
