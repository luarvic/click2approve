---
title: Comprobantes de aprobación y verificación de archivos de documentos.
description: Abrir un registro de decisiones de aprobación de documentos y firmas. Comparta un comprobante a través de un enlace de verificación y verifique si un archivo coincide con la copia grabada.
---
# Comprobantes de aprobación y verificación de archivos de documentos {#receipts-and-verification}

Un **comprobante** es un registro que Click2Approve crea cuando finaliza una solicitud. Conserva los detalles de la solicitud, el resultado y las acciones registradas de los participantes, incluidas las firmas cuando se proporcionen. Úselo para ver quién actuó y qué resultado se registró.

Puede compartir un comprobante a través de un enlace de verificación. La persona con el enlace puede revisar el registro y verificar si su copia de un documento coincide con un archivo registrado en el comprobante.

!!! info "¿Quién puede administrar los comprobantes?"
    Solo el usuario para quien se emite un comprobante puede abrirlo o eliminarlo en el espacio de trabajo y administrar sus enlaces de verificación. Esto aplica tanto en Personal como en organizaciones; Los propietarios y administradores no pueden abrir los comprobantes de otras personas a través de su función.

El solicitante y cada persona que haya recibido una tarea obtienen un comprobante cuando la solicitud se completa, se cancela o se sustituye por una nueva revisión. Se genera uno por persona, espacio de trabajo y revisión de la solicitud, aunque tenga varias tareas o también sea el solicitante. No hace falta completar la tarea para recibirlo: el estado registrado distingue la asignación de la acción realizada. Los pasos que no llegaron a crear tareas no generan comprobantes para sus destinatarios.

## Abrir un comprobante {#open-a-receipt}

Abra **Receipts** en el espacio de trabajo donde envió la solicitud o completó su tarea, luego seleccione el comprobante para esa solicitud. El encabezado de la tarjeta **Receipt** incluye su número corto, la solicitud coincidente y los encabezados de la tarjeta de tarea. La tarjeta muestra su identificación completa y fecha, seguidas de las secciones **Request** y **Task** con los detalles registrados, los resultados, los participantes, las acciones y las firmas, cuando estén presentes.

Los encabezados de las secciones **Request** y **Task** incluyen sus números cortos tanto en los comprobantes del espacio de trabajo como en las páginas de verificación compartida. Los ID completos de las solicitudes y tareas permanecen en los detalles registrados cuando están disponibles.

Las fechas de recepción utilizan su fecha y hora locales sin segundos. Los campos vacíos y el primer número de revisión están ocultos.

Al imprimir, las secciones Solicitud y Tarea pueden continuar en todas las páginas. Los títulos de las secciones permanecen en su primera fila, y las filas de detalles individuales y las firmas permanecen juntas cuando caben en una página.

Un comprobante conserva el contexto registrado del trabajo completado. La visibilidad específica de los participantes puede limitar los pasos incluidos en un comprobante. Un comprobante es independiente de la solicitud en vivo.

## Cree un enlace de verificación {#create-a-verification-link}

1. Abra un comprobante que pueda administrar.
2. Seleccione **Share**.
3. Elija **New link**, configure **Expires** y cree el enlace.
4. Seleccione el enlace creado en la lista para abrir su URL de verificación, luego cópielo y compártalo con el destinatario deseado.

El código QR dentro de la tarjeta de comprobante abre el mismo enlace de verificación. Seleccione el logotipo Click2Approve o el nombre de la marca encima de la tarjeta para abrir la página de inicio.

!!! warning "Cualquier persona con el enlace puede ver el comprobante"
    Un enlace de verificación activo abre el comprobante sin necesidad de ser miembro del espacio de trabajo. Revíselo antes de compartirlo: su contenido puede incluir nombres, decisiones y firmas.

## Verificar un archivo {#verify-a-file}

Abra un comprobante en su espacio de trabajo o un enlace de verificación activo y elija **Verify file**. Seleccione su copia del documento. Su navegador calcula su **SHA-256 hash**, un valor basado en el contenido del archivo. Click2Approve compara ese valor con los hashes registrados en el comprobante y muestra si el archivo coincide con un archivo de solicitud o el archivo adjunto de respuesta de un participante. Esta verificación lee el archivo seleccionado en el navegador; no carga esa copia.

Por ejemplo, si alguien le envía una propuesta aprobada y su enlace de comprobante, abra el enlace y use **Verify file** para verificar la propuesta. Un archivo con contenido modificado no coincidirá con el hash grabado, incluso si su nombre de archivo es el mismo.

El resultado aparece arriba de **Verify file**. **File verified** identifica el archivo adjunto coincidente y su solicitud o tarea.**File does not match** significa que ningún archivo grabado tiene el mismo hash. Comprueba que has seleccionado la versión correcta y vuelve a intentarlo.

La verificación utiliza los metadatos del archivo y los hashes conservados en el comprobante. Todavía funciona después de que se hayan eliminado los archivos adjuntos originales; conservar un comprobante no conserva los archivos adjuntos almacenados.

Una coincidencia confirma que el contenido del archivo coincide con un archivo grabado. No evalúa las afirmaciones del documento ni verifica de forma independiente la identidad del firmante.

## Dejar de compartir {#stop-sharing}

En **Share**, seleccione el enlace, elija **Remove** y confirme cuando ya no sea necesario el acceso. Un enlace caducado o revocado ya no proporciona el comprobante. Crear otro enlace no extiende la caducidad de un enlace existente.

Si la verificación falla, solicite al propietario del comprobante un enlace actual. Los enlaces de verificación públicos brindan acceso a ese comprobante, no a las solicitudes, tareas o directorios de la organización.

## Retención de comprobantes {#receipt-retention}

La limpieza en segundo plano elimina los comprobantes y sus enlaces de verificación de acuerdo con la [política de retención del espacio de trabajo de comprobantes](retention.md), medida desde la creación del comprobante:

| Plano | Retención de comprobantes |
| --- | --- |
| Personal Free | Cinco años |
| Business Trial | Un mes |
| Planes pagos | El período **Requests and receipts** configurado, incluido **Never delete** |

El comprobante de un cesionario personal sigue la política de su espacio de trabajo Personal, independientemente del plan de la organización solicitante. Cambiar de plan cambia la política para los comprobantes existentes que aún no se han eliminado. Eliminar la solicitud original no elimina sus comprobantes. La eliminación del espacio de trabajo y la limpieza relacionada con los pagos aún pueden eliminar los comprobantes antes.

Un enlace de verificación no es una copia de seguridad independiente de su comprobante. Revocar un enlace deja de compartir sin eliminar el comprobante.

## Elimina tu comprobante {#delete-your-receipt}

Selecciona **Delete** en tu comprobante, luego confirma en **Delete receipt**. Esto elimina permanentemente su comprobante y todos sus enlaces de verificación. No elimina la solicitud original ni los comprobantes emitidos a otros participantes. Los propietarios y administradores solo pueden eliminar los comprobantes emitidos a ellos mismos.

Para dejar de compartir y conservar su comprobante, revoque sus enlaces de verificación.
