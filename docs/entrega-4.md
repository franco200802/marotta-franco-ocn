# Entrega 4: integración y funcionamiento completo del sistema

Sistema de Gestión de Ventas para **OCN Villa Urquiza** (Franco Marotta, Desarrollo de Sistemas, 2026).

Las Entregas 2 y 3 ya cubrían casi todo el Análisis de Requerimientos: registro e inicio de sesión, CRUD de productos, compras, pedidos con su flujo de estados, envíos, reportes y el panel de administración. Esta entrega **no rehace nada de eso**: se verificó que funcione de punta a punta y se completaron las dos partes que faltaban.

| Faltaba | Por qué | Qué se hizo |
| --- | --- | --- |
| El carrito vivía solo en el navegador | El backend solo lo validaba; agregar productos o cambiar cantidades no eran operaciones de la API | Carrito de cada cliente guardado en el servidor, con sus reglas de negocio en `CarritoService` |
| "Gestionar usuarios" (Administrador) | El administrador solo podía ver la lista de clientes | El administrador desactiva o reactiva cuentas; una cuenta desactivada no inicia sesión ni compra |

## 1. Funcionalidades del negocio y dónde se usan

Todas se usan desde la interfaz en React; ninguna simula la operación.

| Funcionalidad | Endpoint | Pantalla |
| --- | --- | --- |
| Registrarse e iniciar sesión | `POST /api/auth/registro` · `POST /api/auth/login` | `/registrarse` · `/ingresar` |
| Consultar, buscar y filtrar prendas | `GET /api/productos` · `GET /api/productos/:codigo` | `/productos` · `/productos/:codigo` |
| **Agregar al carrito** | `POST /api/carrito/items` | Ficha de la prenda ("Sumar al carrito") |
| **Ver el carrito con precio y stock vigentes** | `GET /api/carrito` | `/carrito` y cajón del carrito |
| **Modificar cantidades y quitar prendas** | `PUT` / `DELETE /api/carrito/items/:productoId` | `/carrito` (botones − y +, y el tacho) |
| **Vaciar el carrito** | `DELETE /api/carrito` | `/carrito` ("Vaciar carrito") |
| **Pasar el carrito del visitante a la cuenta** | `POST /api/carrito/fusionar` | Automático al iniciar sesión o registrarse |
| Cotizar el envío | `GET /api/envios/zonas` · `POST /api/envios/cotizar` | `/checkout` |
| Confirmar la compra | `POST /api/pedidos` | `/checkout` ("Confirmar pedido") |
| Consultar pedidos e historial | `GET /api/pedidos/mios` · `GET /api/pedidos/:id` | `/mis-pedidos` · `/pedidos/:id` |
| Cancelar un pedido | `PATCH /api/pedidos/:id/cancelar` | `/pedidos/:id` |
| Editar los datos personales | `PUT /api/clientes/perfil` | `/mi-cuenta` |
| CRUD de productos, precios y stock | `POST` / `PUT` / `DELETE /api/productos` | `/admin/productos` |
| Gestionar pedidos y cambiar su estado | `GET /api/pedidos` · `PATCH /api/pedidos/:id/estado` | `/admin/pedidos` |
| **Gestionar clientes** | `GET /api/clientes` · `PATCH /api/clientes/:id/estado` | `/admin/clientes` |
| Reportes de ventas | `GET /api/reportes/ventas` | `/admin/reportes` |
| Monto mínimo para envío gratis | `PUT /api/envios/configuracion` | `/admin/envios` |

En **negrita**, lo nuevo de esta entrega.

## 2. Reglas de negocio y validaciones (en el backend)

Todas se validan en los services del backend; el frontend repite algunas solo para avisar antes. Los errores salen por el manejo centralizado (`AppError` → `errorHandler`) con el formato `{ success: false, message }` y los textos de `enums/Messages.js`.

