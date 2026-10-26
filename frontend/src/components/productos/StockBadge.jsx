import Badge from "../ui/Badge.jsx";

/** RN-01: un producto con stock 0 no puede venderse, por eso se marca como "Sin stock". */
export default function StockBadge({ stock }) {
  const cantidad = Number(stock);
  if (!Number.isFinite(cantidad) || cantidad <= 0) {
    return <Badge tone="danger">Sin stock</Badge>;
  }
  return <Badge tone="success">{cantidad === 1 ? "1 disponible" : `${cantidad} disponibles`}</Badge>;
}
