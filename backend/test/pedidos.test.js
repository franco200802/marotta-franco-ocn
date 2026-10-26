import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { EstadoPedido } from "../src/enums/EstadoPedido.js";
import { conToken, crearApi, iniciarSesionAdmin, registrarCliente } from "./helpers.js";

// Códigos de los productos de ejemplo (ver src/repositories/datosIniciales.js).
const REMERA_M_NEGRA = 2; // $18.900, stock 8
const BUZO_M = 6; // $39.500, stock 5
const JEAN_42 = 10; // $46.000, stock 6
const SKATE_SIN_STOCK = 19;

const retiro = (items) => ({ items, tipoEntrega: "retiro_local", metodoPago: "efectivo" });

describe("Pedidos y reglas de negocio", () => {
  let api;
  let tokenAdmin;
  let tokenAna;
  let tokenJuan;

  before(async () => {
    api = crearApi();
    tokenAdmin = await iniciarSesionAdmin(api);
    tokenAna = (await registrarCliente(api, "ana@example.com")).token;
    tokenJuan = (await registrarCliente(api, "juan@example.com")).token;
  });

  const stockDe = async (codigo) => (await api.get(`/api/productos/${codigo}`)).body.data.stock;
  const crearPedido = (token, datos) => api.post("/api/pedidos").set(conToken(token)).send(datos);

  it("exige iniciar sesión como cliente para comprar", async () => {
    assert.equal((await api.post("/api/pedidos").send(retiro([]))).status, 401);
    const comoAdmin = await crearPedido(tokenAdmin, retiro([{ productoId: REMERA_M_NEGRA, cantidad: 1 }]));
    assert.equal(comoAdmin.status, 403);
  });

  it("valida carrito, cantidad, tipo de entrega y método de pago", async () => {
    const casos = [
      [retiro([]), 400, Messages.CARRITO_VACIO],
      [retiro([{ productoId: REMERA_M_NEGRA, cantidad: 0 }]), 400, Messages.CANTIDAD_INVALIDA],
      [retiro([{ productoId: REMERA_M_NEGRA, cantidad: 1.5 }]), 400, Messages.CANTIDAD_INVALIDA],
      [{ ...retiro([{ productoId: 1, cantidad: 1 }]), tipoEntrega: "drone" }, 400, Messages.TIPO_ENTREGA_INVALIDO],
      [{ ...retiro([{ productoId: 1, cantidad: 1 }]), metodoPago: "cripto" }, 400, Messages.METODO_PAGO_INVALIDO],
    ];
    for (const [datos, status, mensaje] of casos) {
      const respuesta = await crearPedido(tokenAna, datos);
      assert.equal(respuesta.status, status, JSON.stringify(datos));
      assert.equal(respuesta.body.message, mensaje);
    }
  });

  it("RN-01: no vende productos sin stock ni más unidades que las disponibles", async () => {
    const sinStock = await crearPedido(tokenAna, retiro([{ productoId: SKATE_SIN_STOCK, cantidad: 1 }]));
    assert.equal(sinStock.status, 409);
    assert.equal(sinStock.body.message, Messages.STOCK_INSUFICIENTE);

    const demasiadas = await crearPedido(tokenAna, retiro([{ productoId: BUZO_M, cantidad: 6 }]));
    assert.equal(demasiadas.status, 409);
    assert.equal(await stockDe(BUZO_M), 5, "un pedido rechazado no descuenta stock");
  });

  it("crea un pedido Pendiente, descuenta stock y guarda el detalle", async () => {
    const respuesta = await crearPedido(
      tokenAna,
      retiro([
        { productoId: REMERA_M_NEGRA, cantidad: 1 },
        { productoId: REMERA_M_NEGRA, cantidad: 1 },
        { productoId: BUZO_M, cantidad: 1 },
      ]),
    );
    assert.equal(respuesta.status, 201);
    const pedido = respuesta.body.data;
    assert.equal(pedido.estado, EstadoPedido.PENDIENTE);
    assert.equal(pedido.subtotal, 18900 * 2 + 39500);
    assert.equal(pedido.total, pedido.subtotal);
    assert.equal(pedido.envio.tipo, "retiro_local");
    assert.equal(pedido.envio.costo, 0);
    assert.equal(pedido.detalles.length, 2, "las líneas repetidas se agrupan");
    assert.equal(pedido.detalles[0].nombreProducto, "Remera oversize · M, Negro");
    assert.equal(await stockDe(REMERA_M_NEGRA), 6);
    assert.equal(await stockDe(BUZO_M), 4);
  });

  it("envío a domicilio: exige dirección y zona, y suma el costo de la zona", async () => {
    const domicilio = (cambios) => ({
      items: [{ productoId: REMERA_M_NEGRA, cantidad: 1 }],
      tipoEntrega: "domicilio",
      metodoPago: "transferencia",
      zonaId: 2,
      direccion: "Monroe 4800, CABA",
      ...cambios,
    });

    const sinDireccion = await crearPedido(tokenAna, domicilio({ direccion: " " }));
    assert.equal(sinDireccion.status, 400);
    assert.equal(sinDireccion.body.message, Messages.DIRECCION_REQUERIDA);

    const zonaInexistente = await crearPedido(tokenAna, domicilio({ zonaId: 99 }));
    assert.equal(zonaInexistente.status, 404);

    const conEnvio = await crearPedido(tokenAna, domicilio());
    assert.equal(conEnvio.status, 201);
    assert.equal(conEnvio.body.data.envio.costo, 6000);
    assert.equal(conEnvio.body.data.envio.direccion, "Monroe 4800, CABA");
    assert.equal(conEnvio.body.data.total, 18900 + 6000);
  });

  it("RN-04: el envío es gratis cuando la compra alcanza el mínimo que fija el administrador", async () => {
    const cotizar = (subtotal) =>
      api.post("/api/envios/cotizar").send({ tipoEntrega: "domicilio", zonaId: 1, subtotal });

    const debajo = await cotizar(10000);
    assert.equal(debajo.body.data.envioGratis, false);
    assert.equal(debajo.body.data.costo, 3500);
    assert.equal(debajo.body.data.faltanteParaEnvioGratis, 80000);

    const cambio = await api
      .put("/api/envios/configuracion")
      .set(conToken(tokenAdmin))
      .send({ montoMinimoEnvioGratis: 40000 });
    assert.equal(cambio.status, 200);
    assert.equal(
      (await api.put("/api/envios/configuracion").set(conToken(tokenAna)).send({ montoMinimoEnvioGratis: 1 })).status,
      403,
    );

    const pedido = await crearPedido(tokenAna, {
      items: [{ productoId: JEAN_42, cantidad: 1 }],
      tipoEntrega: "domicilio",
      metodoPago: "efectivo",
      zonaId: 1,
      direccion: "Monroe 4800, CABA",
    });
    assert.equal(pedido.status, 201);
    assert.equal(pedido.body.data.envio.costo, 0);
    assert.equal(pedido.body.data.total, 46000);
  });

  it("RN-05: el carrito avisa si cambió un precio y el pedido cobra el precio vigente", async () => {
    await api.put(`/api/productos/${BUZO_M}`).set(conToken(tokenAdmin)).send({ precio: 41000 });

    const validacion = await api
      .post("/api/carrito/validar")
      .send({ items: [{ productoId: BUZO_M, cantidad: 1, precio: 39500 }] });
    assert.equal(validacion.status, 200);
    assert.equal(validacion.body.data.items[0].precioCambio, true);
    assert.equal(validacion.body.data.items[0].precioActual, 41000);
    assert.equal(validacion.body.data.hayCambios, true);

    const pedido = await crearPedido(tokenAna, retiro([{ productoId: BUZO_M, cantidad: 1 }]));
    assert.equal(pedido.body.data.detalles[0].precioUnitario, 41000);
  });

  it("validar el carrito detecta cantidades mayores al stock y productos sin stock", async () => {
    const respuesta = await api.post("/api/carrito/validar").send({
      items: [
        { productoId: SKATE_SIN_STOCK, cantidad: 1 },
        { productoId: REMERA_M_NEGRA, cantidad: 500 },
      ],
    });
    const [skate, remera] = respuesta.body.data.items;
    assert.equal(skate.disponible, false);
    assert.equal(remera.cantidadValida, false);
  });

  it("cada cliente ve solo sus pedidos", async () => {
    const mios = await api.get("/api/pedidos/mios").set(conToken(tokenAna));
    assert.equal(mios.status, 200);
    assert.ok(mios.body.data.length >= 3);

    const ajeno = await api.get(`/api/pedidos/${mios.body.data[0].id}`).set(conToken(tokenJuan));
    assert.equal(ajeno.status, 404);
    assert.equal((await api.get("/api/pedidos/mios").set(conToken(tokenJuan))).body.data.length, 0);
    assert.equal((await api.get("/api/pedidos").set(conToken(tokenJuan))).status, 403);
  });

  it("el administrador avanza el pedido solo por transiciones válidas", async () => {
    const { body } = await crearPedido(tokenJuan, retiro([{ productoId: REMERA_M_NEGRA, cantidad: 1 }]));
    const id = body.data.id;
    const cambiar = (estado, token = tokenAdmin) =>
      api.patch(`/api/pedidos/${id}/estado`).set(conToken(token)).send({ estado });

    assert.equal((await cambiar(EstadoPedido.CONFIRMADO, tokenJuan)).status, 403);
    assert.equal((await cambiar("Volando")).status, 400);

    const salto = await cambiar(EstadoPedido.ENVIADO);
    assert.equal(salto.status, 409);
    assert.equal(salto.body.message, Messages.TRANSICION_INVALIDA);

    for (const estado of [
      EstadoPedido.CONFIRMADO,
      EstadoPedido.EN_PREPARACION,
      EstadoPedido.ENVIADO,
      EstadoPedido.FINALIZADO,
    ]) {
      const respuesta = await cambiar(estado);
      assert.equal(respuesta.status, 200, estado);
      assert.equal(respuesta.body.data.estado, estado);
    }
    assert.deepEqual((await cambiar(EstadoPedido.CANCELADO)).status, 409, "un pedido finalizado no se cancela");

    const filtrados = await api
      .get(`/api/pedidos?estado=${encodeURIComponent(EstadoPedido.FINALIZADO)}`)
      .set(conToken(tokenAdmin));
    assert.ok(filtrados.body.data.every((pedido) => pedido.estado === EstadoPedido.FINALIZADO));
    assert.ok(filtrados.body.data[0].cliente.email);
  });

  it("RN-03: el cliente cancela solo en Pendiente y se restablece el stock", async () => {
    const stockAntes = await stockDe(JEAN_42);
    const { body } = await crearPedido(tokenAna, retiro([{ productoId: JEAN_42, cantidad: 2 }]));
    assert.equal(await stockDe(JEAN_42), stockAntes - 2);

    const cancelado = await api.patch(`/api/pedidos/${body.data.id}/cancelar`).set(conToken(tokenAna));
    assert.equal(cancelado.status, 200);
    assert.equal(cancelado.body.data.estado, EstadoPedido.CANCELADO);
    assert.equal(await stockDe(JEAN_42), stockAntes);

    const otro = await crearPedido(tokenAna, retiro([{ productoId: JEAN_42, cantidad: 1 }]));
    await api
      .patch(`/api/pedidos/${otro.body.data.id}/estado`)
      .set(conToken(tokenAdmin))
      .send({ estado: EstadoPedido.CONFIRMADO });
    const tarde = await api.patch(`/api/pedidos/${otro.body.data.id}/cancelar`).set(conToken(tokenAna));
    assert.equal(tarde.status, 409);
    assert.equal(tarde.body.message, Messages.CANCELACION_NO_PERMITIDA);

    const ajeno = await api.patch(`/api/pedidos/${otro.body.data.id}/cancelar`).set(conToken(tokenJuan));
    assert.equal(ajeno.status, 404);
  });

  it("reportes de ventas: solo el administrador, sin contar cancelados", async () => {
    assert.equal((await api.get("/api/reportes/ventas").set(conToken(tokenAna))).status, 403);
    assert.equal((await api.get("/api/reportes/ventas?desde=ayer").set(conToken(tokenAdmin))).status, 400);

    const respuesta = await api.get("/api/reportes/ventas").set(conToken(tokenAdmin));
    assert.equal(respuesta.status, 200);
    const reporte = respuesta.body.data;
    const todos = (await api.get("/api/pedidos").set(conToken(tokenAdmin))).body.data;
    const validos = todos.filter((pedido) => pedido.estado !== EstadoPedido.CANCELADO);
    assert.equal(reporte.cantidadPedidos, validos.length);
    assert.equal(
      reporte.totalVendido,
      validos.reduce((suma, pedido) => suma + pedido.total, 0),
    );
    assert.equal(reporte.porDia.length, 30);
    assert.ok(reporte.porProducto.length > 0);
    assert.equal(reporte.porEstado.find((fila) => fila.estado === EstadoPedido.CANCELADO).cantidad, 1);

    const clientes = await api.get("/api/clientes").set(conToken(tokenAdmin));
    assert.equal(clientes.status, 200);
    assert.ok(clientes.body.data.every((cliente) => !("password" in cliente)));
  });
});
