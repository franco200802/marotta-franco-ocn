import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import QuantityStepper from "../components/ui/QuantityStepper.jsx";
import { ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { ArrowLeftIcon, BagIcon, ChatIcon } from "../components/ui/Icons.jsx";
import ProductImage from "../components/productos/ProductImage.jsx";
import ProductoArte from "../components/productos/ProductoArte.jsx";
import PrendaCard from "../components/productos/PrendaCard.jsx";
import SelectorVariante from "../components/productos/SelectorVariante.jsx";
import StockBadge from "../components/productos/StockBadge.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { useSeleccionVariante } from "../hooks/useSeleccionVariante.js";
import { useSumarAlCarrito } from "../hooks/useSumarAlCarrito.js";
import { agruparPrendas, claveDePrenda, nombreDeVariante } from "../utils/prendas.js";
import { formatPrecio } from "../utils/format.js";
import { whatsappUrl } from "../utils/negocio.js";
import "./ProductDetailPage.css";

function FichaPrenda({ prenda, codigo }) {
  const { color, talle, variante, elegirColor, elegirTalle } = useSeleccionVariante(prenda, codigo);
  const [cantidad, setCantidad] = useState(1);
  const sumar = useSumarAlCarrito();
  const stock = variante?.stock ?? 0;
  const cantidadValida = Math.min(cantidad, Math.max(1, stock));

  return (
    <article className="ficha">
      <title>{`${prenda.nombre} | OCN Villa Urquiza`}</title>
      <div className="ficha__media parche parche--blanco">
        {prenda.imagen ? (
          <ProductImage src={prenda.imagen} alt={prenda.nombre} className="ficha__imagen" />
        ) : (
          <ProductoArte
            nombre={prenda.nombre}
            categoria={prenda.categoria}
            color={color}
            titulo={`Dibujo de ${prenda.nombre} en color ${color || "a elección"}`}
          />
        )}
      </div>

      <div className="ficha__info">
        <p className="ficha__categoria">{prenda.categoria}</p>
        <h1>{prenda.nombre}</h1>
        <div className="ficha__precio-fila">
          <p className="ficha__precio">{formatPrecio(variante?.precio ?? prenda.precioMin)}</p>
          <StockBadge stock={stock} />
        </div>
        {prenda.descripcion && <p className="ficha__descripcion">{prenda.descripcion}</p>}

        <SelectorVariante
          prenda={prenda}
          idPrefix="ficha"
          color={color}
          talle={talle}
          onColor={(nuevo) => {
            elegirColor(nuevo);
            setCantidad(1);
          }}
          onTalle={(nuevo) => {
            elegirTalle(nuevo);
            setCantidad(1);
          }}
        />

        <div className="ficha__compra">
          <QuantityStepper
            value={cantidadValida}
            max={Math.max(1, stock)}
            disabled={stock <= 0}
            onChange={setCantidad}
            label="Cantidad"
          />
          <Button
            size="lg"
            icon={<BagIcon size={20} />}
            disabled={stock <= 0}
            onClick={() => sumar(variante, cantidadValida)}
          >
            {stock > 0 ? "Sumar al carrito" : "Sin stock"}
          </Button>
        </div>
        {stock <= 0 && (
          <p className="ficha__nota">
            Este talle y color no tiene stock, así que no se puede vender. Probá con otra combinación o consultanos.
          </p>
        )}

        <Button
          variant="ghost"
          icon={<ChatIcon size={18} />}
          href={whatsappUrl(`Hola! Quería consultar por ${variante ? nombreDeVariante(variante) : prenda.nombre}.`)}
        >
          Consultar por WhatsApp
        </Button>

        <dl className="ficha__datos">
          <div>
            <dt>Código</dt>
            <dd>#{variante?.codigo ?? "—"}</dd>
          </div>
          <div>
            <dt>Talles</dt>
            <dd>{prenda.talles.join(", ") || "—"}</dd>
          </div>
          <div>
            <dt>Colores</dt>
            <dd>{prenda.colores.join(", ") || "—"}</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}

/** Detalle de una prenda con todas sus variantes de talle y color. */
export default function ProductDetailPage() {
  const { codigo } = useParams();
  const { productos, isLoading, error, reload } = useProductos();

  const { prenda, relacionadas } = useMemo(() => {
    const producto = productos.find((p) => String(p.codigo) === codigo);
    if (!producto) return { prenda: null, relacionadas: [] };
    const prendas = agruparPrendas(productos);
    const actual = prendas.find((p) => p.clave === claveDePrenda(producto));
    return {
      prenda: actual,
      relacionadas: prendas
        .filter((p) => p.clave !== actual.clave && p.categoria === actual.categoria)
        .concat(prendas.filter((p) => p.clave !== actual.clave && p.categoria !== actual.categoria))
        .slice(0, 4),
    };
  }, [productos, codigo]);

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando producto…" />;
    if (error) return <ErrorMessage title="No pudimos cargar el producto" message={error.message} onRetry={reload} />;
    if (!prenda) {
      return (
        <ErrorMessage
          title="Producto no encontrado"
          message="El producto que buscás no existe o ya no está a la venta."
          action={<Button to="/productos">Ver productos</Button>}
        />
      );
    }
    return (
      <>
        <FichaPrenda key={codigo} prenda={prenda} codigo={Number(codigo)} />
        {relacionadas.length > 0 && (
          <section className="relacionadas" aria-labelledby="relacionadas-titulo">
            <h2 id="relacionadas-titulo">También te puede gustar</h2>
            <ul className="catalog__grid">
              {relacionadas.map((p) => (
                <li key={p.clave}>
                  <PrendaCard prenda={p} />
                </li>
              ))}
            </ul>
          </section>
        )}
      </>
    );
  }

  return (
    <div className="section section--stone">
      <div className="container">
        <Link to="/productos" className="back-link">
          <ArrowLeftIcon size={18} />
          Volver a productos
        </Link>
        {renderContenido()}
      </div>
    </div>
  );
}
