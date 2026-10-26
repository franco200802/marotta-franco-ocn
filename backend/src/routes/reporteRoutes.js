import { Router } from "express";
import reporteController from "../controllers/ReporteController.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

router.get("/ventas", autenticar, autorizar(Roles.ADMIN), reporteController.ventas);

export default router;
