import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { conToken, crearApi, registrarCliente } from "./helpers.js";

const datosCliente = (cambios = {}) => ({
  nombre: "Ana",
  apellido: "Pérez",
  email: "Ana@Example.com",
  password: "una-clave-larga",
  direccion: "Monroe 4800, CABA",
  ...cambios,
});

describe("Registro, inicio de sesión y perfil", () => {
  let api;

  before(() => {
    api = crearApi();
  });

  it("registra un cliente sin devolver la contraseña", async () => {
    const respuesta = await api.post("/api/auth/registro").send(datosCliente());
    assert.equal(respuesta.status, 201);
    assert.equal(respuesta.body.data.usuario.email, "ana@example.com");
    assert.equal(respuesta.body.data.usuario.rol, "cliente");
    assert.equal("password" in respuesta.body.data.usuario, false);
    assert.ok(respuesta.body.data.token);
  });

  it("valida los campos obligatorios, el email y la contraseña", async () => {
    const casos = [
      [{ direccion: "" }, Messages.CAMPOS_OBLIGATORIOS],
      [{ apellido: undefined }, Messages.CAMPOS_OBLIGATORIOS],
      [{ email: "usuario-sin-arroba" }, Messages.EMAIL_INVALIDO],
      [{ email: "otra@example.com", password: "corta" }, Messages.PASSWORD_DEBIL],
    ];
    for (const [cambios, mensaje] of casos) {
      const respuesta = await api.post("/api/auth/registro").send(datosCliente(cambios));
      assert.equal(respuesta.status, 400, JSON.stringify(cambios));
      assert.equal(respuesta.body.message, mensaje);
    }
  });

  it("RN-02: rechaza un email ya registrado (sin importar mayúsculas) con 409", async () => {
    const respuesta = await api.post("/api/auth/registro").send(datosCliente({ email: "ANA@example.com " }));
    assert.equal(respuesta.status, 409);
    assert.equal(respuesta.body.message, Messages.EMAIL_DUPLICADO);

    const delAdmin = await api.post("/api/auth/registro").send(datosCliente({ email: process.env.ADMIN_EMAIL }));
    assert.equal(delAdmin.status, 409);
  });

  it("inicia sesión y usa el mismo mensaje para cualquier credencial incorrecta", async () => {
    const correcta = await api.post("/api/auth/login").send({ email: "ana@example.com", password: "una-clave-larga" });
    assert.equal(correcta.status, 200);
    assert.equal(correcta.body.data.usuario.rol, "cliente");

    const claveMala = await api.post("/api/auth/login").send({ email: "ana@example.com", password: "otra-clave" });
    const emailInexistente = await api.post("/api/auth/login").send({ email: "nadie@example.com", password: "x" });
    assert.equal(claveMala.status, 401);
    assert.equal(emailInexistente.status, 401);
    assert.equal(claveMala.body.message, Messages.CREDENCIALES_INVALIDAS);
    assert.equal(emailInexistente.body.message, Messages.CREDENCIALES_INVALIDAS);
  });

  it("el administrador inicia sesión con su rol", async () => {
    const respuesta = await api
      .post("/api/auth/login")
      .send({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD });
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.data.usuario.rol, "admin");
  });

  it("rechaza un token inválido con 401", async () => {
    const respuesta = await api.get("/api/auth/perfil").set(conToken("token-falso"));
    assert.equal(respuesta.status, 401);
    assert.equal(respuesta.body.message, Messages.TOKEN_INVALIDO);
  });

  it("el cliente consulta y edita sus datos", async () => {
    const { token } = await registrarCliente(api, "juan@example.com");

    const perfil = await api.get("/api/auth/perfil").set(conToken(token));
    assert.equal(perfil.status, 200);
    assert.equal(perfil.body.data.email, "juan@example.com");

    const editado = await api
      .put("/api/clientes/perfil")
      .set(conToken(token))
      .send({ direccion: "Bauness 2000, CABA", nombre: "Juan" });
    assert.equal(editado.status, 200);
    assert.equal(editado.body.data.direccion, "Bauness 2000, CABA");

    const emailOcupado = await api.put("/api/clientes/perfil").set(conToken(token)).send({ email: "ana@example.com" });
    assert.equal(emailOcupado.status, 409);

    const vacio = await api.put("/api/clientes/perfil").set(conToken(token)).send({ nombre: "" });
    assert.equal(vacio.status, 400);
  });

  it("solo el administrador lista los clientes", async () => {
    const { token } = await registrarCliente(api, "carla@example.com");
    const comoCliente = await api.get("/api/clientes").set(conToken(token));
    assert.equal(comoCliente.status, 403);
  });
});
