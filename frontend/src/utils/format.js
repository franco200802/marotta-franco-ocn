const formatoEntero = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

const formatoConDecimales = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrecio(valor) {
  const numero = Number(valor);
  if (!Number.isFinite(numero)) return "—";
  return Number.isInteger(numero) ? formatoEntero.format(numero) : formatoConDecimales.format(numero);
}

/** Devuelve el texto o un guion cuando el dato opcional no fue cargado. */
export function textoOGuion(valor) {
  return typeof valor === "string" && valor.trim() ? valor : "—";
}

const formatoFecha = new Intl.DateTimeFormat("es-AR", {
  timeZone: "America/Argentina/Buenos_Aires",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatFecha = (iso) => (iso ? formatoFecha.format(new Date(iso)) : "—");

const formatoDia = new Intl.DateTimeFormat("es-AR", { timeZone: "UTC", day: "numeric", month: "short" });

/** "2026-10-26" → "26 oct" (fecha sin hora, sin corrimiento de zona). */
export const formatDia = (fechaIso) => formatoDia.format(new Date(`${fechaIso}T00:00:00Z`));

export const ESTADOS_PEDIDO = ["Pendiente", "Confirmado", "En preparación", "Enviado", "Finalizado"];

export const TIPOS_ENTREGA = {
  retiro_local: "Retiro en el local",
  domicilio: "Envío a domicilio",
};

export const METODOS_PAGO = {
  efectivo: "Efectivo",
  transferencia: "Transferencia",
  mercado_pago: "Mercado Pago",
};
