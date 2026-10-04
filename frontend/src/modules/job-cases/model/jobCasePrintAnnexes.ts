import { pdfjs } from 'react-pdf'
import { getJobCaseDocumentContent } from '../api/jobCases.api'
import type { RequestDocumentDto } from '../types/jobCase.types'

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

export interface JobCasePrintAnnexPage {
  key: string
  annexLabel: string
  annexSheetNumber: number
  documentId: number
  documentName: string
  documentType: string
  description: string | null
  fileName: string
  version: number
  uploadedAt: string
  uploadedByName: string | null
  sourcePageNumber: number | null
  sourcePageCount: number | null
  imageDataUrl: string | null
  note: string | null
}

export interface JobCasePrintAnnexReference {
  documentId: number
  annexLabel: string
  firstSheet: number
  lastSheet: number
}

export interface JobCasePrintAnnexBundle {
  pages: JobCasePrintAnnexPage[]
  references: JobCasePrintAnnexReference[]
}

function isPdf(mimeType: string, fileName: string) {
  return (
    mimeType.toLowerCase().includes('pdf') ||
    fileName.toLowerCase().endsWith('.pdf')
  )
}

function isImage(mimeType: string, fileName: string) {
  return (
    mimeType.toLowerCase().startsWith('image/') ||
    /\.(png|jpe?g|gif|webp|bmp)$/i.test(fileName)
  )
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
        return
      }
      reject(new Error('No fue posible preparar la imagen para impresión.'))
    }
    reader.onerror = () => reject(reader.error ?? new Error('Error de lectura.'))
    reader.readAsDataURL(blob)
  })
}

async function renderPdfPages(blob: Blob): Promise<string[]> {
  const loadingTask = pdfjs.getDocument({ data: await blob.arrayBuffer() })
  const pdf = await loadingTask.promise
  const pages: string[] = []

  try {
    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: 1.8 })
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        throw new Error('No fue posible crear el lienzo para el PDF.')
      }

      canvas.width = Math.ceil(viewport.width)
      canvas.height = Math.ceil(viewport.height)

      await page.render({ canvas, canvasContext: context, viewport }).promise
      pages.push(canvas.toDataURL('image/jpeg', 0.94))
      page.cleanup()
    }
  } finally {
    await pdf.destroy()
  }

  return pages
}

function annexPage(
  document: RequestDocumentDto,
  annexLabel: string,
  annexSheetNumber: number,
  options: {
    imageDataUrl?: string | null
    note?: string | null
    sourcePageNumber?: number | null
    sourcePageCount?: number | null
  } = {},
): JobCasePrintAnnexPage {
  const version = document.currentVersion

  return {
    key: `${document.id}-${annexSheetNumber}`,
    annexLabel,
    annexSheetNumber,
    documentId: document.id,
    documentName: document.name,
    documentType: document.documentType,
    description: document.description,
    fileName: version.fileName,
    version: version.version,
    uploadedAt: version.uploadedAt,
    uploadedByName: version.uploadedByName,
    sourcePageNumber: options.sourcePageNumber ?? null,
    sourcePageCount: options.sourcePageCount ?? null,
    imageDataUrl: options.imageDataUrl ?? null,
    note: options.note ?? null,
  }
}

export async function prepareJobCasePrintAnnexes(
  documents: RequestDocumentDto[],
): Promise<JobCasePrintAnnexBundle> {
  const pages: JobCasePrintAnnexPage[] = []
  const references: JobCasePrintAnnexReference[] = []
  let sheetNumber = 1

  for (const [documentIndex, document] of documents.entries()) {
    const annexLabel = `D${documentIndex + 1}`
    const firstSheet = sheetNumber

    try {
      const version = document.currentVersion
      const blob = await getJobCaseDocumentContent(
        document.id,
        version.id,
        false,
      )
      const mimeType = blob.type || version.mimeType

      if (isPdf(mimeType, version.fileName)) {
        const renderedPages = await renderPdfPages(blob)

        if (renderedPages.length === 0) {
          pages.push(
            annexPage(document, annexLabel, sheetNumber, {
              note: 'El PDF no contiene páginas imprimibles.',
            }),
          )
          sheetNumber += 1
        } else {
          for (const [pageIndex, imageDataUrl] of renderedPages.entries()) {
            pages.push(
              annexPage(document, annexLabel, sheetNumber, {
                imageDataUrl,
                sourcePageNumber: pageIndex + 1,
                sourcePageCount: renderedPages.length,
              }),
            )
            sheetNumber += 1
          }
        }
      } else if (isImage(mimeType, version.fileName)) {
        pages.push(
          annexPage(document, annexLabel, sheetNumber, {
            imageDataUrl: await blobToDataUrl(blob),
            sourcePageNumber: 1,
            sourcePageCount: 1,
          }),
        )
        sheetNumber += 1
      } else {
        pages.push(
          annexPage(document, annexLabel, sheetNumber, {
            note:
              'Este formato no puede representarse fielmente dentro de la impresión. El archivo original permanece disponible electrónicamente en QualityTrack.',
          }),
        )
        sheetNumber += 1
      }
    } catch {
      pages.push(
        annexPage(document, annexLabel, sheetNumber, {
          note:
            'No fue posible cargar este archivo al preparar la impresión. El original permanece disponible en QualityTrack.',
        }),
      )
      sheetNumber += 1
    }

    references.push({
      documentId: document.id,
      annexLabel,
      firstSheet,
      lastSheet: sheetNumber - 1,
    })
  }

  return { pages, references }
}
