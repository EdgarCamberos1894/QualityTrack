import { ApiError } from '@/shared/api/ApiError'
import { apiClient } from '@/shared/api/apiClient'
import { clearCurrentSession, getCurrentSession } from '../store/sessionStore'
import { isSessionActive } from '../model/session'

interface AuthApiClientOptions {
  onUnauthorized?: () => void
}

let configured = false

export function configureAuthApiClient(
  options: AuthApiClientOptions = {},
): void {
  if (configured) return
  configured = true

  apiClient.interceptors.request.use((config) => {
    const session = getCurrentSession()

    if (!session) return config

    if (!isSessionActive(session)) {
      clearCurrentSession()
      return config
    }

    config.headers.set(
      'Authorization',
      `${session.tokenType} ${session.accessToken}`,
    )

    return config
  })

  apiClient.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      if (error instanceof ApiError && error.status === 401) {
        clearCurrentSession()
        options.onUnauthorized?.()
      }

      return Promise.reject(error)
    },
  )
}
