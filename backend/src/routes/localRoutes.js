import { Router } from "express";
import localController from "../controllers/LocalController.js";

const router = Router();

router.get("/", localController.obtener);

export default router;
