import { Router } from "express";
import productoRoutes from "./productoRoutes.js";
import categoriaRoutes from "./categoriaRoutes.js";
import authRoutes from "./authRoutes.js";
import clienteRoutes from "./clienteRoutes.js";
import pedidoRoutes from "./pedidoRoutes.js";
import carritoRoutes from "./carritoRoutes.js";
import envioRoutes from "./envioRoutes.js";
import reporteRoutes from "./reporteRoutes.js";
import localRoutes from "./localRoutes.js";

const router = Router();

router.use("/productos", productoRoutes);
router.use("/categorias", categoriaRoutes);
router.use("/auth", authRoutes);
router.use("/clientes", clienteRoutes);
router.use("/pedidos", pedidoRoutes);
router.use("/carrito", carritoRoutes);
router.use("/envios", envioRoutes);
router.use("/reportes", reporteRoutes);
router.use("/local", localRoutes);

export default router;
