import localService from "../services/LocalService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class LocalController {
  obtener(req, res, next) {
    try {
      return ApiResponse.success(res, localService.obtener());
    } catch (error) {
      next(error);
    }
  }
}

export default new LocalController();
