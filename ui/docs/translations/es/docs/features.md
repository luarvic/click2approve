---
title: Funciones de aprobación de documentos y acceso al espacio de trabajo
description: Vea qué características de Click2Approve funcionan en espacios de trabajo personales y de organización, incluidos pasos de aprobación, firmas, equipos, plantillas y comprobantes.
---
# Funciones de aprobación de documentos y acceso al espacio de trabajo {#features-and-availability}

Click2Approve combina revisión de documentos, pasos de aprobación, firmas electrónicas y seguimiento de solicitudes. Utilice **Personal**, su espacio de trabajo para sus propias solicitudes y tareas enviadas por correo electrónico, para trabajo individual. Utilice un espacio de trabajo de la organización para flujos de trabajo empresariales compartidos. Su espacio de trabajo, función y plan determinan qué acciones puede realizar.

También puede conectar sus propias herramientas a través de Click2Approve API. Consulte [tokens API](api-tokens.md) para crear credenciales y autenticar solicitudes de integración.

!!! info "Solo organización"
    Los empleados, equipos, delegaciones y plantillas de flujo de trabajo pertenecen a organizaciones. Seleccione una organización en el selector de espacio de trabajo para usarla. Otras funciones de esta guía también están disponibles en Personal.

## Cómo funciona la aprobación de documentos {#how-document-approval-works}

1. [Crear una solicitud](create-a-request.md) con los documentos e instrucciones.
2. [Configurar pasos del flujo de trabajo](workflow-steps.md) para elegir quién actúa y en qué orden. Varias personas pueden revisar en el mismo paso.
3. Los participantes abren **Tasks** para [registrar sus decisiones](complete-a-task.md). Un paso puede requerir un comentario, una firma electrónica o un archivo de respuesta.
4. Abra **Requests** para [verificar progreso](track-requests.md). Cuando finaliza la solicitud, [comprobantes](receipts.md) conservan su resultado y las acciones registradas.

Por ejemplo, dos revisores pueden comprobar una propuesta en el primer paso. El cliente puede añadir su firma en un paso posterior. Activa **Require an electronic signature** en ese paso si necesitas una firma dibujada.

## Referencia del espacio de trabajo {#workspace-reference}

| Característica | Personal | Organización |
| --- | --- | --- |
| Requests, tareas, pasos ordenados y responsables de correo electrónico | Disponible | Disponible |
| Comentarios requeridos y firmas electrónicas | Disponible | Disponible |
| Discusiones y archivos adjuntos de discusión | Disponible | Disponible |
| Archivos adjuntos de respuesta a tareas | Disponible | Disponible |
| Solicitar revisiones | Disponible para solicitudes elegibles | Disponible para solicitudes elegibles |
| Empleados y cesionarios de empleados | — | Disponible |
| Equipos y responsables del equipo | — | Disponible |
| Delegations | — | Disponible |
| Plantillas de flujo de trabajo | — | Crea las tuyas propias y reutiliza las plantillas compartidas dentro de la organización |
| Comprobantes y enlaces de verificación | Ver, compartir y eliminar comprobantes que se le hayan emitido | Cada miembro puede ver, compartir y eliminar los comprobantes que se le hayan emitido |
| Plans, uso y retención | Administre su propio plan y configuración | Los propietarios y administradores administran el plan y la configuración |
| Profile, firma guardada, MFA, claves de acceso y tokens API | Configuración de cuenta | La misma configuración de cuenta en todos los espacios de trabajo |

## Permisos de organización {#organization-permissions}

Los miembros pueden ver los directorios de empleados, equipos y delegaciones. Los propietarios y administradores gestionan empleados, equipos, delegaciones, facturación y retención. Las plantillas son privadas de forma predeterminada; sus creadores pueden compartirlos para que otros miembros de la organización los vean y utilicen. Sólo el creador puede editar o eliminar una plantilla. El acceso a los comprobantes está limitado al usuario al que se emite cada comprobante. Solo el propietario puede programar la eliminación de la organización.

El acceso a una solicitud o tarea depende de la participación, las relaciones del equipo y la delegación. La membresía de una organización por sí sola no expone todos los flujos de trabajo ni otorga acceso a los registros de otra organización.

Consulte [Empleados y roles](employees.md) para obtener la referencia de roles y [Uso y límites](usage.md) para conocer las restricciones del plan. Abra **Plans** para conocer sus asignaciones actuales y las opciones de planes disponibles.
