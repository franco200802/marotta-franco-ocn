import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import { RefreshIcon } from "../../components/ui/Icons.jsx";
import EstadoBadge from "../../components/pedidos/EstadoBadge.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { useRefrescoPeriodico } from "../../hooks/useRefrescoPeriodico.js";
import { useConfirm } from "../../hooks/useConfirm.js";
import { useToast } from "../../hooks/useToast.js";
import { cambiarEstadoPedido, getPedidos } from "../../services/pedidoService.js";
import { ESTADOS_PEDIDO, formatFecha, formatPrecio, TIPOS_ENTREGA } from "../../utils/format.js";
import "./AdminPages.css";

const fetchPedidos = (signal) => getPedidos({ signal });
const FILTROS = ["", ...ESTADOS_PEDIDO, "Cancelado"];

const accionDe = (estado, tipoEntrega) =>
  ({
    Confirmado: "Confirmar pago",
    "En preparación": "Pasar a preparación",
    Enviado: tipoEntrega === "retiro_local" ? "Marcar listo para retirar" : "Marcar enviado",
    Finalizado: "Finalizar",
    Cancelado: "Cancelar",
  })[estado] ?? estado;

/** Todos los pedidos: filtro por estado y botones para avanzar por el flujo. */
export default function AdminPedidosPage() {
  const { data, isLoading, error, reload, refrescar, setData } = useApiResource(fetchPedidos);
  const pedidos = useMemo(() => data ?? [], [data]);
  const [filtro, setFiltro] = useState("Pendiente");
  const [cambiando, setCambiando] = useState(null);
  const confirmar = useConfirm();
  const toast = useToast();
  useRefrescoPeriodico(refrescar);

  const visibles = filtro ? pedidos.filter((pedido) => pedido.estado === filtro) : pedidos;
  const cantidad = (estado) => (estado ? pedidos.filter((p) => p.estado === estado).length : pedidos.length);

  async function aplicar(pedido, estado) {
    setCambiando(pedido.id);
    try {
      const actualizado = await cambiarEstadoPedido(pedido.id, estado);
      setData((actuales) => actuales.map((p) => (p.id === actualizado.id ? actualizado : p)));
      toast.success(`El pedido #${pedido.id} pasó a "${estado}".`, "Estado actualizado");
    } catch (fallo) {
      toast.error(fallo.message, "No se pudo cambiar el estado");
      throw fallo;
    } finally {
      setCambiando(null);
    }
  }

  function cambiar(pedido, estado) {
    if (estado !== "Cancelado") {
      aplicar(pedido, estado).catch(() => {});
      return;
    }
    confirmar({
      titulo: `¿Cancelar el pedido #${pedido.id}?`,
      mensaje: "Las prendas vuelven al stock y el pedido no puede volver al flujo.",
      confirmar: "Sí, cancelar",
      cancelar: "No",
      procesando: "Cancelando…",
      accion: () => aplicar(pedido, estado),
    });
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando pedidos…" />;
    if (error) return <ErrorMessage title="No pudimos cargar los pedidos" message={error.message} onRetry={reload} />;
    return (
      <>
        <div className="admin-toolbar">
          <div className="filtro-estados" role="group" aria-label="Filtrar por estado">
            {FILTROS.map((estado) => (
              <button
                key={estado || "todos"}
                type="button"
                className="filtro-estados__btn"
                aria-pressed={filtro === estado}
                onClick={() => setFiltro(estado)}
              >
                {estado || "Todos"} <span className="filtro-estados__n">{cantidad(estado)}</span>
              </button>
            ))}
          </div>
          <Button variant="ghost" icon={<RefreshIcon size={18} />} onClick={reload}>
            Actualizar
          </Button>
        </div>
        {visibles.length === 0 ? (
          <EmptyState
            title={filtro ? `No hay pedidos "${filtro}"` : "Todavía no hay pedidos"}
            message="Cuando un cliente compre, el pedido aparece acá como Pendiente."
          />
        ) : (
          <div className="tabla-admin__wrapper">
            <table className="tabla-admin">
              <caption className="visually-hidden">Pedidos {filtro && `en estado ${filtro}`}</caption>
              <thead>
                <tr>
                  <th scope="col">Pedido</th>
                  <th scope="col">Cliente</th>
                  <th scope="col">Entrega</th>
                  <th scope="col" className="num">
                    Total
                  </th>
                  <th scope="col">Estado</th>
                  <th scope="col">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((pedido) => (
                  <tr key={pedido.id}>
                    <th scope="row" data-label="Pedido">
                      <Link to={`/pedidos/${pedido.id}`}>#{pedido.id}</Link>
                      <span className="tabla-admin__sub">{formatFecha(pedido.fecha)}</span>
                    </th>
                    <td data-label="Cliente">
                      {pedido.cliente ? `${pedido.cliente.nombre} ${pedido.cliente.apellido}` : "—"}
                      <span className="tabla-admin__sub">{pedido.cliente?.email}</span>
                    </td>
                    <td data-label="Entrega">
                      {TIPOS_ENTREGA[pedido.envio?.tipo]}
                      {pedido.envio?.zona && <span className="tabla-admin__sub">{pedido.envio.zona}</span>}
                    </td>
                    <td data-label="Total" className="num">
                      {formatPrecio(pedido.total)}
                    </td>
                    <td data-label="Estado">
                      <EstadoBadge estado={pedido.estado} />
                    </td>
                    <td>
                      <div className="tabla-admin__acciones">
                        {pedido.siguientesEstados.length === 0 ? (
                          <span className="text-muted">Sin acciones</span>
                        ) : (
                          pedido.siguientesEstados.map((estado) => (
                            <Button
                              key={estado}
                              size="sm"
                              variant={estado === "Cancelado" ? "danger-ghost" : "outline"}
                              disabled={cambiando === pedido.id}
                              onClick={() => cambiar(pedido, estado)}
                            >
                              {accionDe(estado, pedido.envio?.tipo)}
                            </Button>
                          ))
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="section">
      <title>Pedidos | Administración OCN</title>
      <div className="container">
        <PageHeader
          title="Pedidos"
          description="Confirmá pagos y avanzá cada pedido. La lista se actualiza sola cada 20 segundos."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
