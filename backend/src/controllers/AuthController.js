import authService from "../services/AuthService.js";
import clienteService from "../services/ClienteService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class AuthController {
  async registrar(req, res, next) {
    try {
      const sesion = await authService.registrar(req.body);
      return ApiResponse.success(res, sesion, 201);
    } catch (error) {
      next(error);
    }
  }

  async iniciarSesion(req, res, next) {
    try {
      const sesion = await authService.iniciarSesion(req.body);
      return ApiResponse.success(res, sesion);
    } catch (error) {
      next(error);
    }
  }

  perfil(req, res, next) {
    try {
      return ApiResponse.success(res, clienteService.obtenerPerfil(req.usuario));
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();
