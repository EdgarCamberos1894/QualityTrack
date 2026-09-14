package com.nocountry.qualitytrack.requests.documentation;

import io.swagger.v3.oas.annotations.tags.Tag;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Documented
@Tag(
        name = "05 · Expedientes",
        description = "Flujo interno de revisión de los JobCase creados a partir de solicitudes de cliente. Un expediente nace en SUBMITTED y sin responsable. Un COMMERCIAL puede tomarlo para asignárselo e iniciar la revisión, pasando a UNDER_REVIEW. Durante la revisión puede solicitar información al cliente, lo que mueve el expediente temporalmente a WAITING_CUSTOMER_INFO; cuando el cliente responde vuelve a UNDER_REVIEW. ENGINEERING puede definir la especificación técnica del material cuando corresponda. Cuando la revisión está completa y no existen pendientes, el responsable puede dejar el expediente en READY_FOR_QUOTATION. El expediente continúa existiendo como contenedor del ciclo completo; llegar a READY_FOR_QUOTATION no crea una cotización automáticamente."
)
public @interface JobCaseApiDocs {
}
