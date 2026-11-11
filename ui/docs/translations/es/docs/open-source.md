---
title: Sistema de aprobación de documentos de código abierto
description: Autohospedaje Click2Approve, un sistema gratuito de aprobación de documentos con licencia del MIT con flujos de trabajo de varios pasos, múltiples revisores y firmas electrónicas. Comparar ediciones.
---
# Sistema de aprobación de documentos de código abierto {#open-source-document-approval-system}

Click2Approve es un sistema gratuito de aprobación de documentos de código abierto con licencia MIT que puede alojar en su propia infraestructura. Cargue documentos, asigne revisores por dirección de correo electrónico y realice un seguimiento de sus decisiones a través de un flujo de trabajo de aprobación de varios pasos. Puede solicitar firmas electrónicas y solicitar comentarios cuando una tarea necesita una explicación.

La edición de código abierto admite cuentas individuales y flujos de trabajo de documentos personales para uso personal o comercial. No hay tarifa de licencia Click2Approve; usted cubre sus costos de infraestructura y proveedor. Consulte el [código fuente y las instrucciones de autohospedaje](https://github.com/luarvic/click2approve) para comenzar.

La versión comercial agrega espacios de trabajo de organización, herramientas de colaboración y controles de retención y uso basados en suscripción. Las demás guías de este portal describen el servicio comercial; utilice esta comparación para comprobar qué funciones se aplican a la edición de código abierto.

## Ejemplo: revisar y aprobar una propuesta {#example-review-and-approve-a-proposal}

1. Cargue una propuesta y agregue un paso de aprobación para las personas que necesitan revisarla.
2. Elija si todos los asignados al paso deben responder o si cualquier revisor puede completarlo. Los pasos del flujo de trabajo se ejecutan en orden y varios responsables pueden actuar en cada paso.
3. Agregue un paso de firma si la propuesta también necesita una firma electrónica.
4. Realice un seguimiento del progreso de la solicitud y de las decisiones registradas desde **Requests**. Cada participante encuentra su trabajo asignado en **Tasks**.

Consulte [Crear una solicitud](create-a-request.md) y [Configurar pasos del flujo de trabajo](workflow-steps.md) para conocer los controles del flujo de trabajo. Los comprobantes compartibles y la verificación de archivos son características comerciales; consulte la comparación a continuación al elegir una edición.

## Comparación de funciones {#feature-comparison}

| Característica | Código abierto | Comercial |
| --- | --- | --- |
| Solicitudes y tareas Personal con archivos cargados | Incluido | Incluido |
| Múltiples pasos del flujo de trabajo, asignatarios en serie o paralelos y todas/cualquier regla de finalización | Incluido | Incluido |
| Acciones de aprobación, firma, confirmación, reconocimiento, revisión, verificación, aceptación y finalización | Incluido | Incluido |
| Comentarios requeridos y firmas electrónicas | Incluido | Incluido |
| Solicitar seguimiento, cancelación y eliminación | Incluido | Incluido |
| Perfiles, firmas guardadas, inicio de sesión con contraseña, MFA y claves de acceso | Incluido | Incluido |
| Notificaciones por correo electrónico y dentro de la aplicación | Incluido | Incluido |
| Espacios de trabajo de organización, empleados, roles y empleados asignados | No disponible | Incluido |
| Equipos y responsables del equipo | No disponible | Incluido |
| Delegations | No disponible | Incluido |
| Plantillas de flujo de trabajo de organización | No disponible | Incluido |
| Discusiones y archivos adjuntos de discusión | No disponible | Incluido |
| Archivos adjuntos de respuesta a tareas y archivos de respuestas requeridos | No disponible | Incluido |
| Solicitar revisiones y comparar archivos entre revisiones | No disponible | Incluido |
| Receipts, enlaces de verificación para compartir y verificación de archivos | No disponible | Incluido |
| Tokens API para integraciones | No disponible | Incluido |
| Planes de suscripción, informes de uso de tokens y facturación | No disponible | Incluido |
| Configuración de retención del espacio de trabajo y limpieza automática de la retención | No disponible | Incluido |

Las funciones comerciales dependen de su espacio de trabajo, función, participación y límites del plan. Consulte [Características y disponibilidad](features.md) para conocer los permisos del espacio de trabajo y [Planes y facturación](plans-and-billing.md) para las suscripciones. La entrega de correo electrónico en una instalación autohospedada requiere un proveedor de correo electrónico.

## Utilice la aplicación de código abierto {#use-the-open-source-app}

1. Regístrate o inicia sesión con tu cuenta.
2. Elija **New request**, cargue sus archivos y configure los pasos del flujo de trabajo con las direcciones de correo electrónico de los asignados. Consulte [Crear una solicitud](create-a-request.md) y [Configurar pasos del flujo de trabajo](workflow-steps.md) para conocer los controles de flujo de trabajo compartidos.
3. Utilice **Requests** para realizar un seguimiento del trabajo que envió y **Tasks** para completar las acciones que se le asignaron. Consulte [Completar una tarea](complete-a-task.md) para comentarios y firmas; los archivos adjuntos de respuesta están disponibles en la versión comercial.

La navegación de la organización y las herramientas comerciales están ocultas en la aplicación de código abierto. Puede administrar su perfil, firma guardada, preferencias de notificación, MFA y claves de acceso a través del menú de perfil.

## Fuente y autohospedaje {#source-and-self-hosting}

Consulte el [repositorio de código abierto](https://github.com/luarvic/click2approve) para obtener el código fuente, la licencia MIT, la configuración de Docker y las instrucciones de autohospedaje. Visite el [servicio Click2Approve](../index.md) para obtener la versión comercial.
