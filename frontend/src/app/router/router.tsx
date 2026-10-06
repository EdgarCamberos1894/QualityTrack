import type { ComponentType } from 'react'
import { createBrowserRouter, Navigate } from 'react-router-dom'
import { AppShell } from '@/app/layout/AppShell'
import { AccountHomeRedirect } from '@/app/router/AccountHomeRedirect'
import { CustomerOnlyRoute } from '@/app/router/CustomerOnlyRoute'
import { InternalOnlyRoute } from '@/app/router/InternalOnlyRoute'
import { ProtectedRoute } from '@/app/router/ProtectedRoute'
import { PublicOnlyRoute } from '@/app/router/PublicOnlyRoute'
import {
  CustomerInvitationPage,
  ForgotPasswordPage,
  InternalInvitationPage,
  LoginPage,
  RegisterPage,
  ResendVerificationPage,
  ResetPasswordPage,
  VerifyEmailPage,
} from '@/modules/auth'

type LazyModule = object

function lazyComponent<TModule extends LazyModule>(
  loader: () => Promise<TModule>,
  exportName: keyof TModule,
) {
  return async () => {
    const module = await loader()
    return { Component: module[exportName] as ComponentType }
  }
}

const lazyCustomerPortal = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/customer-portal'),
    exportName as keyof Awaited<ReturnType<typeof importCustomerPortal>>,
  )

function importCustomerPortal() {
  return import('@/modules/customer-portal')
}

const lazyJobCases = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/job-cases'),
    exportName as keyof Awaited<ReturnType<typeof importJobCases>>,
  )

function importJobCases() {
  return import('@/modules/job-cases')
}

const lazyQuotations = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/quotations'),
    exportName as keyof Awaited<ReturnType<typeof importQuotations>>,
  )

function importQuotations() {
  return import('@/modules/quotations')
}

const lazyWorkOrders = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/work-orders'),
    exportName as keyof Awaited<ReturnType<typeof importWorkOrders>>,
  )

function importWorkOrders() {
  return import('@/modules/work-orders')
}

const lazyResources = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/operational-resources'),
    exportName as keyof Awaited<ReturnType<typeof importResources>>,
  )

function importResources() {
  return import('@/modules/operational-resources')
}

const lazyInternalCustomers = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/internal-customers'),
    exportName as keyof Awaited<ReturnType<typeof importInternalCustomers>>,
  )

function importInternalCustomers() {
  return import('@/modules/internal-customers')
}

const lazyProfiles = (exportName: string) =>
  lazyComponent(
    () => import('@/modules/user-profile'),
    exportName as keyof Awaited<ReturnType<typeof importProfiles>>,
  )

function importProfiles() {
  return import('@/modules/user-profile')
}

export const router = createBrowserRouter([
  {
    path: '/',
    lazy: lazyComponent(() => import('@/modules/landing'), 'LandingPage'),
  },
  { path: '/verify-email', element: <VerifyEmailPage /> },
  { path: '/reset-password', element: <ResetPasswordPage /> },
  {
    path: '/customer-invitations/accept',
    element: <CustomerInvitationPage />,
  },
  {
    path: '/internal-invitations/accept',
    element: <InternalInvitationPage />,
  },
  {
    element: <PublicOnlyRoute />,
    children: [
      { path: '/login', element: <LoginPage /> },
      { path: '/register', element: <RegisterPage /> },
      { path: '/resend-verification', element: <ResendVerificationPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/account', element: <AccountHomeRedirect /> },
      {
        element: <InternalOnlyRoute />,
        children: [
          {
            element: <AppShell />,
            children: [
              {
                path: '/dashboard',
                lazy: lazyComponent(() => import('@/modules/home'), 'HomePage'),
              },
              {
                path: '/profile',
                lazy: lazyProfiles('InternalProfilePage'),
              },
              { path: '/job-cases', lazy: lazyJobCases('JobCasesPage') },
              {
                path: '/job-cases/:caseId',
                lazy: lazyJobCases('JobCaseDetailPage'),
              },
              { path: '/quotations', lazy: lazyQuotations('QuotationsPage') },
              {
                path: '/quotations/:quotationId',
                lazy: lazyQuotations('QuotationDetailPage'),
              },
              { path: '/work-orders', lazy: lazyWorkOrders('WorkOrdersPage') },
              {
                path: '/work-orders/:workOrderId',
                lazy: lazyWorkOrders('WorkOrderDetailPage'),
              },
              { path: '/production', lazy: lazyWorkOrders('ProductionPage') },
              { path: '/machines', lazy: lazyResources('MachinesPage') },
              { path: '/materials', lazy: lazyResources('MaterialsPage') },
              {
                path: '/resources',
                lazy: lazyResources('OperationalResourcesPage'),
              },
              { path: '/quality', lazy: lazyWorkOrders('QualityPage') },
              { path: '/deliveries', lazy: lazyWorkOrders('DeliveriesPage') },
              {
                path: '/documents',
                lazy: lazyComponent(
                  () => import('@/modules/document-center'),
                  'DocumentCenterPage',
                ),
              },
              {
                path: '/customers',
                lazy: lazyInternalCustomers('InternalCustomersPage'),
              },
              {
                path: '/customers/:customerId',
                lazy: lazyInternalCustomers('InternalCustomerDetailPage'),
              },
              {
                path: '/internal-users',
                lazy: lazyComponent(
                  () => import('@/modules/internal-users'),
                  'InternalUsersPage',
                ),
              },
            ],
          },
        ],
      },
      {
        element: <CustomerOnlyRoute />,
        children: [
          {
            path: '/portal',
            lazy: lazyCustomerPortal('CustomerPortalLandingPage'),
          },
          {
            lazy: lazyCustomerPortal('CustomerPortalShell'),
            children: [
              {
                path: '/portal/:customerId',
                lazy: lazyCustomerPortal('CustomerPortalHomePage'),
              },
              {
                path: '/portal/:customerId/profile',
                lazy: lazyProfiles('CustomerProfilePage'),
              },
              {
                path: '/portal/:customerId/requests',
                lazy: lazyCustomerPortal('CustomerRequestsPage'),
              },
              {
                path: '/portal/:customerId/requests/new',
                lazy: lazyCustomerPortal('CustomerRequestCreatePage'),
              },
              {
                path: '/portal/:customerId/requests/:requestId',
                lazy: lazyCustomerPortal('CustomerRequestDetailPage'),
              },
              {
                path: '/portal/:customerId/members',
                lazy: lazyCustomerPortal('CustomerMembersPage'),
              },
              {
                path: '/portal/:customerId/company',
                lazy: lazyCustomerPortal('CustomerCompanyPage'),
              },
              {
                path: '/portal/:customerId/quotations',
                lazy: lazyQuotations('CustomerQuotationsPage'),
              },
              {
                path: '/portal/:customerId/quotations/:quotationId',
                lazy: lazyQuotations('CustomerQuotationDetailPage'),
              },
            ],
          },
        ],
      },
      { path: '*', element: <AccountHomeRedirect /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])
