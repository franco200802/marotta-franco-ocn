import { Link } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import EstadoBadge from "../components/pedidos/EstadoBadge.jsx";
import { useApiResource } from "../hooks/useApiResource.js";
import { useRefrescoPeriodico } from "../hooks/useRefrescoPeriodico.js";
import { useAvisoDeEstado } from "../hooks/useAvisoDeEstado.js";
import { usePedirDeNuevo } from "../hooks/usePedirDeNuevo.js";
import { getMisPedidos } from "../services/pedidoService.js";
import { formatFecha, formatPrecio, TIPOS_ENTREGA } from "../utils/format.js";
import "./PedidosPages.css";

const fetchMisPedidos = (signal) => getMisPedidos({ signal });

/** Historial de compras del cliente, con su estado al día. */
export default function MisPedidosPage() {
  const { data: pedidos, isLoading, error, reload, refrescar } = useApiResource(fetchMisPedidos);
  useAvisoDeEstado(pedidos);
  useRefrescoPeriodico(refrescar, { activo: Boolean(pedidos?.length) });
  const pedirDeNuevo = usePedirDeNuevo();

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando tus pedidos…" />;
    if (error) return <ErrorMessage title="No pudimos cargar tus pedidos" message={error.message} onRetry={reload} />;
    if (pedidos.length === 0) {
      return (
        <EmptyState
          title="Todavía no hiciste pedidos"
          message="Cuando compres, acá vas a ver el estado de cada uno."
          action={<Button to="/productos">Ver productos</Button>}
        />
      );
    }
    return (
      <ul className="lista-pedidos">
        {pedidos.map((pedido) => (
          <li key={pedido.id} className="tarjeta-pedido parche parche--blanco">
            <div className="tarjeta-pedido__cabecera">
              <h2>
                <Link to={`/pedidos/${pedido.id}`}>Pedido #{pedido.id}</Link>
              </h2>
              <EstadoBadge estado={pedido.estado} />
            </div>
            <p className="tarjeta-pedido__meta">
              {formatFecha(pedido.fecha)} · {TIPOS_ENTREGA[pedido.envio?.tipo] ?? ""}
            </p>
            <p className="tarjeta-pedido__items">
              {pedido.detalles.map((detalle) => `${detalle.cantidad} × ${detalle.nombreProducto}`).join(", ")}
            </p>
            <div className="tarjeta-pedido__pie">
              <strong>{formatPrecio(pedido.total)}</strong>
              <div className="tarjeta-pedido__acciones">
                <Button variant="ghost" size="sm" onClick={() => pedirDeNuevo(pedido)}>
                  Pedir de nuevo
                </Button>
                <Button size="sm" to={`/pedidos/${pedido.id}`}>
                  Ver seguimiento
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="section section--stone">
      <title>Mis pedidos | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          title="Mis pedidos"
          description="Tu historial de compras. Se actualiza solo cuando un pedido avanza."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
