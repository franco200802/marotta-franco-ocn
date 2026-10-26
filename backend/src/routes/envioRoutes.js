import { Router } from "express";
import envioController from "../controllers/EnvioController.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

router.get("/zonas", envioController.listarZonas);
router.post("/cotizar", envioController.cotizar);
router.put("/configuracion", autenticar, autorizar(Roles.ADMIN), envioController.actualizarConfiguracion);

export default router;
