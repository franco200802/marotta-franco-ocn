import { Router } from "express";
import productoController from "../controllers/ProductoController.js";
import { autenticar, autenticarOpcional, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

// Lectura pública; escritura solo para el administrador.
router.get("/", autenticarOpcional, productoController.obtenerTodos);
router.get("/:codigo", autenticarOpcional, productoController.obtenerPorCodigo);
router.post("/", autenticar, autorizar(Roles.ADMIN), productoController.crear);
router.put("/:codigo", autenticar, autorizar(Roles.ADMIN), productoController.actualizar);
router.delete("/:codigo", autenticar, autorizar(Roles.ADMIN), productoController.eliminar);

export default router;
