# QualityTrack · Backlog staging

Este documento existe únicamente como staging mientras se habilita GitHub Issues en este fork.

## Fuentes de verdad

- `01 · Flujos funcionales · Reglas de negocio`
- `02 · DER · Arquitectura de datos`
- `03 · Prototipo web · Flujo simplificado · Fuente UX`

## Fase 0 · Fundamentos de dominio

- Extender roles internos y autorización.
- Implementar empresas cliente y membresías.
- Implementar invitaciones de miembros cliente.
- Implementar documentos y versionado.
- Implementar infraestructura base de trazabilidad.

## Fase 1 · Cliente → revisión → cotización

- CustomerRequest.
- JobCase y revisión.
- Solicitudes de información.
- Especificación técnica.
- Quotation y revisiones.

## Fase 2 · OT → planeación → producción

- WorkOrder.
- Documentos fijados a OT.
- RoutingSheet / RoutingOperation.
- Máquinas.
- Materiales y lotes.
- OperationExecution.

## Fase 3 · Calidad → NC → entrega

- QualityInspection / QualityMeasurement.
- NonConformity.
- Retrabajo y reinspección.
- Delivery y entregas parciales.

## Fase 4 · Trazabilidad y explotación

- Expediente 360 de OT.
- Búsqueda global.
- Centro documental.
- Dashboard / KPIs.
- Administración de usuarios internos.

## Dependencia principal

```text
Auth
  ↓
Customers / Memberships
  ↓
CustomerRequest
  ↓
JobCase
  ↓
Quotation
  ↓
WorkOrder
  ↓
Routing
  ↓
OperationExecution
  ↓
Quality
  ↓
Delivery
  ↓
Expediente 360
```

Documentos/versionado y trazabilidad son capacidades transversales y deben integrarse desde las primeras fases.

## Criterio de éxito

Un usuario debe poder tomar una Orden de Trabajo y reconstruir desde un único lugar:

- cliente y solicitud original;
- cotización aprobada;
- especificaciones y versiones documentales utilizadas;
- material y lote;
- operaciones ejecutadas;
- personas y máquinas involucradas;
- controles de calidad;
- no conformidades y retrabajos;
- documentación de entrega y recepción final.

## Formato recomendado de issue

Cada issue funcional debe incluir:

- objetivo;
- alcance;
- reglas de negocio;
- criterios de aceptación;
- dependencias;
- referencias a Figma 01 / 02 / 03;
- eventos de trazabilidad relevantes cuando aplique.
