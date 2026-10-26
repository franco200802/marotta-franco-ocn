export function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function isPositiveNumber(value) {
  return typeof value === "number" && !Number.isNaN(value) && value >= 0;
}

export function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) ? id : null;
}
