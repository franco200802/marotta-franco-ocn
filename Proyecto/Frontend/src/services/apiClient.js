/*
 * Cliente HTTP compartido por todos los servicios.
 * El backend responde con el formato { success, data } o { success: false, message }
 * (ver Backend/src/responses/ApiResponse.js).
 */

// URL base del servidor sin "/api". Vacía = misma URL del frontend (proxy de Vite).
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/+$/, "");

const CONNECTION_ERROR_MESSAGE =
  "No se pudo conectar con el servidor. Verificá que el backend esté en ejecución e intentá nuevamente.";

const STATUS_MESSAGES = {
  400: "Los datos enviados son inválidos.",
  404: "El recurso solicitado no existe.",
  409: "El recurso ya existe.",
};

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }

  get isNotFound() {
    return this.status === 404;
  }
}

async function readBody(response) {
  const text = await response.text();
  if (!text) return null;

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) {
    return { nonJson: true };
  }

  try {
    return JSON.parse(text);
  } catch {
    return { nonJson: true };
  }
}

function buildErrorMessage(status, body) {
  if (body && typeof body.message === "string" && body.message.trim()) {
    return body.message;
  }

  // El backend siempre responde JSON: un 5xx sin JSON proviene del proxy o de un servidor caído.
  if (status >= 500) {
    return body?.nonJson || body === null
      ? CONNECTION_ERROR_MESSAGE
      : "El servidor no pudo procesar la solicitud. Intentá más tarde.";
  }

  return STATUS_MESSAGES[status] ?? `La solicitud falló (código ${status}).`;
}

/**
 * Realiza una petición a la API y devuelve el campo `data` de la respuesta.
 * Lanza ApiError con un mensaje comprensible ante cualquier error.
 */
export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  const headers = { Accept: "application/json" };
  const options = { method, headers, signal };

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, options);
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError(CONNECTION_ERROR_MESSAGE, 0);
  }

  const payload = await readBody(response);

  if (!response.ok || payload?.success === false) {
    throw new ApiError(buildErrorMessage(response.status, payload), response.status);
  }

  if (payload?.nonJson) {
    throw new ApiError("El servidor devolvió una respuesta con un formato inesperado.", response.status);
  }

  if (payload && typeof payload === "object" && "success" in payload) {
    return payload.data ?? null;
  }

  return payload;
}