| Regla | Dónde se aplica | Respuesta |
| --- | --- | --- |
| RN-01: no se vende sin stock ni más unidades que las disponibles | `CarritoService.agregar` / `actualizarCantidad`, `PedidoService.crear` | 409 |
| RN-01: si baja el stock, el carrito se ajusta; si se agota, la prenda sale del carrito y se avisa | `CarritoService.obtener` | Aviso en el carrito |
| RN-02: un email se registra una sola vez | `AuthService.registrar` | 409 |
| RN-03: el cliente solo cancela en estado Pendiente; se devuelve el stock | `PedidoService.cancelar` | 409 |
| RN-04: envío gratis cuando el subtotal alcanza el mínimo del administrador | `EnvioService.cotizar` | — |
| RN-05: si cambia el precio, el carrito se actualiza antes de comprar y avisa una vez | `CarritoService.obtener`, `PedidoService.crear` (cobra el precio del servidor) | Aviso en el carrito |
| Validación 1: campos obligatorios | `AuthService.registrar`, `PedidoService.crear` | 400 |
| Validación 2: formato de email y email único | `AuthService`, `ClienteService` | 400 / 409 |
| Validación 3: cantidad entera, mayor que cero y sin superar el stock | `CarritoService`, `PedidoService` | 400 / 409 |
| Flujo de estados: Pendiente → Confirmado → En preparación → Enviado → Finalizado (Cancelado solo desde Pendiente) | `PedidoService.cambiarEstado` con `TransicionesPedido` | 409 |
| Una cuenta desactivada no inicia sesión ni usa el carrito, ni compra ni edita sus datos | `AuthService.iniciarSesion`, `ClienteService.exigirActivo` | 403 |
| Operaciones sobre registros inexistentes (producto, prenda del carrito, pedido, cliente) | Cada service | 404 |
| Solo el rol correcto accede (cliente o administrador) | Middlewares `autenticar` y `autorizar` | 401 / 403 |

## 3. El carrito en el servidor

- **Modelo:** `models/ItemCarrito.js` (cliente, producto, cantidad, último precio visto y nombre de la prenda).
- **Repositorio:** `repositories/ItemCarritoRepository.js` (en memoria, como el resto).
- **Service:** `services/CarritoService.js`. Cada operación devuelve el carrito completo: `{ items, quitados, cantidadTotal, subtotal, hayCambios }`. Cada línea trae el producto, el precio vigente y los avisos `precioCambio` y `cantidadAjustada`.
- **Rutas:** `routes/carritoRoutes.js`. `POST /validar` sigue siendo público para los visitantes; el resto exige iniciar sesión como cliente.
- **Compra:** `POST /api/pedidos` sin `items` compra lo que el cliente tiene guardado y saca del carrito lo comprado. Con `items` funciona como en la Entrega 2.
- **Frontend:** `context/CartProvider.jsx`. Con sesión de cliente cada acción llama a `services/carritoService.js` y la pantalla muestra lo que responde el backend. El visitante sigue con el carrito en el navegador; al iniciar sesión, eso se suma a su carrito del servidor.

## 4. Cómo se probó

- **Backend:** `cd backend && npm test`, con 43 tests que pasan. Los 11 nuevos están en `test/carrito.test.js` y `test/clientes.test.js`.
- **Frontend:** `npm run lint` sin errores y `npm run build` correcto.
- **Recorrido completo en Chrome**, con el backend y el frontend corriendo:
  1. Un visitante suma una remera.
  2. Se registra, y la remera pasa a su carrito del servidor.
  3. Suma un buzo y, desde el carrito, cambia la cantidad de remeras.
  4. El administrador sube el precio de la remera; al recargar, el carrito sigue y avisa el precio nuevo.
  5. El cliente confirma la compra: el total usa el precio nuevo y el carrito queda vacío.
  6. El administrador confirma el pago desde el panel, y el cliente ve "Confirmado" y ya no puede cancelar.
  7. El administrador desactiva la cuenta: al volver a entrar, el cliente ve el aviso y queda sin sesión.
  
  El recorrido no dejó errores en la consola.
- **Celular (390 px):** carrito, checkout y panel sin desbordes horizontales.

## 5. Cómo ejecutar

```bash
# Terminal 1: API (puerto 3000)
cd backend && npm install && npm start

# Terminal 2: frontend (puerto 5173)
cd frontend && npm install && npm run dev
```

Administrador de desarrollo: `admin@ocn.local` / `ocn-admin-dev`. Los datos están en memoria: al reiniciar la API vuelve el catálogo de ejemplo y se borran las cuentas y los pedidos de prueba.

El guion del video de defensa está en [`guion-video-entrega-4.md`](guion-video-entrega-4.md).
