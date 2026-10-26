import clienteService from "../services/ClienteService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class ClienteController {
  listar(req, res, next) {
    try {
      return ApiResponse.success(res, clienteService.listar());
    } catch (error) {
      next(error);
    }
  }

  async actualizarPerfil(req, res, next) {
    try {
      const cliente = await clienteService.actualizarPerfil(req.usuario.id, req.body);
      return ApiResponse.success(res, cliente);
    } catch (error) {
      next(error);
    }
  }
}

export default new ClienteController();
