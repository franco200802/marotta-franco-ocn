export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveNumber(value) {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value) && value >= 0;
}

export function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function isEmail(value) {
  return typeof value === "string" && EMAIL_REGEX.test(value.trim());
}

export function normalizeEmail(value) {
  return String(value).trim().toLowerCase();
}

export const PASSWORD_MIN_LENGTH = 8;

export function isValidPassword(value) {
  return typeof value === "string" && value.length >= PASSWORD_MIN_LENGTH;
}

export function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function isOneOf(value, enumObject) {
  return Object.values(enumObject).includes(value);
}

/** Texto opcional: devuelve el string recortado o "" si no vino. */
export function optionalString(value) {
  return typeof value === "string" ? value.trim() : "";
}

/** Clave de comparación sin mayúsculas ni tildes. */
export function normalizeKey(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim()
    .toLowerCase();
}
