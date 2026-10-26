import { useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { ArrowLeftIcon } from "../components/ui/Icons.jsx";
import SeguimientoPedido from "../components/pedidos/SeguimientoPedido.jsx";
import DetallePedido from "../components/pedidos/DetallePedido.jsx";
import EstadoBadge from "../components/pedidos/EstadoBadge.jsx";
import { useApiResource } from "../hooks/useApiResource.js";
import { useRefrescoPeriodico } from "../hooks/useRefrescoPeriodico.js";
import { useAvisoDeEstado } from "../hooks/useAvisoDeEstado.js";
import { useConfirm } from "../hooks/useConfirm.js";
import { useToast } from "../hooks/useToast.js";
import { cancelarPedido, getPedido } from "../services/pedidoService.js";
import { formatFecha } from "../utils/format.js";
import "./PedidosPages.css";

const FINALES = ["Finalizado", "Cancelado"];

/** Confirmación y seguimiento de un pedido. Se actualiza solo cada 20 s mientras la pestaña está visible. */
export default function PedidoPage() {
  const { id } = useParams();
  const fetchPedido = useCallback((signal) => getPedido(id, { signal }), [id]);
  const { data: pedido, isLoading, error, reload, refrescar, setData } = useApiResource(fetchPedido);
  const seguidos = useMemo(() => (pedido ? [pedido] : null), [pedido]);
  const registrar = useAvisoDeEstado(seguidos);
  const confirmar = useConfirm();
  const toast = useToast();

  useRefrescoPeriodico(refrescar, { activo: Boolean(pedido) && !FINALES.includes(pedido?.estado) });

  async function pedirCancelacion() {
    await confirmar({
      titulo: `¿Cancelar el pedido #${pedido.id}?`,
      mensaje: "Las prendas vuelven al stock del local. Esta acción no se puede deshacer.",
      confirmar: "Sí, cancelar pedido",
      cancelar: "No, mantenerlo",
      procesando: "Cancelando…",
      accion: async () => {
        try {
          const actualizado = await cancelarPedido(pedido.id);
          registrar(actualizado.id, actualizado.estado);
          setData(actualizado);
          toast.success(`El pedido #${actualizado.id} quedó cancelado.`, "Pedido cancelado");
        } catch (fallo) {
          toast.error(fallo.message, "No se pudo cancelar");
          throw fallo;
        }
      },
    });
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando tu pedido…" />;
    if (error) {
      return error.isNotFound ? (
        <ErrorMessage
          title="Pedido no encontrado"
          message="Este pedido no existe o no es de tu cuenta."
          action={<Button to="/mis-pedidos">Ver mis pedidos</Button>}
        />
      ) : (
        <ErrorMessage title="No pudimos cargar el pedido" message={error.message} onRetry={reload} />
      );
    }

    return (
      <div className="pedido">
        <div className="pedido__estado parche parche--blanco">
          <div className="pedido__estado-cabecera">
            <p>
              Hecho el {formatFecha(pedido.fecha)} · <EstadoBadge estado={pedido.estado} />
            </p>
            {pedido.estado === "Pendiente" && (
              <Button variant="danger-ghost" size="sm" onClick={pedirCancelacion}>
                Cancelar pedido
              </Button>
            )}
          </div>
          <SeguimientoPedido estado={pedido.estado} tipoEntrega={pedido.envio?.tipo} />
          {!FINALES.includes(pedido.estado) && (
            <p className="pedido__nota">Esta pantalla se actualiza sola cuando el local avanza tu pedido.</p>
          )}
        </div>
        <div className="parche parche--blanco pedido__detalle">
          <DetallePedido pedido={pedido} />
        </div>
      </div>
    );
  }

  return (
    <div className="section section--stone">
      <title>{`Pedido #${id} | OCN Villa Urquiza`}</title>
      <div className="container">
        <Link to="/mis-pedidos" className="back-link">
          <ArrowLeftIcon size={18} />
          Mis pedidos
        </Link>
        <PageHeader title={`Pedido #${id}`} />
        {renderContenido()}
      </div>
    </div>
  );
}
