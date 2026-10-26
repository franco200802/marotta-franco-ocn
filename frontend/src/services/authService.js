import { http } from "./apiClient.js";

export const iniciarSesion = (datos) => http.post("/auth/login", datos);
export const registrarse = (datos) => http.post("/auth/registro", datos);
export const obtenerPerfil = ({ signal } = {}) => http.get("/auth/perfil", { signal });
