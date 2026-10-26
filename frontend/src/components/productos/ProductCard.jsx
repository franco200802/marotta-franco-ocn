import { Link } from "react-router-dom";
import ProductImage from "./ProductImage.jsx";
import StockBadge from "./StockBadge.jsx";
import { formatPrecio } from "../../utils/format.js";
import "./ProductCard.css";

/** Tarjeta del catálogo, con el mismo formato que las tarjetas de "Productos estrella" del mockup. */
export default function ProductCard({ producto }) {
  const { codigo, nombre, categoria, talle, color, precio, stock, imagen } = producto;
  const detalles = [talle && `Talle ${talle}`, color].filter(Boolean).join(" · ");

  return (
    <article className="product-card">
      <div className="product-card__media">
        <ProductImage src={imagen} alt="" className="product-card__image" />
      </div>
      <div className="product-card__body">
        <p className="product-card__category">{categoria}</p>
        <h2 className="product-card__name">
          <Link to={`/productos/${codigo}`} className="product-card__link">
            {nombre}
          </Link>
        </h2>
        {detalles && <p className="product-card__details">{detalles}</p>}
        <div className="product-card__footer">
          <p className="product-card__price">{formatPrecio(precio)}</p>
          <StockBadge stock={stock} />
        </div>
      </div>
    </article>
  );
}
