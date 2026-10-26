import { Router } from "express";
import pedidoController from "../controllers/PedidoController.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

router.use(autenticar);

// "/mios" va antes de "/:id" para que no se interprete como un identificador.
router.get("/mios", autorizar(Roles.CLIENTE), pedidoController.listarMios);
router.get("/", autorizar(Roles.ADMIN), pedidoController.listarTodos);
router.post("/", autorizar(Roles.CLIENTE), pedidoController.crear);
router.get("/:id", pedidoController.obtener);
router.patch("/:id/estado", autorizar(Roles.ADMIN), pedidoController.cambiarEstado);
router.patch("/:id/cancelar", autorizar(Roles.CLIENTE), pedidoController.cancelar);

export default router;
