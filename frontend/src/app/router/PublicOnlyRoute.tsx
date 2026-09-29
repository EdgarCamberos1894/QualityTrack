import { Navigate, Outlet } from 'react-router-dom'
import { isSessionActive, useSessionStore } from '@/modules/auth'

export function PublicOnlyRoute() {
  const session = useSessionStore((state) => state.session)

  if (session && isSessionActive(session)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
