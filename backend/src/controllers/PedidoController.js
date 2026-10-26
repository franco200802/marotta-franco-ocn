import pedidoService from "../services/PedidoService.js";
import { ApiResponse } from "../responses/ApiResponse.js";

class PedidoController {
  crear(req, res, next) {
    try {
      const pedido = pedidoService.crear(req.usuario.id, req.body);
      return ApiResponse.success(res, pedido, 201);
    } catch (error) {
      next(error);
    }
  }

  listarMios(req, res, next) {
    try {
      return ApiResponse.success(res, pedidoService.listarDe(req.usuario.id));
    } catch (error) {
      next(error);
    }
  }

  listarTodos(req, res, next) {
    try {
      return ApiResponse.success(res, pedidoService.listarTodos({ estado: req.query.estado }));
    } catch (error) {
      next(error);
    }
  }

  obtener(req, res, next) {
    try {
      return ApiResponse.success(res, pedidoService.obtener(req.params.id, req.usuario));
    } catch (error) {
      next(error);
    }
  }

  cambiarEstado(req, res, next) {
    try {
      return ApiResponse.success(res, pedidoService.cambiarEstado(req.params.id, req.body?.estado));
    } catch (error) {
      next(error);
    }
  }

  cancelar(req, res, next) {
    try {
      return ApiResponse.success(res, pedidoService.cancelar(req.params.id, req.usuario));
    } catch (error) {
      next(error);
    }
  }
}

export default new PedidoController();
