import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middlewares/errorHandler.js";
import { cargarDatosIniciales } from "./repositories/datosIniciales.js";
import { config } from "./utils/config.js";

export function createApp({ conDatosIniciales = true } = {}) {
  const app = express();

  if (config.trustProxy) {
    app.set("trust proxy", config.trustProxy);
  }

  app.use(helmet());
  app.use(cors({ origin: config.corsOrigins }));
  app.use(express.json({ limit: "100kb" }));

  if (conDatosIniciales) {
    cargarDatosIniciales();
  }

  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
