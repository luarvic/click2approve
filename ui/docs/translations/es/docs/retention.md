---
title: Retención y eliminación de registros de aprobación
description: Descubra durante cuánto tiempo Click2Approve guarda solicitudes, comprobantes y archivos. Revise la configuración de retención y lo que sucede cuando elimina un registro u organización.
---
# Retención y eliminación {#retention-and-deletion}

Elija cuánto tiempo desea conservar las solicitudes, comprobantes y notificaciones en cada espacio de trabajo. Los controles de eliminación dependen del recurso y sus permisos.

## Establecer retención {#set-retention}

1. Seleccione el espacio de trabajo y abra **Retention**.
2. Revise los períodos **Requests**, **Receipts** y **Notifications** en planes gratuitos y de prueba, o **Requests and receipts** y **Notifications** en planes pagos. Los valores intermedios del control deslizante aparecen en una pequeña burbuja sobre el control del deslizador; los puntos finales son **1 month** y **Never delete**.
3. Si su plan y sus permisos permiten cambios, elija un período para cada uno y seleccione **Save**.

Los usuarios de Personal gestionan sus propios ajustes; los propietarios y administradores gestionan los de su organización. En Personal Free y Business Trial, las solicitudes y notificaciones se conservan un mes. Los comprobantes se conservan cinco años en Personal Free y un mes en Business Trial, desde su creación. Los planes de pago permiten configurar **Requests and receipts** y **Notifications**, incluida la opción **Never delete**.

Cuando la prueba gratuita o comercial de Personal se activa, ambos períodos cambian automáticamente a un mes, incluida una configuración previa **Never delete**. Una degradación programada mantiene su configuración de retención actual hasta que finalice el período de pago. Las solicitudes y notificaciones de más de un mes son elegibles para la limpieza de antecedentes. La limpieza de comprobantes sigue el período de recepción del plan actual, incluidos los comprobantes existentes; actualizar antes de la limpieza puede extender su retención.

!!! warning "La retención no es una copia de seguridad"
    Los registros se pueden eliminar mediante una limpieza en segundo plano después de su período de retención. Elija una política que respalde sus necesidades de mantenimiento de registros antes de acumular un historial de flujo de trabajo importante.

## Recordatorios de retención {#retention-reminders}

Antes de que las solicitudes y comprobantes alcancen su fecha límite de retención, sus propietarios reciben
**Retention deletion reminders**. El plazo de notificación estándar es de una semana. Cada
recordatorio identifica el registro afectado y su fecha de eliminación. Los correos electrónicos enlazan con ese registro, la configuración de retención del espacio de trabajo y esta guía.
Los recordatorios de solicitudes van al solicitante; los recordatorios de comprobante van únicamente al propietario del comprobante.
Cada solicitud o comprobante genera un recordatorio; cambiar su fecha límite de retención
no restablece ese recordatorio.

Administre la entrega de **In-app** y **Email** en **User profile → Notifications → Retention deletion reminders**.
Ambos comienzan habilitados. Deshabilitar los recordatorios no deshabilita la limpieza de retención. Para
conservar los registros por más tiempo, cambie el período de retención si su plan y sus permisos
lo permiten, o comuníquese con el propietario o administrador de su organización.
Los recordatorios por correo electrónico utilizan [tokens de correo electrónico de notificación](usage.md) y requieren suficientes
tokens en el espacio de trabajo.

Los recordatorios siguen sus preferencias de notificación y los reintentos de entrega normales.
La limpieza de retención sigue su programación configurada incluso si un recordatorio está deshabilitado
o no se puede entregar. Los recordatorios se aplican a la retención automática de solicitudes y comprobantes;
limpieza de notificaciones, eliminación manual, eliminación de organizaciones y limpieza
relacionada con pagos siguen sus propias reglas.

## Eliminar registros individuales {#delete-individual-records}

Utilice la acción de eliminación ofrecida para una solicitud, tarea, comprobante, empleado, equipo, plantilla o delegación sólo cuando tenga la intención de eliminar ese registro. Lea la confirmación y cualquier mensaje de validación.

Solo el propietario de un comprobante puede eliminarlo manualmente. La eliminación manual y la limpieza de retención eliminan el comprobante y sus enlaces de verificación juntos. Eliminar su comprobante no elimina la solicitud original ni los comprobantes de otros participantes. Eliminar la solicitud original no elimina sus comprobantes.

Una relación de otro registro puede evitar la eliminación. Resolver la relación identificada en su caso. Los reintentos repetidos no eliminan la dependencia.

Una solicitud con una revisión más reciente no se puede eliminar mientras esa revisión haga referencia a ella. Comience con la última revisión al eliminar una cadena de revisiones. Limpieza de horarios de eliminación; espere a que se elimine esa revisión antes de volver a intentar su predecesor.

Eliminar una solicitud la hace inmediatamente elegible para la limpieza en segundo plano, independientemente de su antigüedad. Los tokens consumidos previamente no se reembolsan.

Los comprobantes conservan los metadatos y los hashes de los archivos sin extender la retención de los archivos adjuntos. Eliminar un comprobante no elimina ni programa la limpieza de sus archivos adjuntos originales.

Los archivos asociados con registros de flujo de trabajo eliminados se pueden programar para una limpieza posterior, por lo que es posible que su contenido almacenado y su uso no desaparezcan inmediatamente. Los avatares de perfil y los logotipos de la organización se pueden eliminar inmediatamente cuando se reemplazan o eliminan.

## Eliminar una organización {#delete-an-organization}

!!! warning "La eliminación de la organización elimina el acceso inmediatamente"
    Solo el propietario puede programar la eliminación de la organización. La organización desaparece inmediatamente de la selección del espacio de trabajo y se vuelve inaccesible; el procesamiento en segundo plano elimina sus datos más tarde. Conserve los registros requeridos antes de confirmar. El retraso en la limpieza no es una opción de recuperación.

## Eliminación relacionada con pagos {#payment-related-removal}

La suspensión de pagos tiene su propia fecha límite. Resolver pagos fallidos a través de [Planes](plans-and-billing.md) antes de esa fecha límite. La caducidad elimina las organizaciones empresariales; Los espacios de trabajo Personal pierden datos de flujo de trabajo y regresan a Personal Free conservando la identidad y el perfil. Una configuración de retención no anula este proceso de recuperación de facturación.
