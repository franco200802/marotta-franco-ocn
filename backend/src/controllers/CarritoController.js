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

  obtener(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.obtener(req.usuario.id));
    } catch (error) {
      next(error);
    }
  }

  agregar(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.agregar(req.usuario.id, req.body), 201);
    } catch (error) {
      next(error);
    }
  }

  actualizarCantidad(req, res, next) {
    try {
      const carrito = carritoService.actualizarCantidad(req.usuario.id, req.params.productoId, req.body?.cantidad);
      return ApiResponse.success(res, carrito);
    } catch (error) {
      next(error);
    }
  }

  quitar(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.quitar(req.usuario.id, req.params.productoId));
    } catch (error) {
      next(error);
    }
  }

  vaciar(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.vaciar(req.usuario.id));
    } catch (error) {
      next(error);
    }
  }

  fusionar(req, res, next) {
    try {
      return ApiResponse.success(res, carritoService.fusionar(req.usuario.id, req.body?.items));
    } catch (error) {
      next(error);
    }
  }
}

export default new CarritoController();
