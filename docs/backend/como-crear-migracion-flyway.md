# Cómo crear una migración Flyway

Esta guía sirve cuando una issue necesita cambiar la estructura de la base de datos.

## 1. Revisa las migraciones existentes

Busca la carpeta:

```text
backend/src/main/resources/db/migration
```

Identifica cuál es la última migración disponible.

Ejemplo:

```text
V1__create_auth_schema.sql
V2__create_customers.sql
```

Si la última es `V2`, la siguiente normalmente será `V3`.

## 2. No modifiques una migración que ya fue aplicada

Si una migración ya forma parte de `develop`, no la edites para agregar cambios nuevos.

Crea otra migración.

Ejemplo:

```text
V3__extend_user_system_roles.sql
```

El nombre debe explicar brevemente qué cambia.

## 3. Escribe solamente el cambio necesario

La nueva migración debe modificar únicamente lo que pide la issue.

Ejemplos de operaciones comunes:

```sql
ALTER TABLE ...
ADD COLUMN ...;
```

```sql
CREATE TABLE ...;
```

```sql
CREATE INDEX ...;
```

No vuelvas a crear tablas que ya existen.

## 4. Levanta el proyecto

Ejecuta el backend y comprueba que Flyway aplica la nueva migración sin errores.

Si trabajas con Docker, también puedes levantar el entorno configurado por el proyecto.

## 5. Comprueba el resultado

Verifica que:

- la aplicación inicia correctamente;
- la migración aparece como aplicada;
- la estructura resultante coincide con lo pedido en la issue;
- las pruebas relacionadas siguen pasando.

## Si algo falla

No agregues otra migración solo para esconder un error de una migración que todavía estás desarrollando en tu propia rama.

Corrige primero tu migración antes de hacer el Pull Request.

Si la migración defectuosa ya fue integrada y utilizada por el equipo, entonces no la reescribas: crea una nueva migración correctiva.

## Recuerda

```text
Una migración ya compartida = no se reescribe.
Un cambio nuevo              = nueva migración.
```
