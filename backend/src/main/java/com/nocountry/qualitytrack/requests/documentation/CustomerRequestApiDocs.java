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
        name = "04 · Solicitudes de cliente",
        description = "Operaciones disponibles desde la perspectiva de la empresa cliente. Aquí se envía la CustomerRequest, se consultan sus datos y documentos, y se responden las aclaraciones que el equipo interno solicite durante la revisión del JobCase. El cliente describe qué necesita y aporta información; no controla directamente los estados internos del expediente."
)
public @interface CustomerRequestApiDocs {
}
