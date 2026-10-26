# OCN Villa Urquiza — Sistema de Gestión de Ventas

Proyecto de la materia **Desarrollo de Sistemas** (Franco Marotta, 2026). Sistema web para **OCN Villa Urquiza**, local de indumentaria urbana de marca propia en Bauness 2395 esq. Monroe, Villa Urquiza, CABA.

## Estructura

```text
marotta-franco-ocn/
├── backend/    API Express con patrón MVC (Entregas 1 y 2)
├── frontend/   Interfaz React + Vite (Entrega 3)
└── docs/       Requerimientos, diagrama de clases y boceto
```

| Carpeta / archivo | Contenido |
| --- | --- |
| `docs/Proyecto de Desarrollo de Sistema.docx` | Análisis de requerimientos (fuente de verdad del sistema) |
| `docs/diagrama-clases.md` | Diagrama de clases (Mermaid), estados del pedido y reglas de negocio |
| `docs/boceto/` | Boceto original (`ocn-diseno-web.pdf`) y propuestas de diseño |
| `backend/src/models/` | Una clase por entidad del dominio (Entrega 1) |
| `PRODUCT.md` | Contexto del producto para el trabajo de diseño |

> En la Entrega 1 las carpetas eran `Proyecto/Backend` y `Proyecto/Frontend`. Se movieron a `backend/` y `frontend/` (con `git mv`, se conserva el historial) para coincidir con la estructura que piden las Entregas 2 y 3.

## Entregas

1. **Modelo del dominio:** estructura del repositorio, diagrama de clases y modelos en `backend/src/models/`.
2. **API MVC:** controllers, services, repositories, routes, middlewares, responses, exceptions, enums y utils; CRUD en memoria y manejo centralizado de errores.
3. **Frontend React:** interfaz conectada a la API, con componentes reutilizables, notificaciones, validaciones y accesibilidad.

## Datos reales y datos de ejemplo

Son **reales**, relevados en la Ficha Técnica del local:

- Dirección, horario, WhatsApp e Instagram.
- Rating de Google (4.6 con 24 opiniones).
- Rubros que vende el local.

Son **de EJEMPLO** hasta que el dueño los reemplace:

- Logo, fotos y catálogo de productos con precios.
- Zonas y costos de envío, y monto mínimo para envío gratis.
- Métodos de pago.

## Cómo ejecutar

Se necesitan dos terminales:

```bash
# Terminal 1 — API (puerto 3000)
cd backend
npm install
npm start
```

```bash
# Terminal 2 — Frontend (puerto 5173)
cd frontend
npm install
npm run dev
```
