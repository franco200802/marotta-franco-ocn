---
version: 1
slug: "frontend-src-pages-homepage-jsx"
primary_target: "frontend/src/pages/HomePage.jsx"
related_targets: []
---

# Inicio (landing) — OCN Villa Urquiza

Scope: la landing `/` y, por herencia, todas las pantallas del frontend. Visitor mode: Persuade (inicio, catálogo, detalle); Operate (carrito, checkout, pedidos, admin).

Audiencia: compradores remotos de CABA que no pasan por la cuadra del local. Acción: ver la prenda, elegir talle y color y sumarla al carrito; o retirar en Bauness y Monroe. Prueba: marca propia, dirección y horario reales, 4.6 en Google con 24 opiniones. Restricción: respetar el boceto de Franco (docs/boceto/ocn-diseno-web.pdf).

## Direction contract

THESIS: La tienda de barrio con marca propia, contada con parches bordados y etiquetas colgantes sobre la paleta del boceto. Rechaza el split hero genérico de texto + foto: la foto del boceto se reemplaza por un parche charcoal con las letras OCN infladas y una etiqueta colgante que vende de verdad.

OWN-WORLD: Charcoal #1C1B19 (header, footer, parches oscuros), Stone #F3EFE7 (campos de contenido), blanco (secciones alternas), Naranja #FF5A1F solo en botones clave y en las letras OCN. Bebas Neue para títulos, Inter para texto. Parches con línea de puntada (outline punteado hacia adentro), etiquetas con ojal y piolín, bordes festoneados entre secciones, "OCN" gigante de contorno en el pie.

STORY: En un vistazo se entiende que es ropa urbana de fabricación propia en Villa Urquiza, que se puede comprar online y retirar o recibir, y que la atención es de barrio. El visitante elige talle en la etiqueta del hero y suma al carrito sin salir de la portada.

FIRST VIEWPORT: Navbar charcoal (logo-parche OCN naranja, enlaces, carrito). A la izquierda el titular del boceto en Bebas gigante (~116px), la bajada, "Ver catálogo" (naranja) y "Escribinos por WhatsApp" (borde), y el rating real. A la derecha un parche charcoal grande con puntada donde gira el objeto 3D OCN, y encima una etiqueta colgante blanca con un producto real de la API: talles, precio y "Sumar al carrito".

FORM: Evolución del boceto (opción 1 de 3 propuestas en docs/boceto/propuestas). seed: none (unavailable). Señal: el objeto 3D OCN gira con el scroll y se tiñe con el color de la prenda elegida.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
