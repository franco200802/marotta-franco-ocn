import { Router } from "express";
import productoController from "../controllers/ProductoController.js";

const router = Router();

router.get("/", productoController.obtenerTodos);
router.get("/:codigo", productoController.obtenerPorCodigo);
router.post("/", productoController.crear);
router.put("/:codigo", productoController.actualizar);
router.delete("/:codigo", productoController.eliminar);

export default router;
