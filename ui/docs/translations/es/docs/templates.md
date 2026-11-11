---
title: Reutilizar plantillas de flujo de trabajo de aprobación de documentos
description: Guarde los pasos de aprobación y los participantes como una plantilla en una organización. Inicie nuevas solicitudes desde sus plantillas y revise los archivos y los asignados cada vez.
---
# Reutilice las plantillas de flujo de trabajo de aprobación de documentos {#workflow-templates}

Utilice plantillas de flujo de trabajo cuando envíe documentos a través del mismo proceso de aprobación con frecuencia. Una plantilla guarda los pasos de la solicitud y los participantes dentro de una organización. Los documentos actuales se agregan al crear cada solicitud.

Por ejemplo, guarde un paso de revisión de propuesta seguido de un paso de firma. Reutilice esos pasos para la siguiente propuesta y luego verifique los revisores, el firmante y los archivos antes de enviarlos.

Cada plantilla pertenece a la persona que la crea. Las plantillas son privadas de forma predeterminada. Seleccione **Shared** para permitir que otros miembros activos de la misma organización vean y utilicen una plantilla. Solo su creador puede editarlo o eliminarlo, incluso cuando otro miembro es propietario o administrador.

!!! info "Solo organización"
    Seleccione una organización para crear y reutilizar plantillas de flujo de trabajo. Las plantillas pertenecen a esa organización y no están disponibles en Personal.

## Crear una plantilla {#create-a-template}

Abra **Templates** en la organización y cree una plantilla con un nombre descriptivo y pasos reutilizables. Configure acciones, instrucciones, asignados, reglas de finalización, visibilidad y requisitos adicionales, luego guárdelos.

Seleccione **Shared** si otros miembros de la organización deben reutilizarlo. Déjelo sin marcar para mantener la plantilla privada. La lista de plantillas muestra **Shared** y **Owner** para que pueda identificar los flujos de trabajo disponibles y sus creadores.

Los nombres de las plantillas compartidas deben ser únicos dentro de la organización. Los nombres de las plantillas privadas deben ser únicos entre sus propias plantillas privadas en esa organización. Puede poseer tanto una plantilla compartida **Budget** como una plantilla privada **Budget**. Cambiar el nombre de una plantilla o cambiar **Shared** también debe cumplir estas reglas.

Al crear una solicitud nueva en una organización sin usar una plantilla, **Save template** crea una plantilla privada a partir de su título, descripción y pasos. Aplica las mismas reglas de validación de plantillas y no sobrescribe una plantilla existente. Si el título entra en conflicto con uno de los nombres de su plantilla privada, elija un título diferente antes de guardar. Revise lo que guarda: una plantilla de flujo de trabajo almacena la configuración de pasos en lugar de una solicitud completa o sus decisiones registradas.

## Iniciar una solicitud desde una plantilla {#start-a-request-from-a-template}

1. Elija **New request** en la misma organización.
2. Seleccione **From template**, elija una de sus plantillas o una plantilla de organización compartida y continúe.
3. Ingrese el título de la solicitud, la descripción y los documentos actuales.
4. Revise cada participante y paso antes de elegir **Submit**.

Las plantillas proporcionan una configuración inicial. Verifique que los empleados y equipos sigan siendo apropiados para la nueva solicitud. No asuma que una plantilla proporciona los archivos para una transacción en particular.

El selector agrupa **Private templates** y **Shared templates** por separado. Elija el nombre del grupo apropiado cuando ambos contengan una plantilla con el mismo nombre.

El editor carga la plantilla antes de comenzar a editar. Su nombre y descripción proporcionan el texto de solicitud inicial; cámbielos para la solicitud actual antes de enviarla.

## Mantenga las plantillas {#maintain-templates}

Abra **Templates** para actualizar sus instrucciones recurrentes y opciones de participantes. Cualquier miembro activo de la organización puede crear y administrar sus propias plantillas. Editar una plantilla no cambia las solicitudes que ya se han enviado.

Las plantillas compartidas por otros miembros se abren en una vista de solo lectura. Pídale al creador que actualice la plantilla cuando sea necesario cambiar sus pasos reutilizables. Al borrar **Shared** se elimina el acceso de otros miembros a la plantilla; las solicitudes ya creadas a partir de él mantienen su flujo de trabajo copiado.**Save template** está disponible solo para nuevas solicitudes personalizadas. Para cambiar una plantilla existente, utilice **Templates**. Las solicitudes iniciadas a partir de una plantilla y las revisiones de solicitudes no ofrecen **Save template**.

Elimine las plantillas no utilizadas con la acción de eliminación disponible. Si una referencia bloquea la eliminación, siga el mensaje de validación en lugar de volver a intentarlo repetidamente.
