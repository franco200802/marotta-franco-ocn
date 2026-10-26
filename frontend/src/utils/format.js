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
