export const EstadoPedido = Object.freeze({
  PENDIENTE: "Pendiente",
  CONFIRMADO: "Confirmado",
  EN_PREPARACION: "En preparación",
  ENVIADO: "Enviado",
  FINALIZADO: "Finalizado",
  CANCELADO: "Cancelado",
});

// Flujo del Análisis de Requerimientos: Cancelado solo desde Pendiente y no vuelve al flujo.
export const TransicionesPedido = Object.freeze({
  [EstadoPedido.PENDIENTE]: [EstadoPedido.CONFIRMADO, EstadoPedido.CANCELADO],
  [EstadoPedido.CONFIRMADO]: [EstadoPedido.EN_PREPARACION],
  [EstadoPedido.EN_PREPARACION]: [EstadoPedido.ENVIADO],
  [EstadoPedido.ENVIADO]: [EstadoPedido.FINALIZADO],
  [EstadoPedido.FINALIZADO]: [],
  [EstadoPedido.CANCELADO]: [],
});
