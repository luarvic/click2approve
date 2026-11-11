---
title: Crear una solicitud de aprobación de documento
description: Enviar documentos para aprobación en Click2Approve. Agregue archivos, elija revisores, establezca pasos de flujo de trabajo y envíe una solicitud desde Personal o una organización.
---
# Crear una solicitud de aprobación de documento {#create-a-request}

Para enviar un documento para su aprobación, cree una **solicitud**. Contiene los archivos para revisar, instrucciones y pasos que le indican a cada participante qué hacer. Puede solicitar aprobación, revisión o firma electrónica.

Elija primero el espacio de trabajo correcto. Utilice **Personal**, su espacio de trabajo para sus propias solicitudes, para enviar trabajos en su propio nombre. Seleccione una organización para enviar trabajo en su nombre. Su espacio de trabajo determina quién es el propietario de la solicitud y qué tipos de asignados puede utilizar. Un **asignado** es una persona o equipo a quien usted solicita que actúe en un paso.

## Redacte la solicitud {#compose-the-request}

1. [Abra la aplicación](/app/), seleccione su espacio de trabajo y elija **New request** en la parte superior del grupo **Work** en el menú principal.
2. En una organización, elija **Custom** o **From template**. Para una plantilla, selecciónela y continúe con el editor de solicitudes.
3. Ingrese un **Title** específico, como "Aprobar el acuerdo de proveedor actualizado".
4. Agregue un **Description** que explique el propósito, el contexto y el resultado esperado.
5. Adjunte los [archivos que los participantes deben revisar](files.md).
6. Agregue y configure los [pasos del flujo de trabajo](workflow-steps.md).

La tarjeta **Request details** agrupa el título,**Files to review** y la descripción. Configure los pasos del flujo de trabajo a continuación.

Las solicitudes Personal utilizan asignados de correo electrónico.

!!! info "Asignados de la organización"
    En una organización, también puede asignar pasos a los empleados y equipos de esa organización.

## Ejemplo: enviar una propuesta para su aprobación. y firma {#example-send-a-proposal-for-approval-and-signature}

1. Agregue la propuesta en **Files to review**.
2. Agregue un paso con **Action** establecido en **Approve** y luego agregue la dirección de correo electrónico del revisor.
3. Elija **Add step** y establezca su **Action** en **Sign**. Agregue la dirección de correo electrónico del cliente y habilite **Require an electronic signature**.
4. Escribe **Instructions** para cada paso para que ambas personas sepan qué verificar.

El cliente recibe una tarea después de que el paso de aprobación sea exitoso. Si varias personas necesitan aprobar primero, agréguelas al paso de aprobación y habilite **All assignees must complete**. Consulte [Configurar pasos del flujo de trabajo](workflow-steps.md) para conocer las reglas de finalización.

## Revise y envíe {#review-and-submit}

Verifique los archivos, el orden de los pasos, la acción, las instrucciones, los participantes, la regla de finalización, la visibilidad y los requisitos adicionales. Si necesita una firma dibujada, marque **Require an electronic signature**; elegir la acción **Sign** por sí sola no la habilita. Luego elija **Submit** y espere la confirmación antes de abandonar la página.

Si los campos están resaltados, corríjalos y envíelos nuevamente. Si el límite de un plan bloquea el envío, inspeccione [Uso](usage.md) o solicite ayuda al propietario o administrador de la organización.

Si el nombre del empleado de su organización está incompleto, una advertencia explica cómo aparecerá en el registro. Elija **Go back** para corregirlo o **Proceed anyway** para enviarlo con el nombre actual. Los detalles de los empleados de la organización se administran por separado de su perfil personal.

Al redactar una solicitud personalizada para una nueva organización, **Save template** crea una plantilla privada a partir del título, la descripción y los pasos. Aplica las reglas de validación de la plantilla y no reemplaza el envío de la solicitud. Las solicitudes iniciadas a partir de plantillas y revisiones de solicitudes no ofrecen esta acción. Consulte [Plantillas de flujo de trabajo](templates.md).

## Después del envío {#after-submission}

Abra **Requests** y seleccione la solicitud para seguir su progreso. Los participantes actúan a medida que el flujo de trabajo llega a sus pasos. La entrega de notificaciones sigue las preferencias de cada destinatario.

Utilice [Seguimiento y revisión de solicitudes](track-requests.md) para comprender los resultados, las cancelaciones y las revisiones. Salir o cancelar la pantalla de redacción descarta las ediciones sin pedir confirmación. Los borradores de solicitudes no se guardan.
