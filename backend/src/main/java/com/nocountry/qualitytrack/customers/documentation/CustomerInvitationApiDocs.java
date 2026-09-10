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
        name = "Invitaciones de empresa",
        description = "Flujo para incorporar personas a una empresa cliente mediante invitaciones por correo. La empresa crea una invitación independiente de la membresía; el acceso solo se activa cuando la persona acepta correctamente. Los endpoints de administración requieren una membresía ADMIN activa, mientras que la revisión y aceptación se realizan con el token de invitación enviado por correo."
)
public @interface CustomerInvitationApiDocs {
}
