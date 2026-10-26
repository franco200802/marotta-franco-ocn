import { formatPrecio, METODOS_PAGO, TIPOS_ENTREGA } from "../../utils/format.js";
import "./DetallePedido.css";

/** Líneas, entrega y totales de un pedido. */
export default function DetallePedido({ pedido }) {
  return (
    <div className="detalle-pedido">
      <table className="detalle-pedido__tabla">
        <caption className="visually-hidden">Productos del pedido #{pedido.id}</caption>
        <thead>
          <tr>
            <th scope="col">Producto</th>
            <th scope="col" className="num">
              Cant.
            </th>
            <th scope="col" className="num">
              Precio
            </th>
            <th scope="col" className="num">
              Subtotal
            </th>
          </tr>
        </thead>
        <tbody>
          {pedido.detalles.map((detalle) => (
            <tr key={detalle.id}>
              <th scope="row">{detalle.nombreProducto}</th>
              <td className="num">{detalle.cantidad}</td>
              <td className="num">{formatPrecio(detalle.precioUnitario)}</td>
              <td className="num">{formatPrecio(detalle.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="detalle-pedido__datos">
        <div>
          <dt>Entrega</dt>
          <dd>
            {TIPOS_ENTREGA[pedido.envio?.tipo] ?? "—"}
            {pedido.envio?.direccion && ` · ${pedido.envio.direccion}`}
            {pedido.envio?.zona && ` (${pedido.envio.zona})`}
          </dd>
        </div>
        <div>
          <dt>Pago</dt>
          <dd>{METODOS_PAGO[pedido.metodoPago] ?? pedido.metodoPago} · al retirar o recibir</dd>
        </div>
        <div>
          <dt>Subtotal</dt>
          <dd>{formatPrecio(pedido.subtotal)}</dd>
        </div>
        <div>
          <dt>Envío</dt>
          <dd>{pedido.envio?.costo ? formatPrecio(pedido.envio.costo) : "Sin costo"}</dd>
        </div>
        <div className="detalle-pedido__total">
          <dt>Total</dt>
          <dd>{formatPrecio(pedido.total)}</dd>
        </div>
      </dl>
    </div>
  );
}
