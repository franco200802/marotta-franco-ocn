import { Link } from "react-router-dom";
import Button from "../ui/Button.jsx";
import { BagIcon } from "../ui/Icons.jsx";
import SelectorVariante from "./SelectorVariante.jsx";
import { useSeleccionVariante } from "../../hooks/useSeleccionVariante.js";
import { useSumarAlCarrito } from "../../hooks/useSumarAlCarrito.js";
import { formatPrecio } from "../../utils/format.js";
import "./EtiquetaProducto.css";

/** Etiqueta colgante con un producto real: se elige color y talle y se suma al carrito ahí mismo. */
export default function EtiquetaProducto({ prenda, onColorChange, ejemplo = true }) {
  const { color, talle, variante, elegirColor, elegirTalle } = useSeleccionVariante(prenda);
  const sumar = useSumarAlCarrito();
  const disponible = variante && variante.stock > 0;

  return (
    <article className="etiqueta" aria-labelledby="etiqueta-titulo">
      <span className="etiqueta__ojal" aria-hidden="true" />
      <span className="etiqueta__piolin" aria-hidden="true" />
      {ejemplo && <p className="etiqueta__marca">Producto de ejemplo</p>}
      <h2 id="etiqueta-titulo" className="etiqueta__titulo">
        <Link to={`/productos/${variante?.codigo ?? prenda.codigo}`}>{prenda.nombre}</Link>
      </h2>
      <p className="etiqueta__categoria">{prenda.categoria}</p>
      <SelectorVariante
        compacto
        prenda={prenda}
        idPrefix="etiqueta"
        color={color}
        talle={talle}
        onColor={(nuevo) => {
          elegirColor(nuevo);
          onColorChange?.(nuevo);
        }}
        onTalle={elegirTalle}
      />
      <div className="etiqueta__pie">
        <p className="etiqueta__precio">{formatPrecio(variante?.precio ?? prenda.precioMin)}</p>
        <Button size="sm" icon={<BagIcon size={16} />} disabled={!disponible} onClick={() => sumar(variante)}>
          {disponible ? "Sumar al carrito" : "Sin stock"}
        </Button>
      </div>
    </article>
  );
}
