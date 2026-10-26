import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../ui/Button.jsx";
import { CloseIcon } from "../ui/Icons.jsx";
import LineaCarrito from "./LineaCarrito.jsx";
import BarraEnvioGratis from "./BarraEnvioGratis.jsx";
import { useCart } from "../../hooks/useCart.js";
import { useApiResource } from "../../hooks/useApiResource.js";
import { getZonasEnvio } from "../../services/envioService.js";
import { formatPrecio } from "../../utils/format.js";
import "./CartDrawer.css";

const fetchZonas = (signal) => getZonasEnvio({ signal });

/** Cajón del carrito: un <dialog> nativo que entra desde la derecha. */
export default function CartDrawer() {
  const { items, subtotal, cantidadTotal, cajonAbierto, cerrarCajon } = useCart();
  const { data: envios } = useApiResource(fetchZonas);
  const dialogRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (cajonAbierto && !dialog.open) dialog.showModal();
    else if (!cajonAbierto && dialog.open) dialog.close();
  }, [cajonAbierto]);

  const ir = (ruta) => {
    cerrarCajon();
    navigate(ruta);
  };

  return (
    <dialog
      ref={dialogRef}
      className="cajon"
      aria-labelledby="cajon-titulo"
      onClose={cerrarCajon}
      onClick={(event) => event.target === dialogRef.current && cerrarCajon()}
    >
      <div className="cajon__contenido">
        <header className="cajon__cabecera">
          <h2 id="cajon-titulo">Tu carrito</h2>
          <button type="button" className="cajon__cerrar" onClick={cerrarCajon}>
            <CloseIcon size={22} />
            <span className="visually-hidden">Cerrar carrito</span>
          </button>
        </header>

        {items.length === 0 ? (
          <div className="cajon__vacio">
            <p>Todavía no sumaste nada.</p>
            <Button variant="outline" onClick={() => ir("/productos")}>
              Ver productos
            </Button>
          </div>
        ) : (
          <>
            <ul className="cajon__lista">
              {items.map((item) => (
                <LineaCarrito key={item.productoId} item={item} onNavegar={cerrarCajon} />
              ))}
            </ul>
            <footer className="cajon__pie">
              <BarraEnvioGratis subtotal={subtotal} minimo={envios?.montoMinimoEnvioGratis} />
              <p className="cajon__subtotal">
                <span>
                  Subtotal ({cantidadTotal} {cantidadTotal === 1 ? "prenda" : "prendas"})
                </span>
                <strong>{formatPrecio(subtotal)}</strong>
              </p>
              <div className="cajon__acciones">
                <Button onClick={() => ir("/checkout")}>Ir a pagar</Button>
                <Button variant="ghost" onClick={() => ir("/carrito")}>
                  Ver el carrito completo
                </Button>
              </div>
            </footer>
          </>
        )}
      </div>
    </dialog>
  );
}
