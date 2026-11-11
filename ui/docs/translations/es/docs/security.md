---
title: Configurar el autenticador MFA y las claves de acceso
description: Proteja su cuenta Click2Approve con una aplicación de autenticación o una clave de acceso. Aprenda a configurar MFA, guardar códigos de recuperación y administrar claves de acceso registradas.
---
# MFA y claves de acceso {#mfa-and-passkeys}

Proteja su cuenta Click2Approve con **autenticación multifactor (MFA)** o una **clave de acceso**. Con el autenticador MFA, ingresa un código de una aplicación de autenticación después de su contraseña. Una clave de acceso le permite iniciar sesión a través de un dispositivo compatible o una clave de seguridad, utilizando el mensaje del navegador.

Estas configuraciones se aplican a su cuenta en Personal y espacios de trabajo de la organización.

## Habilitar autenticador MFA {#enable-authenticator-mfa}

1. Abra **User profile → Security**.
2. Habilite **Use multi-factor authentication**.
3. Escanee el código QR de configuración en su aplicación de autenticación o ingrese la clave de configuración manualmente.
4. Ingrese un código de verificación del autenticador para confirmar la configuración.
5. Guarde los códigos de recuperación en un lugar seguro y confirme que los ha guardado.
6. Elija **Done — sign in again**, luego inicie sesión con su contraseña y código de autenticación.

Después de la configuración, el inicio de sesión con contraseña requiere el desafío adicional MFA. Iniciar la configuración cambia tu sesión: completarla o cancelarla requiere iniciar sesión nuevamente.

## Códigos de recuperación {#recovery-codes}

Utiliza un código de recuperación guardado cuando no puedas acceder a tu autenticador.

!!! warning "Mantén los códigos de recuperación seguros"
    Cada código es un secreto y sólo puede usarse una vez. **Generate new recovery codes** reemplaza el conjunto anterior; guarde los nuevos códigos antes de descartarlos.

Para generar nuevos códigos de recuperación o desactivar MFA también es necesario iniciar sesión nuevamente después de terminar.

Para deshabilitar MFA, use la pestaña Security y complete la verificación solicitada. No elimine el único método de inicio de sesión que funciona antes de probar otro.

## Agregue una clave de acceso {#add-a-passkey}

1. Abra **User profile → Passkeys** y elija la nueva acción de clave de acceso.
2. Introduce un nombre que reconocerás más tarde.
3. Complete el mensaje del navegador o dispositivo usando su clave biométrica, PIN o de seguridad.
4. Compruebe que la credencial aparezca en la lista.

Utilice la opción de inicio de sesión con clave de acceso en un dispositivo y navegador compatibles. Las claves de acceso requieren un dispositivo y un navegador compatibles. Mantenga su contraseña disponible para la recuperación de la cuenta.

## Eliminar una clave de acceso {#remove-a-passkey}

Seleccione la credencial en la lista de claves de acceso y utilice la acción de eliminación. Primero verifique su nombre y los detalles utilizados por última vez. Quitarla revoca el acceso a esa credencial; no elimina otras claves de acceso registradas.

Después de la eliminación, la aplicación notifica a los administradores de contraseñas compatibles para que puedan dejar de ofrecer la clave de acceso eliminada. Es posible que su navegador o administrador de contraseñas no admitan esta actualización. Si la clave de acceso aún aparece, elimínela manualmente de su administrador de contraseñas; ya no podrá iniciar sesión en su cuenta.

Si se pierde un autenticador o un dispositivo no está disponible, pruebe el método alternativo configurado o el código de recuperación. Si no hay ninguno disponible, comuníquese con el soporte para obtener ayuda.
