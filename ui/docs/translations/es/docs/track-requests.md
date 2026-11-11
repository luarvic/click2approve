---
title: Realice un seguimiento del estado de aprobación y revise las solicitudes
description: Verifique el estado de aprobación del documento en Solicitudes. Vea decisiones registradas, cancele trabajos activos o utilice Volver a enviar para iniciar una solicitud elegible con archivos revisados.
---
# Seguimiento del estado de aprobación y revisión de solicitudes {#track-and-revise-requests}

Para verificar el estado de aprobación de un documento, abra **Requests** en el espacio de trabajo propietario de la solicitud. Utilice **Personal**, su espacio de trabajo para sus propias solicitudes, para el trabajo que envió personalmente. Para el trabajo enviado en nombre de una organización, seleccione esa organización.

Utilice los filtros disponibles para encontrar la solicitud y luego abra sus detalles para revisar archivos, pasos, participantes y acciones registradas. Para las acciones que se le hayan asignado, abra **Tasks** en su lugar; consulte [Completar una tarea](complete-a-task.md).

## Leer el progreso y los resultados {#read-progress-and-outcomes}

Los pasos del flujo de trabajo aparecen debajo del resumen de la solicitud. El encabezado de cada paso muestra su número y acción, como **Step 1 · Approve**. Expanda el encabezado para ver la regla de finalización, la visibilidad, los requisitos y los asignados originales. Los íconos de asignado identifican equipos, empleados y direcciones de correo electrónico. Las tarjetas de tareas permanecen visibles cuando contraes los detalles de los pasos.

Expande una tarea para ver **Assigned via** si proviene de una tarea de equipo. Un **Upcoming task** muestra a alguien cuya tarea aún no ha comenzado.**From organization**, cuando se muestra en una tarea, nombra su organización registrada. Personal es un espacio de trabajo, no una organización.

El chip de estado en el encabezado de cada solicitud o tarjeta de tarea muestra su estado actual, incluso cuando la tarjeta está colapsada.

| Estado | Significado |
| --- | --- |
| Pending | El trabajo enviado está esperando para progresar |
| Started | El flujo de trabajo está en curso |
| Completed — Succeeded | El flujo de trabajo se completó correctamente |
| Completed — Failed | El flujo de trabajo se completó con un resultado incorrecto |
| Canceled | La solicitud fue detenida |
| Superseded | Una revisión más reciente reemplazó esta solicitud |

Las acciones de tareas individuales pueden tener etiquetas más específicas, como Firmado o Rechazado. Una tarea omitida no significa que el participante haya tomado una decisión; Es posible que otro resultado ya haya resuelto el paso. Las solicitudes completadas automáticamente y las tareas omitidas o canceladas muestran su estado y tiempo de finalización sin un campo **Completed by**.

## Cancelar una solicitud {#cancel-a-request}

Abra una solicitud pendiente o iniciada que esté autorizado a administrar, elija **Cancel request** y confirme. La cancelación detiene el flujo de trabajo. Vuelva a abrir la solicitud para verificar su estado final antes de comunicarse con los participantes.

## Revisar y volver a enviar {#revise-and-resubmit}

Revisar las solicitudes elegibles en Personal o en una organización.

Por ejemplo, un revisor puede elegir **Request changes** y explicar que una propuesta tiene un precio incorrecto. Utilice **Resubmit** para reemplazar la propuesta e iniciar una nueva revisión. Agregar un archivo a [Chat](discussions.md) no reemplaza los archivos de revisión actuales de la solicitud.

1. Abra una solicitud elegible y elija **Resubmit**.
2. Revise los archivos, las instrucciones y los pasos del flujo de trabajo de la revisión anterior.
3. Actualice los archivos, instrucciones y pasos para la nueva revisión.
4. Verifique los participantes y elija **Submit**.

El nuevo envío crea una nueva revisión y reemplaza la solicitud anterior. La acción se ofrece solo en solicitudes elegibles pendientes, iniciadas o completadas que no tuvieron éxito y no tienen una revisión más reciente. Una solicitud completada exitosamente no se puede volver a enviar a través de esta acción.

La nueva revisión comienza su flujo de trabajo desde el primer paso. Las decisiones anteriores quedan registradas en la revisión anterior y sus comprobantes; no completan tareas en la nueva revisión. Revise cada paso y participante antes de volver a enviar.

Utilice **Show revision changes**, cuando esté presente, para inspeccionar archivos agregados, reemplazados y eliminados. Los archivos reemplazados o eliminados permanecen en el contexto de la revisión y no forman parte de los archivos actuales que se van a revisar.

## Preservar el resultado {#preserve-the-result}

[Comprobantes](receipts.md) registra el resultado de la solicitud y las acciones registradas de cada participante, sujeto a la visibilidad de los pasos. Se crean cuando una solicitud se completa, se cancela o se reemplaza por una nueva revisión. Revise [retención y eliminación](retention.md) antes de eliminar una solicitud o confiar en el acceso a largo plazo.

Una revisión más reciente evita la eliminación de la solicitud a la que hace referencia. Programe primero la eliminación de la última revisión y luego espere a que se limpie el fondo antes de eliminar su predecesora. Eliminar una solicitud no elimina los comprobantes de los participantes.
