import { Router } from "express";
import carritoController from "../controllers/CarritoController.js";

const router = Router();

router.post("/validar", carritoController.validar);

export default router;
