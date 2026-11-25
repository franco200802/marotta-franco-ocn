import { Router } from "express";
import carritoController from "../controllers/CarritoController.js";
import { autenticar, autorizar } from "../middlewares/autenticar.js";
import { Roles } from "../enums/Roles.js";

const router = Router();

// Visitantes: valida el carrito guardado en el navegador (precio vigente y stock).
router.post("/validar", carritoController.validar);

// Clientes con sesión: carrito guardado en el servidor.
router.use(autenticar, autorizar(Roles.CLIENTE));
router.get("/", carritoController.obtener);
router.delete("/", carritoController.vaciar);
router.post("/items", carritoController.agregar);
router.post("/fusionar", carritoController.fusionar);
router.put("/items/:productoId", carritoController.actualizarCantidad);
router.delete("/items/:productoId", carritoController.quitar);

export default router;
