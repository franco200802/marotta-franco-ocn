import Badge from "../ui/Badge.jsx";

/** RN-01: con stock 0 el producto no se puede vender, por eso se marca "Sin stock". */
export default function StockBadge({ stock }) {
  const cantidad = Number(stock);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return <Badge tone="danger">Sin stock</Badge>;
  }
  if (cantidad <= 2) {
    return <Badge tone="warning">{cantidad === 1 ? "Queda 1" : `Quedan ${cantidad}`}</Badge>;
  }
  return <Badge tone="success">{`${cantidad} disponibles`}</Badge>;
}
