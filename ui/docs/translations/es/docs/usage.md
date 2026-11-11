---
title: Uso del flujo de trabajo de aprobación, tokens y límites de almacenamiento
description: Vea qué acciones de Click2Approve utilizan tokens, cómo se mide el almacenamiento de archivos y qué sucede en un límite. Utilice un ejemplo para estimar el uso de un flujo de trabajo de documentos.
---
# Uso y tokens {#usage-and-tokens}

Seleccione un espacio de trabajo y abra **Usage** para ver su saldo de tokens, período de facturación y almacenamiento total ocupado. La tabla debajo de los mosaicos enumera cada acción y su **Tokens used**, incluidas las entradas de token cero. Las acciones están ordenadas por tokens utilizados, el más alto primero, con orden alfabético para cantidades iguales. La clasificación utiliza cantidades precisas antes del redondeo de visualización. Los mosaicos de Tokens y Almacenamiento muestran las cantidades utilizadas y disponibles con una barra de cuota. Las cantidades de tokens mostradas se redondean hacia abajo a tokens completos; las barras de contabilidad y cuotas conservan una precisión fraccionaria.

## Cuota mensual de tokens {#monthly-allowance}

Cada plan incluye tokens. En Personal Free se renuevan cada mes a partir de la fecha de inicio del primer período. Los planes de pago reciben tokens para cada período de facturación cuyo pago esté confirmado. Business Trial recibe una sola cuota para su mes de prueba. Los tokens no utilizados caducan: no se acumulan para el período siguiente ni se transfieren entre espacios de trabajo.

| Plano | Precio mensual (USD, sin impuestos) | Fichas incluidas | Almacenamiento |
| --- | --- | --- | --- |
| Personal Free | $0 | 1.000 por mes | 1 GB |
| Personal Pro | $20 | 50.000 por mes | 10 GB |
| Business Trial | $0 solo por un mes | 10.000 una vez | 1GB |
| Business Pro | $100 | 300.000 por mes | 100 GB |

## Para qué sirven los tokens {#what-uses-tokens}

Las tarifas de los tokens son:

| Action | Fichas |
| --- | --- |
| Subir | 1 por MB |
| Ver o descargar un archivo | 2 por MB |
| Correo electrónico de flujo de trabajo | 5 por destinatario |
| Enviar o volver a enviar una solicitud | 10 |
| Crear una tarea | 2 por tarea |

Leer solicitudes y detalles o listas de tareas, completar tareas y cancelar solicitudes no se miden y no consumen tokens. El envío y el reenvío utilizan la misma velocidad.

Las transferencias utilizan MB decimal (1.000.000 bytes). Los archivos pequeños consumen tokens fraccionarios, en lugar de redondear cada archivo a un MB. Las vistas previas de archivos también transfieren datos. Ver una copia ya almacenada en caché por su navegador no provoca otra transferencia al servidor. Las transferencias de archivos exitosas se cobran por los bytes del documento, sin la sobrecarga de codificación de URL de datos.

Las solicitudes y tareas se cargan al espacio de trabajo del flujo de trabajo de origen, incluso cuando un aprobador utiliza una bandeja de entrada personal. Las cargas desde páginas de tareas y discusión pertenecen al espacio de trabajo de la solicitud, que paga por su carga, almacenamiento y descargas. Las cargas realizadas mientras se prepara una nueva solicitud pertenecen al espacio de trabajo seleccionado. La verificación de cuentas, el restablecimiento de contraseñas, los avisos de seguridad, los correos electrónicos de facturación y los activos de marca pública no consumen tokens de espacio de trabajo.

## Flujo de trabajo de ejemplo {#example-workflow}

Un flujo de trabajo con 10 MB cargados, 10 MB vistos o descargados, cinco entregas de destinatarios de correo electrónico de flujo de trabajo, una solicitud enviada y cinco tareas creadas utilizan **75 tokens**:

| Actividad | Cálculo | Tokens used |
| --- | --- | --- |
| Subir 10MB | 10 × 1 | 10 |
| Ver o descargar 10 MB | 10 × 2 | 20 |
| Entregar cinco correos electrónicos de flujo de trabajo a un destinatario cada uno | 5×5 | 25 |
| Enviar una solicitud | 1×10 | 10 |
| Crea cinco tareas | 5 × 2 | 10 |
| **Total**| |**75** |

Completar esas tareas no consume tokens en sí. Otras transferencias de archivos, correos electrónicos, reenvíos o tareas creadas mediante pasos posteriores del flujo de trabajo se cobran por separado según las tarifas anteriores.

## Cargos y tokens insuficientes {#charging-and-insufficient-tokens}

Las cargas, descargas y correos electrónicos del flujo de trabajo verifican los tokens disponibles antes de comenzar y cobran el trabajo completado directamente. Las cargas fallidas y los correos electrónicos no enviados no se cobran. Las descargas interrumpidas se cobran por los bytes de documentos transferidos. Adjuntar o eliminar un archivo cargado no reembolsa el cargo de carga.

Las acciones simultáneas pueden llevar el saldo por debajo de cero; las acciones adicionales con cargo se bloquean hasta que los tokens estén disponibles.

Los límites de ráfaga y concurrencia también protegen el servicio. Una acción con velocidad limitada temporalmente se puede volver a intentar más tarde.

Cuando los tokens son insuficientes, se bloquean las nuevas acciones cargadas. Los registros de solicitudes y tareas existentes permanecen accesibles; La visualización de archivos aún requiere tokens. Completar una tarea puede crear tareas para el siguiente paso, lo que requiere tokens al ritmo de creación de tareas. Abra **Plans** para revisar su asignación. Eliminar un registro no reembolsa los tokens ya consumidos.

## El almacenamiento es un límite separado {#storage-is-a-separate-limit}

El almacenamiento mide los archivos que ocupan espacio actualmente, incluidos los archivos programados que están en espera de limpieza. No es una nueva asignación de carga cada mes. Mantener un archivo no consume tokens adicionales, pero cuenta en la capacidad de almacenamiento de su plan hasta que se elimina.

Elija [retención](retention.md) aproximadamente durante cuánto tiempo necesitará los registros. Un cambio de plan programado mantiene el derecho pagado actual hasta que entre en vigor. Una actualización paga se activa después del pago verificado; no otorga tokens simplemente porque se abrió el proceso de pago.
