import reporteService from "../services/ReporteService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class ReporteController {
  ventas(req, res, next) {
    try {
      return ApiResponse.success(res, reporteService.ventas({ desde: req.query.desde, hasta: req.query.hasta }));
    } catch (error) {
      next(error);
    }
  }
}

export default new ReporteController();
