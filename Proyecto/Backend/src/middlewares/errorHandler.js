import AppError from "../exceptions/AppError.js";
import { Messages } from "../enums/Messages.js";
import { ApiResponse } from "../responses/ApiResponse.js";

export function notFoundHandler(req, res) {
  return ApiResponse.error(res, Messages.ROUTE_NOT_FOUND, 404);
}

export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return ApiResponse.error(res, err.message, err.statusCode);
  }

  console.error(err);
  return ApiResponse.error(res, Messages.INTERNAL_ERROR, 500);
}
