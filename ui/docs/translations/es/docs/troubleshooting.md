---
title: Corregir tareas de aprobación faltantes y envíos fallidos
description: Encuentre solicitudes o tareas faltantes y resuelva problemas de aprobación de documentos en Click2Approve, incluidos envíos fallidos, problemas de inicio de sesión y enlaces de comprobantes vencidos.
---
# Solución de problemas de aprobación de documentos {#troubleshooting}

Si no puede encontrar una tarea de aprobación, enviar una solicitud o abrir un enlace de comprobante, comience revisando su cuenta y el espacio de trabajo seleccionado. Abra la solicitud o tarea para verificar su estado actual. Luego lea el mensaje de error de la acción que falló.

## No puedo encontrar una solicitud o tarea {#i-cannot-find-a-request-or-task}

Las tareas dirigidas por correo electrónico aparecen en **Personal**. Las asignaciones de empleados y equipos aparecen en su organización. Verifique el correo electrónico de la cuenta, el estado del empleado, la membresía del equipo y cualquier delegación. Una tarea también puede haber sido cancelada, omitida, completada, reemplazada o eliminada.

Un enlace de correo electrónico no otorga acceso a la organización. Consulte [Espacios de trabajo y navegación](workspaces.md).

Si ve **Page not found**, es posible que la página se haya movido o que no tenga acceso a ella. Seleccione **Home** para regresar, luego verifique su cuenta y espacio de trabajo.

## Falta un elemento del menú o una acción {#a-menu-item-or-action-is-missing}

Consulte [Características y disponibilidad](features.md). Los empleados, equipos, delegaciones y plantillas requieren un espacio de trabajo organizativo. Su función, plan o estado de facturación pueden ocultar o desactivar controles. Seleccione la organización correcta y solicite a un propietario o administrador que verifique su acceso.

## La aplicación se recarga después de una actualización {#the-app-reloads-after-an-update}

La aplicación se recarga automáticamente cuando detecta una nueva versión y vuelve a abrir la página actual. Es posible que se pierda el texto que no haya guardado.

## El envío o la finalización de la tarea falla {#submission-or-task-completion-fails}

Corrija los campos resaltados y proporcione todos los comentarios, firmas y archivos adjuntos requeridos. Espere a que finalicen las cargas. Marque [Uso](usage.md) si el mensaje menciona una asignación.

Actualice el recurso antes de volver a intentarlo después de un error API: es posible que otro participante o delegado ya lo haya completado. Verifique Solicitudes o Tareas para determinar si la acción original se realizó correctamente antes de repetirla.

## No puedo revisar una solicitud {#i-cannot-revise-a-request}

Reenviar está disponible solo para solicitudes elegibles sin una revisión más reciente y sin un resultado exitoso. Una nueva revisión reinicia el flujo de trabajo; las decisiones anteriores se mantienen en la revisión anterior. Consulte [Seguimiento y revisión de solicitudes](track-requests.md).

## Un enlace de verificación no funciona {#a-verification-link-does-not-work}

El enlace puede haber caducado, haberse revocado o apuntar a un comprobante eliminado. Pida un enlace vigente a la persona propietaria del comprobante. [Comprobantes y verificación](receipts.md).

## No puedo iniciar sesión ni recibir correo electrónico {#i-cannot-sign-in-or-receive-email}

Compruebe si se requiere confirmación por correo electrónico y solicite una nueva confirmación o un mensaje de restablecimiento de contraseña si es necesario. Inspeccione el spam y la dirección de su cuenta. Para MFA, pruebe con un código de recuperación no utilizado; para obtener claves de acceso, intente iniciar sesión con un dispositivo compatible registrado o con contraseña.

Revise [Registro e inicio de sesión](sign-in.md), [MFA y claves de acceso](security.md) y [Notificaciones](notifications.md).

## El espacio de trabajo está bloqueado para el pago {#the-workspace-is-blocked-for-payment}

Abra **Plans** y siga la acción de recuperación del pago antes de la fecha límite mostrada. El propietario o administrador de una organización debe gestionar los pagos de la organización. Consulta [Planes y facturación](plans-and-billing.md).

## Eliminación bloqueada {#deletion-is-blocked}

Lee el mensaje de dependencia. Otro registro aún puede hacer referencia al empleado, equipo o entidad de flujo de trabajo. Revise [Retención y eliminación](retention.md) antes de eliminar registros relacionados.

## Obtenga ayuda o informe un error {#get-help-or-report-a-bug}

Utilice los enlaces **Report a bug** o **Ask question** de la aplicación. Incluya los pasos a reproducir, el resultado esperado, el resultado real, el tiempo aproximado y el tipo de espacio de trabajo relevante. Si un error API ofrece **Details**, revise la información de diagnóstico e incluya solo lo que sea apropiado para el canal de soporte.

Mantenga las contraseñas, los tokens API, los códigos de recuperación, los enlaces de verificación y los documentos privados fuera de los informes públicos. Si tiene problemas con la cuenta, el correo electrónico, la seguridad o la facturación, comuníquese con el soporte.
