/** Normaliza un texto para búsquedas: minúsculas y sin tildes. */
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}
