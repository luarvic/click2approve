---
title: Administrar correos electrónicos de aprobación y notificaciones dentro de la aplicación
description: Elija notificaciones por correo electrónico y dentro de la aplicación para solicitudes de aprobación, tareas, chat y comprobantes. Encuentre configuraciones de entrega y verifique qué hacer cuando falta un mensaje.
---
# Correos electrónicos de aprobación y notificaciones en la aplicación {#notifications}

Las notificaciones lo ayudan a regresar a las tareas asignadas, solicitar resultados, discusiones, comprobantes y eventos de facturación. Establezca las preferencias de entrega por separado para cada categoría.

## Revisar notificaciones {#review-notifications}

Abra la vista de notificaciones de la aplicación para inspeccionar los eventos dentro de la aplicación. Siga una notificación al recurso asociado y verifique el estado actual antes de actuar. Una notificación anterior puede hacer referencia a una tarea que desde entonces se completó, se canceló o se reemplazó.

Las notificaciones y los asuntos de los correos electrónicos muestran **Step succeeded** o **Step failed**, y **Request succeeded** o **Request failed**, cuando se conoce el resultado. Los asuntos del correo electrónico añaden el título de la solicitud. Las solicitudes canceladas y reemplazadas tienen asuntos de correo electrónico distintos. Otros eventos utilizan **New task**, **Task completed**(para finalización automática),**New message** y **New receipt**.

Los enlaces de correo electrónico se dirigen a la tarea, solicitud, comprobante o página de Planes correspondiente. Inicie sesión con la cuenta deseada cuando se le solicite.

Los correos electrónicos de cuenta, flujo de trabajo y facturación comparten el pie de página de la aplicación con los enlaces Inicio, Aplicación, Documentos, Contacto, Términos y Privacidad. Los avisos de seguridad y las explicaciones de entrega aparecen encima del pie de página.

## Establecer preferencias de entrega {#set-delivery-preferences}

1. Abra **User profile → Notifications**.
2. Revise las categorías: **Request notifications**, **Task notifications**, **Chat notifications**, **Receipt notifications**, **Retention deletion reminders** y **Billing recovery reminders**.
3. Configure los interruptores **In-app** y **Email** para cada categoría admitida.
4. Elija **Save**.

Las categorías sin preferencias guardadas comienzan habilitadas. Cambie un interruptor y elija **Save** para almacenar sus preferencias.

La opción en la aplicación **Billing recovery reminders** está deshabilitada; su preferencia de correo electrónico se gestiona por separado de otras categorías. Las preferencias no amplían su acceso ni lo agregan a la audiencia de una discusión.**Retention deletion reminders** advierte a los propietarios de solicitudes y comprobantes antes de la
limpieza automática de retención. Sus correos electrónicos enlazan a la configuración de retención y a la
[guía de retención y eliminación](retention.md). Deshabilitar esta categoría no
deshabilita la eliminación de retención.

## Mensajes faltantes {#missing-messages}

Compruebe su dirección de correo electrónico, carpeta de spam, preferencias de notificación, espacio de trabajo seleccionado y si es un destinatario elegible. La entrega de correo electrónico puede llevar tiempo.

Si necesita actuar ahora, abra Tareas o Solicitudes directamente en lugar de esperar un correo electrónico. En caso de error en la entrega, brinde soporte con la hora del evento y el contexto del recurso sin compartir credenciales.

## Tokens de correo electrónico {#email-tokens}

Los correos electrónicos de flujo de trabajo, incluidos los recordatorios de retención, consumen tokens por destinatario y se cargan al espacio de trabajo de origen. Los tokens se verifican antes de enviarlos y se cobran cuando el proveedor de correo electrónico acepta el envío. Poner en cola una notificación no consume tokens. Las entregas de correo electrónico deshabilitadas no se cobran. Los correos electrónicos de seguridad, recuperación de cuenta y facturación se incluyen sin cargo por token de espacio de trabajo. Consulte [Uso y tokens](usage.md).
