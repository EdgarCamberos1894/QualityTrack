import { Link } from 'react-router-dom'
import { Badge } from '@/shared/components/ui/Badge'
import {
  getInternalCustomerContact,
  getInternalCustomerLocation,
  getInternalCustomerStatusPresentation,
} from '../model/internalCustomerPresenter'
import type { InternalCustomerSummaryDto } from '../types/internalCustomer.types'

interface InternalCustomersTableProps {
  customers: InternalCustomerSummaryDto[]
}

export function InternalCustomersTable({
  customers,
}: InternalCustomersTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[980px] border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-left text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            <th className="px-4 py-3">Empresa</th>
            <th className="px-4 py-3">Contacto</th>
            <th className="px-4 py-3">Ubicación</th>
            <th className="px-4 py-3 text-center">Miembros</th>
            <th className="px-4 py-3 text-center">Abiertos</th>
            <th className="px-4 py-3 text-center">Completados</th>
            <th className="px-4 py-3">Estado</th>
            <th className="px-4 py-3 text-right">Acción</th>
          </tr>
        </thead>

        <tbody>
          {customers.map((customer) => {
            const status = getInternalCustomerStatusPresentation(customer.status)

            return (
              <tr
                key={customer.id}
                className="border-b border-slate-100 text-xs text-slate-700 last:border-0 hover:bg-slate-50"
              >
                <td className="px-4 py-4">
                  <p className="font-semibold text-slate-950">{customer.name}</p>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {customer.rfc || 'RFC sin registrar'}
                  </p>
                </td>
                <td className="px-4 py-4">{getInternalCustomerContact(customer)}</td>
                <td className="px-4 py-4">{getInternalCustomerLocation(customer)}</td>
                <td className="px-4 py-4 text-center font-semibold text-slate-900">
                  {customer.activeMembers}
                </td>
                <td className="px-4 py-4 text-center font-semibold text-amber-700">
                  {customer.openCases}
                </td>
                <td className="px-4 py-4 text-center font-semibold text-emerald-700">
                  {customer.completedCases}
                </td>
                <td className="px-4 py-4">
                  <Badge tone={status.tone}>{status.label}</Badge>
                </td>
                <td className="px-4 py-4 text-right">
                  <Link
                    to={`/customers/${customer.id}`}
                    className="inline-flex h-8 items-center rounded-lg border border-slate-200 px-3 text-[11px] font-semibold text-slate-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                  >
                    Abrir
                  </Link>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
