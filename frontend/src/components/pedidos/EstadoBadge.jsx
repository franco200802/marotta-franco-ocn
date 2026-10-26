import Badge from "../ui/Badge.jsx";

const TONOS = {
  Pendiente: "warning",
  Confirmado: "neutral",
  "En preparación": "neutral",
  Enviado: "neutral",
  Finalizado: "success",
  Cancelado: "danger",
};

export default function EstadoBadge({ estado }) {
  return <Badge tone={TONOS[estado] ?? "neutral"}>{estado}</Badge>;
}
