import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState } from "../components/ui/Feedback.jsx";
import { AlertIcon } from "../components/ui/Icons.jsx";
import LineaCarrito from "../components/carrito/LineaCarrito.jsx";
import BarraEnvioGratis from "../components/carrito/BarraEnvioGratis.jsx";
import { useCart } from "../hooks/useCart.js";
import { useApiResource } from "../hooks/useApiResource.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { useValidacionCarrito } from "../hooks/useValidacionCarrito.js";
import { getZonasEnvio } from "../services/envioService.js";
import { formatPrecio } from "../utils/format.js";
import "./CartPage.css";

const fetchZonas = (signal) => getZonasEnvio({ signal });

export default function CartPage() {
  const { items, subtotal, cantidadTotal, vaciar } = useCart();
  const { data: envios } = useApiResource(fetchZonas);
  const avisos = useValidacionCarrito();
  const confirmar = useConfirm();

  async function pedirVaciar() {
    const ok = await confirmar({
      titulo: "¿Vaciar el carrito?",
      mensaje: `Se van a quitar ${cantidadTotal} ${cantidadTotal === 1 ? "prenda" : "prendas"}.`,
      confirmar: "Sí, vaciar",
    });
    if (ok) vaciar();
  }

  return (
    <div className="section section--stone">
      <title>Carrito | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader title="Tu carrito" />
        {items.length === 0 ? (
          <EmptyState
            title="El carrito está vacío"
            message="Elegí una prenda, un color y un talle, y sumala desde su ficha."
            action={<Button to="/productos">Ver productos</Button>}
          />
        ) : (
          <div className="carrito">
            <div className="carrito__lista parche parche--blanco">
              {avisos.length > 0 && (
                <div className="carrito__avisos" role="status">
                  <AlertIcon size={20} />
                  <ul>
                    {avisos.map((aviso) => (
                      <li key={aviso}>{aviso}</li>
                    ))}
                  </ul>
                </div>
              )}
              <ul className="carrito__items">
                {items.map((item) => (
                  <LineaCarrito key={item.productoId} item={item} />
                ))}
              </ul>
              <Button variant="danger-ghost" size="sm" onClick={pedirVaciar}>
                Vaciar carrito
              </Button>
            </div>
            <aside className="carrito__resumen parche parche--blanco" aria-label="Resumen">
              <h2>Resumen</h2>
              <p className="carrito__fila">
                <span>Subtotal</span>
                <strong>{formatPrecio(subtotal)}</strong>
              </p>
              <p className="carrito__nota">El envío se calcula en el siguiente paso, según tu zona.</p>
              <BarraEnvioGratis subtotal={subtotal} minimo={envios?.montoMinimoEnvioGratis} />
              <Button to="/checkout" size="lg">
                Ir a pagar
              </Button>
              <Button to="/productos" variant="ghost">
                Seguir comprando
              </Button>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
