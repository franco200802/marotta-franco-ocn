import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { conToken, crearApi, iniciarSesionAdmin, registrarCliente } from "./helpers.js";

const REMERA_M_NEGRA = 2;

describe("Gestión de clientes por el administrador (Entrega 4)", () => {
  let api;
  let tokenAdmin;
  let juan;

  before(async () => {
    api = crearApi();
    tokenAdmin = await iniciarSesionAdmin(api);
    juan = await registrarCliente(api, "juan.gestion@example.com");
  });

  const cambiarEstado = (id, cuerpo, token = tokenAdmin) =>
    api.patch(`/api/clientes/${id}/estado`).set(conToken(token)).send(cuerpo);
  const login = () =>
    api.post("/api/auth/login").send({ email: "juan.gestion@example.com", password: "una-clave-larga" });

  it("solo el administrador cambia el estado de una cuenta, con datos válidos", async () => {
    assert.equal((await cambiarEstado(juan.usuario.id, { activo: false }, juan.token)).status, 403);

    const sinDato = await cambiarEstado(juan.usuario.id, { activo: "no" });
    assert.equal(sinDato.status, 400);
    assert.equal(sinDato.body.message, Messages.ESTADO_CLIENTE_INVALIDO);

    const inexistente = await cambiarEstado(9999, { activo: false });
    assert.equal(inexistente.status, 404);
    assert.equal(inexistente.body.message, Messages.CLIENTE_NOT_FOUND);
  });

  it("una cuenta desactivada no puede iniciar sesión, usar el carrito ni comprar", async () => {
    await api.post("/api/carrito/items").set(conToken(juan.token)).send({ productoId: REMERA_M_NEGRA, cantidad: 1 });

    const desactivada = await cambiarEstado(juan.usuario.id, { activo: false });
    assert.equal(desactivada.status, 200);
    assert.equal(desactivada.body.data.activo, false);

    const ingreso = await login();
    assert.equal(ingreso.status, 403);
    assert.equal(ingreso.body.message, Messages.CUENTA_DESACTIVADA);

    const carrito = await api.get("/api/carrito").set(conToken(juan.token));
    assert.equal(carrito.status, 403);
    const compra = await api
      .post("/api/pedidos")
      .set(conToken(juan.token))
      .send({ tipoEntrega: "retiro_local", metodoPago: "efectivo" });
    assert.equal(compra.status, 403);

    const listado = await api.get("/api/clientes").set(conToken(tokenAdmin));
    assert.equal(listado.body.data.find((cliente) => cliente.id === juan.usuario.id).activo, false);
  });

  it("al reactivarla vuelve a ingresar y conserva su carrito", async () => {
    assert.equal((await cambiarEstado(juan.usuario.id, { activo: true })).status, 200);
    const ingreso = await login();
    assert.equal(ingreso.status, 200);

    const carrito = await api.get("/api/carrito").set(conToken(ingreso.body.data.token));
    assert.equal(carrito.body.data.items.length, 1);
  });
});
