package com.nocountry.qualitytrack.workorders.documentation;

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
        name = "08 · Órdenes de trabajo",
        description = "Creación y consulta del trabajo operativo originado por una cotización aprobada."
)
public @interface WorkOrderApiDocs {
}
