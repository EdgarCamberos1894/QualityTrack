package com.nocountry.qualitytrack.customers.documentation;

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
        name = "Empresas cliente",
        description = "Operaciones para crear y administrar empresas cliente y consultar sus miembros activos. La autenticación identifica al usuario, pero el acceso a una empresa concreta depende de que conserve una membresía ACTIVE en ella. Algunas operaciones, como editar la empresa o retirar miembros, requieren además rol ADMIN dentro de esa empresa."
)
public @interface CustomerApiDocs {
}
