import carritoService from "../services/CarritoService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class CarritoController {
  validar(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.validar(req.body?.items));
    } catch (error) {
      next(error);
    }
  }
}

export default new CarritoController();
