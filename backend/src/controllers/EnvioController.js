import envioService from "../services/EnvioService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class EnvioController {
  listarZonas(req, res, next) {
    try {
      return ApiResponse.success(res, {
        zonas: envioService.listarZonas(),
        ...envioService.obtenerConfiguracion(),
      });
    } catch (error) {
      next(error);
    }
  }

  cotizar(req, res, next) {
    try {
      return ApiResponse.success(res, envioService.cotizar(req.body ?? {}));
    } catch (error) {
      next(error);
    }
  }

  actualizarConfiguracion(req, res, next) {
    try {
      return ApiResponse.success(res, envioService.actualizarConfiguracion(req.body));
    } catch (error) {
      next(error);
    }
  }
}

export default new EnvioController();
