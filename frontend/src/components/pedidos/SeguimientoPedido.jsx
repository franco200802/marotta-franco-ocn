import { CheckIcon } from "../ui/Icons.jsx";
import { ESTADOS_PEDIDO } from "../../utils/format.js";
import "./SeguimientoPedido.css";

const rotulo = (estado, tipoEntrega) =>
  estado === "Enviado" && tipoEntrega === "retiro_local" ? "Listo para retirar" : estado;

/** El recorrido del pedido. La etapa actual se marca con texto además de color. */
export default function SeguimientoPedido({ estado, tipoEntrega }) {
  if (estado === "Cancelado") {
    return (
      <p className="seguimiento seguimiento--cancelado" role="status">
        Este pedido se canceló y el stock volvió al local.
      </p>
    );
  }

  const actual = ESTADOS_PEDIDO.indexOf(estado);

  return (
    <ol className="seguimiento" aria-label="Estado del pedido">
      {ESTADOS_PEDIDO.map((etapa, indice) => {
        const hecho = indice < actual || estado === "Finalizado";
        const esActual = indice === actual && estado !== "Finalizado";
        return (
          <li
            key={etapa}
            className={`seguimiento__paso ${hecho ? "is-hecho" : ""} ${esActual ? "is-actual" : ""}`.trim()}
            aria-current={indice === actual ? "step" : undefined}
          >
            <span className="seguimiento__marca" aria-hidden="true">
              {hecho ? <CheckIcon size={18} /> : indice + 1}
            </span>
            <span className="seguimiento__rotulo">
              {rotulo(etapa, tipoEntrega)}
              <span className="visually-hidden">
                {hecho ? " (completado)" : esActual ? " (estado actual)" : " (pendiente)"}
              </span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
