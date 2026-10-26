import productoService from "../services/ProductoService.js";
import { ApiResponse } from "../responses/ApiResponse.js";
import { Roles } from "../enums/Roles.js";

const esAdmin = (req) => req.usuario?.rol === Roles.ADMIN;

class ProductoController {
  obtenerTodos(req, res, next) {
    try {
      const productos = productoService.obtenerTodos({ incluirInactivos: esAdmin(req) && req.query.todos === "1" });
      return ApiResponse.success(res, productos);
    } catch (error) {
      next(error);
    }
  }

  obtenerPorCodigo(req, res, next) {
    try {
      const producto = productoService.obtenerPorCodigo(req.params.codigo, { incluirInactivos: esAdmin(req) });
      return ApiResponse.success(res, producto);
    } catch (error) {
      next(error);
    }
  }

  crear(req, res, next) {
    try {
      const producto = productoService.crear(req.body);
      return ApiResponse.success(res, producto, 201);
    } catch (error) {
      next(error);
    }
  }

  actualizar(req, res, next) {
    try {
      const producto = productoService.actualizar(req.params.codigo, req.body);
      return ApiResponse.success(res, producto);
    } catch (error) {
      next(error);
    }
  }

  eliminar(req, res, next) {
    try {
      productoService.eliminar(req.params.codigo);
      return ApiResponse.success(res, null);
    } catch (error) {
      next(error);
    }
  }

  obtenerCategorias(req, res, next) {
    try {
      return ApiResponse.success(res, productoService.obtenerCategorias());
    } catch (error) {
      next(error);
    }
  }
}

export default new ProductoController();
