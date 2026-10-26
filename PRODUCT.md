# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Fijado por la consigna de la materia "Desarrollo de Sistemas": frontend React (Vite, JavaScript) en `frontend/`, API Express 4 con patrón MVC en `backend/`, datos en memoria (arrays). Para el objeto 3D se suma Three.js (React Three Fiber). Por ahora corre en local; el deploy objetivo es frontend en Vercel y API en un servidor persistente, y solo se hace con el OK de Franco.

## Users

Compradores remotos: gente de CABA que no pasa por la cuadra del local (queda en una calle lateral, fuera de la avenida) y quiere ver qué hay, en qué talle y a qué precio antes de comprar o de acercarse. Miran desde el celular, arman el pedido y eligen envío a domicilio o retiro en el local. Dentro de ese público, la Ficha Técnica nombra a jóvenes urbanos, familias del barrio, gente que busca regalos y skaters.

Segunda audiencia, interna: el administrador del local, que gestiona productos, stock, precios, pedidos y estados desde un panel con login, y consulta reportes de ventas.

## Product Purpose

Sistema de gestión de ventas de OCN Villa Urquiza. El cliente consulta el catálogo con talles, colores, precios y stock actualizados; compra con retiro o envío y sigue el estado de su pedido. El local deja de administrar productos, stock y pedidos a mano.

Es además un proyecto académico de tres entregas (dominio, API MVC, frontend React), así que cumplir cada consigna al pie de la letra es parte del éxito.

## Positioning

Tienda oficial de una marca de indumentaria urbana **de fabricación propia** (algodón, gabardina y lycra, para hombre, mujer y niños), con buena relación calidad-precio y atención de barrio: te asesoran en persona. Una cadena o un marketplace no puede copiar esa combinación de marca propia y trato cercano.

## Operating Context

- Local: Bauness 2395 esq. Monroe, C1431, Villa Urquiza, CABA. Esquina de calle lateral, estilo de barrio más que comercial.
- Horario: lunes a sábado de 10:30 a 19:30; domingos cerrado.
- Contacto actual: WhatsApp 011 6106-6755 (también toman pedidos por teléfono) e Instagram @ocn.villaurquiza.
- Hoy envían pedidos a domicilio y no tienen página web.
- El pago se hace al retirar o al recibir. No hay pasarela de pago real; el método de pago es una etiqueta.

## Capabilities and Constraints

- Requerimientos en `Proyecto de Desarrollo de Sistema.docx` (Análisis de Requerimientos, agosto 2026):
  - Registro e inicio de sesión de clientes.
  - CRUD de productos por el administrador.
  - Carrito.
  - Pedidos con estados: Pendiente → Confirmado → En preparación → Enviado → Finalizado, más Cancelado solo desde Pendiente.
  - Envíos: retiro en el local o a domicilio con costo por zona.
  - Reportes de ventas.
- Reglas de negocio:
  - RN-01: no se vende con stock 0.
  - RN-02: email único.
  - RN-03: el cliente cancela solo en Pendiente.
  - RN-04: envío gratis sobre el mínimo que fija el administrador.
  - RN-05: si el administrador cambia un precio, se actualiza en el carrito antes de confirmar.
- Dominio entregado (Entrega 1): Cliente, Administrador, Producto (código, nombre, categoría, talle, color, descripción, precio, stock, imagen), Pedido, DetallePedido y Envío. Se respeta y se extiende; no se renombra.
- La API responde `{ success, data }` / `{ success: false, message }`, con mensajes centralizados y errores con `AppError`.
- Sin decidir: zonas y costos de envío, monto mínimo de envío gratis, catálogo, precios, talles y colores reales, métodos de pago aceptados.

## Brand Commitments

- Nombre: "OCN Villa Urquiza" (marca OCN).
- Voz: rioplatense, cercana, con humor de barrio, como en el mostrador. Frases cortas. Sin clichés de moda ("calidad premium", "hecho con pasión").
- Boceto oficial de Franco: `docs/boceto/ocn-diseno-web.pdf`, Etapa 2 · UX/UI, junio 2026. La consigna de la Entrega 3 exige respetarlo con mejoras justificadas. Define:
  - Paleta: charcoal #1C1B19, stone #F3EFE7, naranja #FF5A1F solo en botones clave.
  - Tipografías: Bebas Neue para títulos, Inter para textos.
  - Landing de 5 secciones: navbar, hero con foto y CTA, sobre nosotros, productos estrella y footer con contacto.
- Pedido explícito de Franco: llevar ese boceto a un sitio juguetón y moderno, de nivel Awwwards (CSS animations), con letras "OCN" infladas en 3D que giran con el scroll. No tiene que parecer hecho por una IA.

## Evidence on Hand

Real, relevado en la Ficha Técnica (`~/Descargas/Ficha_Tecnica_OCN (1).docx`, junio 2026):
- Dirección, horarios, WhatsApp e Instagram (1.687 seguidores, 326 publicaciones).
- Rating de Google: 4.6 con 24 opiniones.
- Productos estrella:
  - Ropa de algodón ("excelente calidad").
  - Jeans y chinos ("variedad de talles").
  - Accesorios: gorras, billeteras, cintos y perfumes ("ideal para regalos").
  - Asesoramiento ("te asesoran en todo").
  - También venden skates.

**No hay y no se debe inventar:** logo, fotos del local o de productos, catálogo con precios, textos de reseñas, historia de la marca. Todo producto, precio, zona de envío y costo del sistema es de ejemplo y se marca como EJEMPLO hasta que el dueño lo reemplace. No hay sección de reseñas: solo el rating real con su fuente.

## Product Principles

1. La ropa manda: la primera pantalla habla de marca propia y prendas, no de promesas genéricas.
2. Comprar a distancia tiene que dar confianza: talle, color, stock y precio claros antes de confirmar.
3. La verdad primero: nada inventado presentado como real (precios, reseñas, historia).
4. Lo de barrio se nota en la voz y los detalles, no en una estética de cadena.
5. Mucho movimiento, pero nunca a costa de leer, comprar o usar el teclado.

## Accessibility & Inclusion

La consigna exige accesibilidad básica: HTML semántico, `label` asociado a cada `input`, botones semánticos, textos alternativos y navegación clara. Se suma contraste AA, foco visible, navegación por teclado y respeto de `prefers-reduced-motion`. Todo el contenido está en español rioplatense.
