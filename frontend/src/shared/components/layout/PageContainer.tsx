import type { ReactNode } from 'react'

interface PageContainerProps {
  children: ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <div className="@container/page mx-auto w-full max-w-[1192px] px-5 py-8 sm:px-8 lg:px-10">
      {children}
    </div>
  )
}
