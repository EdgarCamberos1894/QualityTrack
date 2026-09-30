import { useQuery } from '@tanstack/react-query'
import { getDocumentCenter } from '../api/documents.api'

export const documentCenterKeys = {
  all: ['document-center'] as const,
}

export function useDocumentCenter() {
  return useQuery({
    queryKey: documentCenterKeys.all,
    queryFn: getDocumentCenter,
  })
}
