import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import { LoginPage } from '@/modules/auth'
import { HomePage } from '@/modules/home'
import { JobCaseDetailPage, JobCasesPage } from '@/modules/job-cases'
import { WorkOrderDetailPage, WorkOrdersPage } from '@/modules/work-orders'

export const router = createBrowserRouter([
  {
    element: <PublicOnlyRoute />,
    children: [{ path: '/login', element: <LoginPage /> }],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <HomePage /> },
          { path: '/job-cases', element: <JobCasesPage /> },
          {
            path: '/job-cases/:caseId',
            element: <JobCaseDetailPage />,
          },
          { path: '/work-orders', element: <WorkOrdersPage /> },
          {
            path: '/work-orders/:workOrderId',
            element: <WorkOrderDetailPage />,
          },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
