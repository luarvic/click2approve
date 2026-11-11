---
title: Configurar una organización para la aprobación de documentos
description: Cree un espacio de trabajo de organización Click2Approve, agregue empleados y equipos y configure un trabajo de aprobación compartido. Descubra quién puede administrar o eliminar la organización.
---
# Administrar organizaciones {#manage-organizations}

Una **organización** es un espacio de trabajo para aprobaciones de documentos enviados en nombre de una empresa. Tiene sus propias solicitudes, empleados, equipos, plantillas y trabajo delegado. Selecciónelo en el selector de espacio de trabajo antes de crear una solicitud o administrar su gente.

!!! info "Espacio de trabajo de organización"
    Cree o seleccione una organización para administrar el trabajo compartido. Su espacio de trabajo Personal no tiene empleados, equipos, plantillas ni delegaciones.

## Cree una organización {#create-an-organization}

1. Abra **Organizations** y comience una nueva organización.
2. Ingrese sus detalles y agregue un logotipo si es necesario.
3. Continúe con la selección de planes. Utilice **Back** para editar los detalles conservando el borrador de creación.
4. Seleccione **Choose Business Trial** o **Choose Business Pro**, luego use **Subscribe** debajo de las tarjetas para crear la organización.
5. Para un plan pago, complete el pago. El acceso al espacio de trabajo permanece restringido hasta que se verifique el pago.

La prueba Business está disponible una vez por propietario. Seleccionarlo nuevamente falla la validación. Consulte [Planes y facturación](plans-and-billing.md) para conocer el comportamiento de pago y recuperación.

## Configure el espacio de trabajo {#set-up-the-workspace}

Seleccione la organización en el selector de espacio de trabajo, luego:

- Agregue [empleados](employees.md) y elija su roles.
- Crear [equipos](teams.md) para grupos de participantes recurrentes.
- Configurar [delegaciones](delegations.md) para empleados que necesitan que alguien actúe en su nombre.
- Guardar [plantillas de flujo de trabajo](templates.md) para procesos repetibles.

Los empleados, equipos y delegados deben pertenecer a esta organización. El trabajo en otra organización permanece separado.

## Actualizar detalles de la organización {#update-organization-details}

Abra la organización desde **Organizations** para editar los detalles que su rol permite. Las imágenes de logotipos pueden tener hasta **4 MiB** (4.194.304 bytes). Mantenga el nombre y el logotipo de la empresa reconocibles para que los participantes puedan identificar la organización en el contexto de la solicitud y en las notificaciones.

## Eliminar una organización {#delete-an-organization}

Solo **Owner** puede programar la eliminación a través de **Delete organization**. Lea atentamente la confirmación. Las organizaciones programadas desaparecen de la selección del espacio de trabajo y se vuelven inaccesibles; el procesamiento en segundo plano elimina sus datos más tarde.

!!! warning "Conservar registros antes de eliminarlos"
    Programar la eliminación elimina inmediatamente el acceso a la organización. Guarde los registros que necesite antes de confirmar; el retraso de la limpieza no es una ventana de recuperación. Consulte [Retención y eliminación](retention.md).
