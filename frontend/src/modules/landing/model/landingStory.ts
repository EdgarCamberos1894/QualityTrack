export interface LandingStoryStage {
  id: string
  step: string
  eyebrow: string
  title: string
  description: string
  signal: string
  detail: string
  side: 'left' | 'right'
  accent: 'blue' | 'cyan' | 'amber' | 'violet' | 'emerald'
  hero?: boolean
}

export const landingStory: LandingStoryStage[] = [
  {
    id: 'inicio',
    step: '00',
    eyebrow: 'Operación industrial conectada',
    title: 'De una solicitud a una entrega. Sin perder el hilo.',
    description:
      'QualityTrack conecta el trabajo comercial, operativo y de calidad en un solo recorrido. Desplázate y sigue una pieza desde la necesidad del cliente hasta la evidencia de entrega.',
    signal: 'Sistema en vivo',
    detail: 'Solicitud · Expediente · Cotización · Producción · Calidad · Entrega',
    side: 'left',
    accent: 'blue',
    hero: true,
  },
  {
    id: 'solicitud',
    step: '01',
    eyebrow: 'Solicitud',
    title: 'El trabajo empieza con contexto, no con mensajes sueltos.',
    description:
      'El cliente documenta qué necesita, adjunta archivos y define información de entrega. La solicitud entra al flujo con una referencia única desde el primer minuto.',
    signal: 'Solicitud recibida',
    detail: 'Requisitos, documentos y destino quedan vinculados desde origen.',
    side: 'right',
    accent: 'cyan',
  },
  {
    id: 'expediente',
    step: '02',
    eyebrow: 'Expediente 360',
    title: 'Cada decisión deja rastro mientras el caso avanza.',
    description:
      'La revisión interna, documentos, aclaraciones y eventos se reúnen alrededor del mismo expediente. La trazabilidad acompaña al proceso sin convertirse en otra pantalla aislada.',
    signal: 'Contexto consolidado',
    detail: 'Una historia operativa que crece con el trabajo real.',
    side: 'left',
    accent: 'blue',
  },
  {
    id: 'cotizacion',
    step: '03',
    eyebrow: 'Cotización',
    title: 'La propuesta comercial nace del mismo contexto técnico.',
    description:
      'Conceptos, tiempos y ajustes se preparan sin romper la continuidad del caso. El cliente revisa la propuesta y su aprobación habilita el siguiente movimiento.',
    signal: 'Cotización aprobada',
    detail: 'Versiones y ajustes permanecen ligados a la solicitud original.',
    side: 'right',
    accent: 'amber',
  },
  {
    id: 'orden-trabajo',
    step: '04',
    eyebrow: 'Orden de trabajo',
    title: 'La aprobación deja de ser papel y se convierte en ejecución.',
    description:
      'La orden concentra planeación, materiales, documentos y hoja de ruta. Las operaciones se encadenan para que cada equipo sepa qué sigue y qué debe estar listo antes.',
    signal: 'Ruta liberada',
    detail: 'Máquinas, materiales y operaciones quedan preparados para piso.',
    side: 'left',
    accent: 'violet',
  },
  {
    id: 'produccion',
    step: '05',
    eyebrow: 'Producción',
    title: 'La ruta empieza a moverse y la pieza gana historia.',
    description:
      'Las operaciones se inician y completan en secuencia, registrando consumo de material y ejecución. El avance deja de depender de memoria, chats o hojas paralelas.',
    signal: 'Operación en curso',
    detail: 'Ejecución, lotes y progreso permanecen conectados a la orden.',
    side: 'right',
    accent: 'blue',
  },
  {
    id: 'calidad',
    step: '06',
    eyebrow: 'Calidad',
    title: 'La calidad decide el siguiente paso con evidencia.',
    description:
      'Las inspecciones pueden adaptarse al trabajo real. Mediciones, verificaciones y no conformidades quedan registradas antes de permitir que la pieza continúe.',
    signal: 'Inspección conforme',
    detail: 'Resultados y decisiones quedan dentro de la misma trazabilidad.',
    side: 'left',
    accent: 'emerald',
  },
  {
    id: 'entrega',
    step: '07',
    eyebrow: 'Entrega',
    title: 'El proceso termina completo, no cuando la pieza sale de planta.',
    description:
      'La entrega conserva destino, transportista y evidencia. Al cerrar el caso, QualityTrack puede reconstruir el recorrido completo desde la solicitud hasta el producto entregado.',
    signal: 'Entrega confirmada',
    detail: 'Una sola línea de tiempo para cliente y equipo interno.',
    side: 'right',
    accent: 'cyan',
  },
]

export const operationalCapabilities = [
  {
    title: 'Solicitudes',
    eyebrow: 'Entrada ordenada',
    description: 'Requisitos, archivos y destino llegan con estructura desde el portal.',
    glyph: '01',
  },
  {
    title: 'Expediente 360',
    eyebrow: 'Contexto compartido',
    description: 'Revisión, documentos y trazabilidad reunidos alrededor del mismo caso.',
    glyph: '02',
  },
  {
    title: 'Cotizaciones',
    eyebrow: 'Decisión comercial',
    description: 'Versiones, conceptos, ajustes y aprobación sin perder el origen.',
    glyph: '03',
  },
  {
    title: 'Órdenes de trabajo',
    eyebrow: 'Plan ejecutable',
    description: 'Materiales, documentos y hoja de ruta listos para operación.',
    glyph: '04',
  },
  {
    title: 'Producción',
    eyebrow: 'Ejecución visible',
    description: 'Operaciones encadenadas, consumo de material y avance en contexto.',
    glyph: '05',
  },
  {
    title: 'Calidad',
    eyebrow: 'Evidencia antes de avanzar',
    description: 'Inspecciones flexibles, mediciones y decisiones sobre no conformidades.',
    glyph: '06',
  },
  {
    title: 'Entregas',
    eyebrow: 'Cierre verificable',
    description: 'Destino, transportista y evidencia forman parte del caso, no un apéndice.',
    glyph: '07',
  },
  {
    title: 'Trazabilidad',
    eyebrow: 'Hilo transversal',
    description: 'Los eventos conectan cada etapa para reconstruir qué pasó y cuándo.',
    glyph: '∞',
  },
] as const
