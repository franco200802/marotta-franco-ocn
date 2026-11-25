# Guion del video: Entrega 4 (de 7 a 8 minutos)

**Flujo elegido: la compra, desde sumar una prenda al carrito hasta que el administrador avanza el pedido.**
Es el flujo central del negocio y pasa por todas las capas: React → `services` → rutas → controller → service → repository, y vuelta.

## Antes de grabar

- [ ] Reiniciar la API (`cd backend && npm start`) para empezar con los datos de ejemplo limpios.
- [ ] Frontend corriendo (`cd frontend && npm run dev`) y abierto en http://localhost:5173.
- [ ] Una ventana de incógnito para el administrador (`admin@ocn.local` / `ocn-admin-dev`).
- [ ] En el editor, abrir las pestañas de la parte 2 y la parte 3 en ese orden.
- [ ] Zoom del navegador y del editor al 125 % para que se lea el código. Notificaciones apagadas.
- [ ] Grabar en mp4 (por ejemplo, con la grabación de pantalla de Windows, `Win + Alt + R`, o con OBS).

## Parte 1: el recorrido en la aplicación (0:00 a 3:00)

| Tiempo | Qué mostrar | Qué decir |
| --- | --- | --- |
| 0:00 | Inicio del sitio | "Soy Franco Marotta. Este es el sistema de ventas de OCN Villa Urquiza, un local de ropa urbana. El frontend es React con Vite y el backend es una API en Express con patrón MVC. Voy a mostrar el flujo de compra completo." |
| 0:20 | `/productos`: buscar "remera" y filtrar por categoría | "El catálogo viene del backend. La búsqueda y los filtros trabajan sobre esos datos." |
| 0:40 | Ficha de la remera: elegir talle M y color negro, y tocar "Sumar al carrito" | "Todavía no inicié sesión, así que el carrito se guarda en el navegador." |
| 1:00 | Ingresar con una cuenta o registrarse | "Al iniciar sesión, lo que tenía como visitante pasa a mi carrito en el servidor." Abrir el cajón del carrito y mostrar la remera. |
| 1:20 | Sumar un buzo. En `/carrito`, tocar + en la remera | "Cada cambio es una petición a la API, y lo que se ve es lo que responde el backend." |
| 1:40 | Ventana del administrador: en `/admin/productos`, subir el precio de la remera. Volver al cliente y recargar el carrito | "Regla RN-05: si el administrador cambia un precio, el carrito se actualiza antes de comprar y me avisa." Señalar el aviso. |
| 2:05 | Con un buzo ya en el carrito, ir a su ficha, elegir la cantidad máxima (todo el stock) y tocar "Sumar al carrito" | "Regla RN-01: no se puede comprar más que el stock. Ya tengo uno en el carrito, así que el backend rechaza el pedido y el mensaje de error viene de la API." |
| 2:20 | `/checkout`: retiro en el local y efectivo; mostrar el error al confirmar sin método de pago; después, "Confirmar pedido" | "Confirmo la compra y se genera el pedido en estado Pendiente. El carrito queda vacío y el stock se descontó." |
| 2:40 | Administrador, `/admin/pedidos`: "Confirmar pago" y "Pasar a preparación". Cliente: `/mis-pedidos` | "El administrador avanza el pedido por el flujo de estados y el cliente ve el estado actualizado. Como ya no está Pendiente, no lo puede cancelar (RN-03)." |

## Parte 2: el flujo en el backend (3:00 a 5:30)

| Tiempo | Archivo | Qué decir |
| --- | --- | --- |
| 3:00 | Árbol de `backend/src` | "La API respeta la separación de la Entrega 2: routes, controllers, services, repositories, models, middlewares, exceptions y responses." |
| 3:15 | `routes/carritoRoutes.js` | "Validar el carrito es público para los visitantes; el resto exige un token de cliente con los middlewares `autenticar` y `autorizar`." |
| 3:35 | `controllers/CarritoController.js`, método `agregar` | "El controller solo recibe la petición, llama al service y responde con `ApiResponse`. Si algo falla, pasa el error a `next`." |
| 3:50 | `services/CarritoService.js`, método `agregar` (línea 99 aprox.) | "Acá está la lógica de negocio: valida que la cantidad sea un entero mayor que cero (Validación 3), que el producto exista y esté activo, y que la cantidad no supere el stock (RN-01). Si falla, lanza un `ConflictError`." |
| 4:15 | `CarritoService.obtener` (línea 55 aprox.) | "Cada vez que se lee el carrito se aplican RN-05 y RN-01: se actualiza el precio, se ajusta la cantidad al stock y se quita lo agotado, y se informa qué cambió." |
| 4:35 | `services/PedidoService.js`, método `crear` (línea 26 aprox.) | "Al confirmar, toma el carrito del cliente, valida todo antes de tocar el stock, cobra el precio del servidor, calcula el envío con RN-04, descuenta el stock, guarda el pedido, el detalle y el envío, y saca del carrito lo comprado." |
| 5:00 | `middlewares/errorHandler.js` y `enums/Messages.js` | "Los errores se manejan en un solo lugar: cada `AppError` tiene su código HTTP y el mensaje sale de `Messages`. Siempre se responde `{ success, data }` o `{ success: false, message }`." |
| 5:15 | Terminal: `npm test` | "Hay 43 tests con `node:test` y `supertest`, que cubren estas reglas." |

## Parte 3: el flujo en el frontend (5:30 a 7:30)

| Tiempo | Archivo | Qué decir |
| --- | --- | --- |
| 5:30 | `services/apiClient.js`, función `apiRequest` | "Todas las peticiones pasan por este cliente: agrega el token, lee el formato `{ success, data }` y convierte los errores en mensajes claros." |
| 5:50 | `services/carritoService.js` | "Las llamadas del carrito están centralizadas en `services`, una función por endpoint." |
| 6:05 | `context/CartProvider.jsx`, funciones `pedirAlServidor` y `agregar` | "El contexto del carrito decide: con sesión de cliente llama a la API y muestra lo que responde el backend; si la API rechaza algo, muestra el error y vuelve a pedir el carrito real." |
| 6:35 | `CartProvider.jsx`, efecto de inicio de sesión (línea 168 aprox.) | "Al iniciar sesión se suma el carrito del visitante con `fusionarCarrito`." |
| 6:50 | `hooks/useSumarAlCarrito.js` | "El botón 'Sumar al carrito' espera la respuesta: si sale bien muestra la confirmación, y si no, el error." |
| 7:05 | `pages/CheckoutPage.jsx`, función `confirmar` | "El checkout valida el formulario, llama a `crearPedido`, y con la respuesta navega al pedido y muestra el mensaje de éxito." |
| 7:20 | Cierre en la aplicación | "Así funciona el flujo completo: la interfaz consume la API, las reglas de negocio están en el backend y los resultados se ven en pantalla. Gracias." |

## Si sobra tiempo (hasta 10 minutos)

- Panel `/admin/clientes`: desactivar una cuenta y mostrar que no puede iniciar sesión (403 con el mensaje "Tu cuenta está desactivada").
- Pedido nuevo en Pendiente: cancelarlo desde `/pedidos/:id` y mostrar que el stock vuelve.
- Envío a domicilio: elegir una zona y mostrar el envío gratis al superar el monto mínimo (RN-04).
