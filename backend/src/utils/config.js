import "dotenv/config";
import { randomBytes } from "node:crypto";
import { Messages } from "../enums/Messages.js";

const environment = process.env.NODE_ENV || "development";
const isProduction = environment === "production";

if (isProduction && (!process.env.JWT_SECRET || !process.env.ADMIN_PASSWORD)) {
  throw new Error(Messages.ENV_MISSING);
}

const parseList = (value) =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export const config = Object.freeze({
  environment,
  isTest: environment === "test",
  port: Number(process.env.PORT) || 3000,
  // Sin JWT_SECRET en desarrollo se genera uno al arrancar: las sesiones se pierden al reiniciar.
  jwtSecret: process.env.JWT_SECRET || randomBytes(32).toString("hex"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  // Credenciales de desarrollo documentadas en .env.example; en producción son obligatorias.
  adminEmail: process.env.ADMIN_EMAIL || "admin@ocn.local",
  adminPassword: process.env.ADMIN_PASSWORD || "ocn-admin-dev",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 10,
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) || 1 : false,
  corsOrigins: parseList(
    process.env.CORS_ORIGIN || "http://localhost:5173,http://127.0.0.1:5173,http://localhost:4173",
  ),
});

export default config;
