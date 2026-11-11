---
title: Tokens API para integrar flujos de aprobación
description: Cree un token de API Click2Approve para su integración, envíelo como token de portador y explore la referencia de API. Descubra cómo funcionan los permisos y la revocación de tokens.
---
# Tokens API para integrar flujos de aprobación {#api-tokens}

Utilice el Click2Approve API para conectar sus propias herramientas y automatizar los flujos de trabajo de aprobación. Los tokens API permiten que las integraciones accedan al API a través de su cuenta de usuario. Administrarlos en tu perfil, ya sea que trabajes en Personal o en una organización.

## Crea un token {#create-a-token}

1. Abra **User profile → API tokens**.
2. Elija **New API token**.
3. Introduzca un nombre reconocible y una fecha de caducidad si es necesario.
4. Cree el token y copie su valor antes de cerrar el cuadro de diálogo.
5. Guárdelo de forma segura para la integración prevista.

!!! warning "Copia el token antes de cerrar"
    El valor completo se muestra solo una vez. Guárdelo de forma segura y manténgalo alejado de mensajes, capturas de pantalla y control de fuente. Si lo pierde, cree un reemplazo y revoque el token antiguo.

## Explore el API {#explore-the-api}

Abra la [referencia API (interfaz de usuario Swagger)]({{ api_reference_url }}){target="_blank" rel="noopener noreferrer"} para explorar puntos finales, campos de solicitud y respuestas.

Para probar una solicitud autenticada, elija **Authorize**, pegue su token API sin el prefijo `Bearer` y confirme. Swagger agrega el encabezado de autorización por usted. Elija un punto final, seleccione **Try it out**, complete los campos obligatorios y seleccione **Execute**. Estas solicitudes utilizan su cuenta y pueden crear, cambiar o eliminar datos reales.

Los puntos finales de seguridad de la cuenta requieren una sesión de inicio de sesión interactiva y no se pueden usar con tokens API.

## Utilice un token en su integración {#use-a-token-in-your-integration}

Envíe su token en el `Authorization` encabezado con cada solicitud API:

```http
Authorization: Bearer YOUR_API_TOKEN
```

Reemplace `YOUR_API_TOKEN` con el valor que copió al crear el token. Los tokens actúan con los permisos de su cuenta. La creación de tokens no otorga acceso al trabajo de otro usuario ni a los recursos de otra organización; la autorización aún se aplica.

## Revocar un token {#revoke-a-token}

Seleccione el token en la lista, elija **Revoke** y confirme. Actualice cualquier integración que la haya utilizado con una credencial de reemplazo. Revocar tokens y credenciales no utilizados que sospeches que han sido expuestos.

Los tokens API son configuraciones de cuenta. Cambiar de espacio de trabajo no crea un conjunto separado de tokens.
