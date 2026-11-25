import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { conToken, crearApi, iniciarSesionAdmin, registrarCliente } from "./helpers.js";

// Códigos de los productos de ejemplo (ver src/repositories/datosIniciales.js).
const REMERA_M_NEGRA = 2; // $18.900, stock 8
const BUZO_M = 6; // $39.500, stock 5
const BUZO_XL = 8; // $39.500, stock 1
const SKATE_SIN_STOCK = 19;

describe("Carrito guardado en el servidor (Entrega 4)", () => {
  let api;
  let tokenAdmin;
  let tokenAna;

  before(async () => {
    api = crearApi();
    tokenAdmin = await iniciarSesionAdmin(api);
    tokenAna = (await registrarCliente(api, "ana.carrito@example.com")).token;
  });

  const comoAna = (metodo, ruta) => api[metodo](ruta).set(conToken(tokenAna));
  const agregar = (productoId, cantidad) => comoAna("post", "/api/carrito/items").send({ productoId, cantidad });
  const carrito = async () => (await comoAna("get", "/api/carrito")).body.data;
  const editarProducto = (codigo, cambios) =>
    api.put(`/api/productos/${codigo}`).set(conToken(tokenAdmin)).send(cambios);

  beforeEach(async () => {
    await comoAna("delete", "/api/carrito");
  });

  it("exige iniciar sesión como cliente", async () => {
    assert.equal((await api.get("/api/carrito")).status, 401);
    const comoAdmin = await api.get("/api/carrito").set(conToken(tokenAdmin));
    assert.equal(comoAdmin.status, 403);
  });

  it("agrega prendas, suma cantidades y calcula el total con el precio del servidor", async () => {
    const primera = await agregar(REMERA_M_NEGRA, 2);
    assert.equal(primera.status, 201);
    await agregar(REMERA_M_NEGRA, 1);
    await agregar(BUZO_M, 1);

    const { items, cantidadTotal, subtotal } = await carrito();
    assert.equal(items.length, 2);
    assert.equal(items.find((item) => item.productoId === REMERA_M_NEGRA).cantidad, 3);
    assert.equal(cantidadTotal, 4);
    assert.equal(subtotal, 18900 * 3 + 39500);
  });

  it("Validación 3 y RN-01: cantidad entera, producto existente y sin superar el stock", async () => {
    const casos = [
      [REMERA_M_NEGRA, 0, 400, Messages.CANTIDAD_INVALIDA],
      [REMERA_M_NEGRA, 1.5, 400, Messages.CANTIDAD_INVALIDA],
      [9999, 1, 404, Messages.PRODUCTO_NOT_FOUND],
      [SKATE_SIN_STOCK, 1, 409, Messages.STOCK_INSUFICIENTE],
      [BUZO_M, 6, 409, Messages.STOCK_INSUFICIENTE],
    ];
    for (const [productoId, cantidad, status, mensaje] of casos) {
      const respuesta = await agregar(productoId, cantidad);
      assert.equal(respuesta.status, status, `${productoId} x ${cantidad}`);
      assert.equal(respuesta.body.message, mensaje);
    }

    await agregar(BUZO_XL, 1);
    const otraMas = await agregar(BUZO_XL, 1);
    assert.equal(otraMas.status, 409);
    assert.equal(otraMas.body.message, Messages.STOCK_CARRITO_SUPERADO);
    assert.equal((await carrito()).items.length, 1, "un pedido rechazado no cambia el carrito");
  });

  it("modifica cantidades y quita prendas", async () => {
    await agregar(REMERA_M_NEGRA, 1);

    const cambio = await comoAna("put", `/api/carrito/items/${REMERA_M_NEGRA}`).send({ cantidad: 4 });
    assert.equal(cambio.status, 200);
    assert.equal(cambio.body.data.items[0].cantidad, 4);

    const demasiadas = await comoAna("put", `/api/carrito/items/${REMERA_M_NEGRA}`).send({ cantidad: 9 });
    assert.equal(demasiadas.status, 409);
    const cero = await comoAna("put", `/api/carrito/items/${REMERA_M_NEGRA}`).send({ cantidad: 0 });
    assert.equal(cero.status, 400);
    const ajena = await comoAna("put", `/api/carrito/items/${BUZO_M}`).send({ cantidad: 1 });
    assert.equal(ajena.status, 404);
    assert.equal(ajena.body.message, Messages.ITEM_CARRITO_NOT_FOUND);

    const quitada = await comoAna("delete", `/api/carrito/items/${REMERA_M_NEGRA}`);
    assert.equal(quitada.status, 200);
    assert.deepEqual(quitada.body.data.items, []);
    assert.equal((await comoAna("delete", `/api/carrito/items/${REMERA_M_NEGRA}`)).status, 404);
  });

  it("RN-05: si el administrador cambia el precio, el carrito se actualiza y avisa una sola vez", async () => {
    await agregar(REMERA_M_NEGRA, 2);
    await editarProducto(REMERA_M_NEGRA, { precio: 20000 });

    const conCambio = await carrito();
    assert.equal(conCambio.items[0].precioCambio, true);
    assert.equal(conCambio.subtotal, 40000);
    assert.equal((await carrito()).items[0].precioCambio, false);

    await editarProducto(REMERA_M_NEGRA, { precio: 18900 });
  });

  it("RN-01: ajusta la cantidad si baja el stock y quita lo que se quedó sin stock", async () => {
    await agregar(BUZO_M, 4);
    await agregar(REMERA_M_NEGRA, 1);
    await editarProducto(BUZO_M, { stock: 2 });
    await editarProducto(REMERA_M_NEGRA, { stock: 0 });

    const revisado = await carrito();
    assert.equal(revisado.items.length, 1);
    assert.equal(revisado.items[0].cantidad, 2);
    assert.equal(revisado.items[0].cantidadAjustada, true);
    assert.deepEqual(
      revisado.quitados.map((item) => item.productoId),
      [REMERA_M_NEGRA],
    );

    await editarProducto(BUZO_M, { stock: 5 });
    await editarProducto(REMERA_M_NEGRA, { stock: 8 });
  });

  it("al iniciar sesión suma el carrito del visitante sin superar el stock", async () => {
    await agregar(BUZO_M, 4);
    const fusion = await comoAna("post", "/api/carrito/fusionar").send({
      items: [
        { productoId: BUZO_M, cantidad: 3 },
        { productoId: REMERA_M_NEGRA, cantidad: 1 },
        { productoId: SKATE_SIN_STOCK, cantidad: 1 },
        { productoId: "x", cantidad: 1 },
      ],
    });
    assert.equal(fusion.status, 200);
    const porId = Object.fromEntries(fusion.body.data.items.map((item) => [item.productoId, item.cantidad]));
    assert.deepEqual(porId, { [BUZO_M]: 5, [REMERA_M_NEGRA]: 1 });

    const invalido = await comoAna("post", "/api/carrito/fusionar").send({ items: "no" });
    assert.equal(invalido.status, 400);
  });

  it("confirma la compra con el carrito guardado y lo vacía", async () => {
    const vacio = await comoAna("post", "/api/pedidos").send({ tipoEntrega: "retiro_local", metodoPago: "efectivo" });
    assert.equal(vacio.status, 400);
    assert.equal(vacio.body.message, Messages.CARRITO_VACIO);

    await agregar(REMERA_M_NEGRA, 2);
    const pedido = await comoAna("post", "/api/pedidos").send({ tipoEntrega: "retiro_local", metodoPago: "efectivo" });
    assert.equal(pedido.status, 201);
    assert.equal(pedido.body.data.total, 18900 * 2);
    assert.equal(pedido.body.data.detalles[0].productoId, REMERA_M_NEGRA);
    assert.deepEqual((await carrito()).items, []);

    const remera = await api.get(`/api/productos/${REMERA_M_NEGRA}`);
    assert.equal(remera.body.data.stock, 6, "la compra descuenta el stock");
  });
});
