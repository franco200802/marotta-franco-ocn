import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import { ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { ArrowLeftIcon } from "../components/ui/Icons.jsx";
import ProductImage from "../components/productos/ProductImage.jsx";
import StockBadge from "../components/productos/StockBadge.jsx";
import { useProducto } from "../hooks/useProductos.js";
import { formatPrecio, textoOGuion } from "../utils/format.js";
import { whatsappUrl } from "../utils/negocio.js";
import "./ProductDetailPage.css";

/** Ficha de un producto obtenida con GET /api/productos/:codigo. */
export default function ProductDetailPage() {
  const { codigo } = useParams();
  const { producto, isLoading, error, reload } = useProducto(codigo);

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando producto…" />;

    if (error) {
      return error.isNotFound ? (
        <ErrorMessage
          title="Producto no encontrado"
          message="El producto que buscás no existe o ya no está disponible."
          action={<Button to="/productos">Ver catálogo</Button>}
        />
      ) : (
        <ErrorMessage title="No pudimos cargar el producto" message={error.message} onRetry={reload} />
      );
    }

    if (!producto) {
      return <ErrorMessage title="Producto no encontrado" action={<Button to="/productos">Ver catálogo</Button>} />;
    }

    const sinStock = Number(producto.stock) <= 0;
    const consulta = `Hola! Quería consultar por el producto "${producto.nombre}" (código ${producto.codigo}).`;

    return (
      <article className="product-detail">
        <title>{`${producto.nombre} | OCN Villa Urquiza`}</title>
        <div className="product-detail__media">
          <ProductImage src={producto.imagen} alt={producto.nombre} className="product-detail__image" />
        </div>

        <div className="product-detail__info">
          <p className="product-detail__category">{producto.categoria}</p>
          <h1>{producto.nombre}</h1>
          <div className="product-detail__price-row">
            <p className="product-detail__price">{formatPrecio(producto.precio)}</p>
            <StockBadge stock={producto.stock} />
          </div>

          {producto.descripcion && <p className="product-detail__description">{producto.descripcion}</p>}

          <dl className="product-detail__specs">
            <div>
              <dt>Código</dt>
              <dd>#{producto.codigo}</dd>
            </div>
            <div>
              <dt>Talle</dt>
              <dd>{textoOGuion(producto.talle)}</dd>
            </div>
            <div>
              <dt>Color</dt>
              <dd>{textoOGuion(producto.color)}</dd>
            </div>
          </dl>

          <div className="product-detail__actions">
            <Button href={whatsappUrl(consulta)}>{sinStock ? "Consultar reposición" : "Consultar por WhatsApp"}</Button>
            <Button variant="outline" to="/productos">
              Seguir viendo
            </Button>
          </div>
          {sinStock && (
            <p className="text-muted product-detail__note">
              Este producto no tiene stock en este momento, por lo que no está disponible para la venta.
            </p>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="section">
      <div className="container">
        <Link to="/productos" className="back-link">
          <ArrowLeftIcon size={18} />
          Volver al catálogo
        </Link>
        {renderContenido()}
      </div>
    </div>
  );
}
