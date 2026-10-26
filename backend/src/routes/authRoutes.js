import { Router } from "express";
import authController from "../controllers/AuthController.js";
import { autenticar } from "../middlewares/autenticar.js";
import { limitadorAuth } from "../middlewares/limitador.js";

const router = Router();

router.post("/registro", limitadorAuth, authController.registrar);
router.post("/login", limitadorAuth, authController.iniciarSesion);
router.get("/perfil", autenticar, authController.perfil);

export default router;
