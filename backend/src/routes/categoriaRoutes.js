import { Router } from "express";
import productoController from "../controllers/ProductoController.js";

const router = Router();

router.get("/", productoController.obtenerCategorias);

export default router;
