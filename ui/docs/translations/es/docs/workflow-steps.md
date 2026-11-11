---
title: Configurar los pasos del flujo de trabajo de aprobación de documentos
description: Configure los pasos de aprobación en orden o permita que varios revisores actúen en un solo paso. Elija todos o cualquier cesionario, firmas requeridas, comentarios y archivos adjuntos.
---
# Configurar los pasos del flujo de trabajo de aprobación de documentos {#configure-workflow-steps}

Un flujo de trabajo de aprobación define quién actúa en un documento y en qué orden. Un **asignado** es una persona o equipo asignado a un paso. Los pasos se suceden uno tras otro. Varios asignados pueden actuar en el mismo paso.

Utilice **Add step** para crear otro paso, los controles de flecha para cambiar su orden y el botón Quitar para eliminarlo.

## Aprobaciones secuenciales y paralelas {#sequential-and-parallel-approvals}

Utilice pasos separados cuando una decisión debe preceder a otra. Esta es una **aprobación secuencial**. Por ejemplo, un revisor aprueba una propuesta en el paso 1 y luego un cliente inicia sesión en el paso 2.

Coloque a las personas en el mismo paso cuando puedan revisar al mismo tiempo. Esta es una **aprobación paralela** dentro de ese paso. Los pasos todavía se ejecutan en orden.

| Necesitas… | Configure el flujo de trabajo de esta manera |
| --- | --- |
| Un crítico, seguido de otro | Agregue un paso separado para cada revisor |
| Dos revisores que deben aprobar ambos | Agregue ambos a un paso y habilite **All assignees must complete** |
| Aprobación de cualquiera de varias personas | Agréguelos a un paso y deje **All assignees must complete** deshabilitado |
| Aprobación seguida de firma dibujada | Agregue un paso **Approve**, luego un paso **Sign** con **Require an electronic signature** habilitado |

## Elija una acción y participantes {#choose-an-action-and-participants}

En cada paso, elige una **Action** y escribe **Instructions** claras. Las acciones disponibles son Approve, Sign, Confirm, Acknowledge, Review, Verify, Accept y Complete. Elige la que corresponda a la decisión que quieres registrar.

Agregue personas asignadas por correo electrónico y verifique los nombres y direcciones mostrados antes de enviarlas.

!!! info "Asignados de la organización"
    En una organización, seleccione **Employee** o **Team** para asignar el trabajo. dentro de la organización actual. Estos tipos de asignados no están disponibles en Personal.

## Requerir que todos o cualquier asignado {#require-everyone-or-any-assignee}

Habilite **All assignees must complete** para solicitar una respuesta exitosa de cada asignado. Con esta opción desactivada, una respuesta exitosa completa el paso y omite las demás tareas pendientes. El cambio aparece cuando un paso tiene varios asignados o una tarea de equipo.

Una decisión negativa detiene la solicitud con un resultado incorrecto, incluso cuando **All assignees must complete** está deshabilitado. La opción no permite que otros asignados anulen un rechazo.

Por ejemplo, utilice un paso para dos revisores que deben actuar ambos, seguido de un paso de firma independiente. Utilice la opción de cualquier asignado cuando un participante disponible pueda brindar la decisión requerida.

## Requisitos adicionales {#additional-requirements}

Las secciones **Additional requirements** y **Visibility** permanecen visibles en cada paso mientras se crea o revisa una solicitud o se edita una plantilla. Revise su configuración antes de guardar o enviar.

Habilite los requisitos que el participante debe cumplir:

- **Require a comment** para recopilar una explicación.
- **Require an electronic signature** para recopilar detalles de firma y una firma dibujada.
- **Require an attachment** para recopilar un archivo de respuesta.

La etiqueta de acción y el requisito de firma electrónica son configuraciones independientes. Habilite el requisito de firma cuando se necesite una firma dibujada. Revise los requisitos junto con la acción seleccionada para que los participantes sepan qué ofrecer. Consulte [Completar una tarea](complete-a-task.md).

## Visibilidad del paso {#step-visibility}

El solicitante y los asignados directos de un paso siempre pueden ver ese paso, incluidos los asignados por correo electrónico. **Visibility** controla quién más puede ver sus detalles y los archivos adjuntos de respuesta:

| Configuración | Audiencia adicional |
| --- | --- |
| All participants | Participantes con acceso a la solicitud |
| Assignees and organization participants | Participantes de la organización; disponible para flujos de trabajo de la organización |
| Assignees only | No hay participantes adicionales |

Las asignaciones de correo electrónico permanecen en el espacio de trabajo Personal del destinatario, incluso cuando su correo electrónico pertenece a un empleado de la organización. Los pasos asignados permanecen visibles en el flujo de trabajo, disponibles para el chat de pasos y se incluyen en el comprobante del destinatario.

Estas configuraciones no otorgan membresía en el espacio de trabajo ni acceso a solicitudes no relacionadas. Elija una configuración restringida cuando otros participantes no necesiten los detalles del paso.

## Revisiones {#revisions}

Al [volver a enviar una solicitud](track-requests.md), revise y edite los pasos para la nueva revisión. Su flujo de trabajo comienza nuevamente desde el primer paso; Las decisiones anteriores quedan registradas en la revisión anterior y en sus comprobantes. Para los flujos de trabajo de la organización que se utilizan con frecuencia, guarde los pasos como una [plantilla](templates.md).
