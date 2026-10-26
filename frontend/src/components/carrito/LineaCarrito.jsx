import { Link } from "react-router-dom";
import ProductoArte from "../productos/ProductoArte.jsx";
import QuantityStepper from "../ui/QuantityStepper.jsx";
import { TrashIcon } from "../ui/Icons.jsx";
import { useCart } from "../../hooks/useCart.js";
import { formatPrecio } from "../../utils/format.js";
import "./LineaCarrito.css";

export default function LineaCarrito({ item, onNavegar }) {
  const { cambiarCantidad, quitar } = useCart();

  return (
    <li className="linea">
      <div className="linea__arte">
        <ProductoArte nombre={item.prenda} categoria={item.categoria} color={item.color} />
      </div>
      <div className="linea__info">
        <Link to={`/productos/${item.productoId}`} className="linea__nombre" onClick={onNavegar}>
          {item.prenda}
        </Link>
        <p className="linea__variante">
          {[item.talle && `Talle ${item.talle}`, item.color].filter(Boolean).join(" · ")}
        </p>
        <div className="linea__controles">
          <QuantityStepper
            value={item.cantidad}
            max={item.stock}
            label={`Cantidad de ${item.nombre}`}
            onChange={(cantidad) => cambiarCantidad(item.productoId, cantidad)}
          />
          <button type="button" className="linea__quitar" onClick={() => quitar(item.productoId)}>
            <TrashIcon size={16} />
            <span className="visually-hidden">Quitar {item.nombre} del carrito</span>
          </button>
        </div>
      </div>
      <p className="linea__subtotal">{formatPrecio(item.precio * item.cantidad)}</p>
    </li>
  );
}
