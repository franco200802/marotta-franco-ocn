import "./setup.js";
import request from "supertest";
import { createApp } from "../src/app.js";

/** Cada llamada vuelve a cargar los datos iniciales (repositorios en memoria limpios). */
export const crearApi = () => request(createApp());

export const conToken = (token) => ({ Authorization: `Bearer ${token}` });

export async function iniciarSesionAdmin(api) {
  const respuesta = await api
    .post("/api/auth/login")
    .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
  return respuesta.body.data.token;
}

export async function registrarCliente(api, email = "ana@example.com") {
  const respuesta = await api.post("/api/auth/registro").send({
    nombre: "Ana",
    apellido: "Pérez",
    email,
    password: "una-clave-larga",
    direccion: "Monroe 4800, CABA",
  });
  return respuesta.body.data;
}

export const productoValido = (cambios = {}) => ({
  nombre: "Remera de prueba",
  categoria: "Remeras",
  talle: "M",
  color: "Verde",
  descripcion: "Solo para tests",
  precio: 10000,
  stock: 3,
  imagen: "",
  ...cambios,
});
