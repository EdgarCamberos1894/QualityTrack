from pathlib import Path
import json
import re
import textwrap

page_path = Path('frontend/src/modules/customer-portal/pages/CustomerMembersPage.tsx')
source = page_path.read_text(encoding='utf-8')

source = source.replace(
    "import { EmptyState } from '@/shared/components/feedback/EmptyState'\n",
    '',
)
source = source.replace(
    "import { Badge, type BadgeProps } from '@/shared/components/ui/Badge'\n",
    '',
)
source = source.replace(
    "import { CustomerMembersHeader } from '../components/CustomerMembersHeader'\n",
    "import { CustomerMembersDirectory } from '../components/CustomerMembersDirectory'\nimport { CustomerMembersHeader } from '../components/CustomerMembersHeader'\n",
)
source = source.replace(
    "import {\n  formatCustomerCompanyDate,\n  getCustomerMemberInitials,\n  getCustomerRoleLabel,\n} from '../model/customerCompanyPresenter'\n",
    "import { getCustomerRoleLabel } from '../model/customerCompanyPresenter'\n",
)

presentation_start = source.index('const roleDescriptions:')
page_start = source.index('export function CustomerMembersPage() {')
source = source[:presentation_start] + source[page_start:]

directory_start_marker = '        <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50/35 p-3.5 sm:p-4">'
directory_end_marker = '\n\n        {!isAdmin ? ('
directory_start = source.index(directory_start_marker)
directory_end = source.index(directory_end_marker, directory_start)
directory_markup = textwrap.dedent(source[directory_start:directory_end])

directory_markup = directory_markup.replace(
    'invitationsQuery.isPending',
    'invitationsPending',
)
directory_markup = directory_markup.replace(
    'invitationsQuery.isError',
    'invitationsError',
)
directory_markup = directory_markup.replace(
    'invitationsQuery.error',
    'invitationsError',
)
directory_markup = re.sub(
    r'mutations\.updateMemberRole\.reset\(\)\s+setRoleTarget\(member\)',
    'onChangeRole(member)',
    directory_markup,
)
directory_markup = re.sub(
    r'mutations\.removeMember\.reset\(\)\s+setRemoveTarget\(member\)',
    'onRemove(member)',
    directory_markup,
)
directory_markup = re.sub(
    r'mutations\.cancelInvitation\.reset\(\)\s+setCancelInvitationTarget\(invitation\)',
    'onCancelInvitation(invitation)',
    directory_markup,
)

usage = '''        <CustomerMembersDirectory
          view={view}
          isAdmin={isAdmin}
          visibleMembers={visibleMembers}
          visibleInvitations={visibleInvitations}
          invitations={invitations}
          invitationsPending={invitationsQuery.isPending}
          invitationsError={
            invitationsQuery.isError ? invitationsQuery.error : null
          }
          onChangeRole={(member) => {
            mutations.updateMemberRole.reset()
            setRoleTarget(member)
          }}
          onRemove={(member) => {
            mutations.removeMember.reset()
            setRemoveTarget(member)
          }}
          onCancelInvitation={(invitation) => {
            mutations.cancelInvitation.reset()
            setCancelInvitationTarget(invitation)
          }}
        />'''
source = source[:directory_start] + usage + source[directory_end:]
page_path.write_text(source, encoding='utf-8')

directory_content = f'''import {{ EmptyState }} from '@/shared/components/feedback/EmptyState'
import {{ ErrorState }} from '@/shared/components/feedback/ErrorState'
import {{ LoadingState }} from '@/shared/components/feedback/LoadingState'
import {{ Badge, type BadgeProps }} from '@/shared/components/ui/Badge'
import {{
  formatCustomerCompanyDate,
  getCustomerMemberInitials,
  getCustomerRoleLabel,
}} from '../model/customerCompanyPresenter'
import type {{
  CustomerInvitationDto,
  CustomerMemberDto,
}} from '../types/customerCompany.types'
import type {{ CustomerMembershipRole }} from '../types/customerPortal.types'

const roleDescriptions: Record<CustomerMembershipRole, string> = {{
  ADMIN: 'Gestiona empresa, miembros y solicitudes.',
  REQUESTER: 'Crea solicitudes y responde información.',
  VIEWER: 'Consulta el portal sin realizar cambios.',
}}

const roleTones: Record<CustomerMembershipRole, BadgeProps['tone']> = {{
  ADMIN: 'info',
  REQUESTER: 'success',
  VIEWER: 'neutral',
}}

function memberStatusLabel(status: string): string {{
  if (status === 'ACTIVE') return 'Activo'

  return status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}}

function invitationStatusLabel(invitation: CustomerInvitationDto): string {{
  if (invitation.status === 'PENDING') return 'Pendiente'

  return invitation.status
    .toLocaleLowerCase('es-MX')
    .replaceAll('_', ' ')
    .replace(/^./, (value) => value.toLocaleUpperCase('es-MX'))
}}

interface CustomerMembersDirectoryProps {{
  view: 'members' | 'invitations'
  isAdmin: boolean
  visibleMembers: CustomerMemberDto[]
  visibleInvitations: CustomerInvitationDto[]
  invitations: CustomerInvitationDto[]
  invitationsPending: boolean
  invitationsError: unknown
  onChangeRole: (member: CustomerMemberDto) => void
  onRemove: (member: CustomerMemberDto) => void
  onCancelInvitation: (invitation: CustomerInvitationDto) => void
}}

export function CustomerMembersDirectory({{
  view,
  isAdmin,
  visibleMembers,
  visibleInvitations,
  invitations,
  invitationsPending,
  invitationsError,
  onChangeRole,
  onRemove,
  onCancelInvitation,
}}: CustomerMembersDirectoryProps) {{
  return (
{textwrap.indent(directory_markup, '    ')}
  )
}}
'''

Path('frontend/src/modules/customer-portal/components/CustomerMembersDirectory.tsx').write_text(
    directory_content,
    encoding='utf-8',
)

baseline_path = Path('frontend/scripts/architecture-baseline.json')
baseline = json.loads(baseline_path.read_text(encoding='utf-8'))
baseline.pop('modules/customer-portal/pages/CustomerMembersPage.tsx', None)
baseline_path.write_text(
    json.dumps(baseline, ensure_ascii=False, indent=2) + '\n',
    encoding='utf-8',
)
