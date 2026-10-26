import AppError from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { ApiResponse } from "../responses/ApiResponse.js";

export function notFoundHandler(req, res) {
  return ApiResponse.error(res, Messages.ROUTE_NOT_FOUND, 404);
}

// Único lugar donde se arma la respuesta de error de toda la API.
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  // JSON mal formado o demasiado grande: lo detecta express.json antes de llegar a la ruta.
  if (err.type === "entity.parse.failed" || err.type === "entity.too.large") {
    return ApiResponse.error(res, Messages.INVALID_DATA, 400);
  }

  console.error(err);
  return ApiResponse.error(res, Messages.INTERNAL_ERROR, 500);
}
