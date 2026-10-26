import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import ProductoArte from "./ProductoArte.jsx";
import Badge from "../ui/Badge.jsx";
import { formatPrecio } from "../../utils/format.js";
import { tinteDeColor } from "../../utils/prendas.js";
import "./PrendaCard.css";

/** Ficha del catálogo con forma de etiqueta: una prenda con todos sus colores y talles. */
export default function PrendaCard({ prenda }) {
  const { codigo, nombre, categoria, colores, talles, precioMin, precioMax, stockTotal, imagen } = prenda;
  const agotada = stockTotal <= 0;

  return (
    <article className={`prenda-card ${agotada ? "prenda-card--agotada" : ""}`.trim()}>
      <div className="prenda-card__media">
        {imagen ? (
          <ProductImage src={imagen} alt="" className="prenda-card__imagen" />
        ) : (
          <ProductoArte nombre={nombre} categoria={categoria} color={colores[0]} className="prenda-card__arte" />
        )}
        {agotada && (
          <span className="prenda-card__sello">
            <Badge tone="danger">Sin stock</Badge>
          </span>
        )}
      </div>
      <div className="prenda-card__cuerpo">
        <p className="prenda-card__categoria">{categoria}</p>
        <h2 className="prenda-card__nombre">
          <Link to={`/productos/${codigo}`} className="prenda-card__link">
            {nombre}
          </Link>
        </h2>
        {colores.length > 0 && (
          <ul className="prenda-card__colores" aria-label={`Colores: ${colores.join(", ")}`}>
            {colores.map((color) => (
              <li key={color} style={{ background: tinteDeColor(color) }} title={color} />
            ))}
          </ul>
        )}
        {talles.length > 0 && <p className="prenda-card__talles">Talles {talles.join(" · ")}</p>}
        <p className="prenda-card__precio">
          {precioMin === precioMax ? formatPrecio(precioMin) : `Desde ${formatPrecio(precioMin)}`}
        </p>
      </div>
    </article>
  );
}
