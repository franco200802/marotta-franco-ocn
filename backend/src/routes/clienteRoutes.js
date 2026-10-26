import { Router } from "express";
import clienteController from "../controllers/ClienteController.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

router.use(autenticar);
router.get("/", autorizar(Roles.ADMIN), clienteController.listar);
router.put("/perfil", autorizar(Roles.CLIENTE), clienteController.actualizarPerfil);

export default router;
