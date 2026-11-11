---
title: Gestionar empleados y roles del espacio de trabajo
description: Agregue empleados a una organización Click2Approve y administre sus funciones y acceso. Compare los permisos de usuario, administrador y propietario para los flujos de trabajo de aprobación.
---
# Gestionar empleados y roles del espacio de trabajo {#employees-and-roles}

Los empleados conectan cuentas de usuario a una organización y proporcionan las identidades utilizadas para las asignaciones y registros de auditoría.

!!! info "Solo organización"
    Seleccione una organización para ver sus empleados. Los propietarios y administradores pueden agregar empleados y administrar su acceso.

## Agregar un empleado {#add-an-employee}

Los propietarios y administradores pueden abrir **Employees**, iniciar un nuevo empleado e ingresar su correo electrónico, nombre, puesto, función y equipos. Guarde al empleado y luego verifique su estado.

El correo electrónico identifica la cuenta que debe recibir acceso del empleado. Compruébalo antes de guardar. El nombre de la organización y el puesto de un empleado pueden diferir de su perfil personal.

Un empleado cuyo correo electrónico aún no se ha registrado inicia **Pending**. El registro con ese correo electrónico activa la membresía. Agregar una cuenta ya registrada crea un empleado **Active**.

## Roles {#roles}

| Rol | Permisos de organización |
| --- | --- |
| User (member) | Participe en flujos de trabajo autorizados, vea directorios de empleados, equipos y delegaciones, y administre sus propias plantillas |
| Admin | Gestionar empleados, equipos, delegaciones, facturación y retención |
| Owner | Gestión administrativa más la autoridad para programar la eliminación de la organización |

Los roles no otorgan acceso a otras organizaciones. La visibilidad de solicitudes y tareas también sigue a la participación, las relaciones de equipo y la delegación. Las plantillas son privadas de forma predeterminada y se pueden compartir para que otros miembros de la organización las vean y las utilicen. Solo el creador de la plantilla puede editarla o eliminarla, incluso cuando otro miembro es propietario o administrador.

El acceso al comprobante sigue la propiedad del comprobante, independientemente del rol del empleado. Los propietarios y administradores pueden ver, compartir y eliminar únicamente los comprobantes emitidos a ellos mismos. Consulte [Comprobantes y verificación](receipts.md).

## Estado del empleado {#employee-status}

| Status | Significado |
| --- | --- |
| Pending | La membresía aún no se ha activado |
| Active | El acceso de los empleados está activo |
| Disabled | El acceso de los empleados ha sido deshabilitado |

Los propietarios y administradores pueden editar los detalles de los empleados permitidos, las membresías del equipo y la configuración **Active**. Deshabilitar el acceso es útil cuando una persona ya no debe actuar para la organización.

## Eliminar un empleado {#remove-an-employee}

Utilice la acción de eliminación disponible solo cuando el empleado deba ser eliminado. Las referencias existentes pueden impedir su eliminación; lea el mensaje de validación y resuelva la relación relevante primero. Deshabilitar el acceso puede ser apropiado cuando las relaciones históricas deben permanecer.

Antes de cambiar la membresía, revise los [equipos](teams.md) y las [delegaciones](delegations.md) que dependen de ese empleado.
