import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { Messages } from "../src/enums/Messages.js";
import { conToken, crearApi, iniciarSesionAdmin, productoValido, registrarCliente } from "./helpers.js";

describe("CRUD de Productos", () => {
  let api;
  let tokenAdmin;
  let tokenCliente;

  before(async () => {
    api = crearApi();
    tokenAdmin = await iniciarSesionAdmin(api);
    tokenCliente = (await registrarCliente(api)).token;
  });

  it("lista los productos con el formato { success, data }", async () => {
    const respuesta = await api.get("/api/productos");
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.success, true);
    assert.ok(Array.isArray(respuesta.body.data));
    assert.ok(respuesta.body.data.length > 0);
  });

  it("el catálogo público funciona aunque llegue un token vencido o inválido", async () => {
    const respuesta = await api.get("/api/productos").set(conToken("token-viejo"));
    assert.equal(respuesta.status, 200);
    assert.ok(respuesta.body.data.length > 0);
  });

  it("obtiene un producto por código y responde 404 si no existe", async () => {
    const existente = await api.get("/api/productos/1");
    assert.equal(existente.status, 200);
    assert.equal(existente.body.data.codigo, 1);

    for (const codigo of ["9999", "abc"]) {
      const inexistente = await api.get(`/api/productos/${codigo}`);
      assert.equal(inexistente.status, 404);
      assert.deepEqual(inexistente.body, { success: false, message: Messages.PRODUCTO_NOT_FOUND });
    }
  });

  it("exige iniciar sesión (401) y ser administrador (403) para escribir", async () => {
    const sinToken = await api.post("/api/productos").send(productoValido());
    assert.equal(sinToken.status, 401);
    assert.equal(sinToken.body.message, Messages.TOKEN_REQUERIDO);

    const comoCliente = await api.post("/api/productos").set(conToken(tokenCliente)).send(productoValido());
    assert.equal(comoCliente.status, 403);
    assert.equal(comoCliente.body.message, Messages.ACCESO_DENEGADO);
  });

  it("crea un producto y rechaza un duplicado con 409", async () => {
    const creado = await api.post("/api/productos").set(conToken(tokenAdmin)).send(productoValido());
    assert.equal(creado.status, 201);
    assert.equal(creado.body.data.nombre, "Remera de prueba");
    assert.equal(creado.body.data.activo, true);
    assert.ok(Number.isInteger(creado.body.data.codigo));

    const duplicado = await api
      .post("/api/productos")
      .set(conToken(tokenAdmin))
      .send(productoValido({ nombre: "remera de PRUEBA" }));
    assert.equal(duplicado.status, 409);
    assert.equal(duplicado.body.message, Messages.PRODUCTO_DUPLICADO);
  });

  it("valida los datos del producto con 400", async () => {
    const casos = [
      [{ nombre: "  " }, Messages.PRODUCTO_CAMPOS_OBLIGATORIOS],
      [{ precio: "1000" }, Messages.PRODUCTO_PRECIO_INVALIDO],
      [{ precio: -5 }, Messages.PRODUCTO_PRECIO_INVALIDO],
      [{ stock: 1.5 }, Messages.PRODUCTO_STOCK_INVALIDO],
      [{ imagen: "foto.jpg" }, Messages.PRODUCTO_IMAGEN_INVALIDA],
    ];
    for (const [cambios, mensaje] of casos) {
      const respuesta = await api
        .post("/api/productos")
        .set(conToken(tokenAdmin))
        .send(productoValido({ color: "Otro", ...cambios }));
      assert.equal(respuesta.status, 400, JSON.stringify(cambios));
      assert.equal(respuesta.body.message, mensaje);
    }
  });

  it("actualiza un producto sin dejar cambiar el código", async () => {
    const respuesta = await api
      .put("/api/productos/2")
      .set(conToken(tokenAdmin))
      .send({ precio: 20000, stock: 9, codigo: 77 });
    assert.equal(respuesta.status, 200);
    assert.equal(respuesta.body.data.codigo, 2);
    assert.equal(respuesta.body.data.precio, 20000);
    assert.equal(respuesta.body.data.stock, 9);

    const invalido = await api.put("/api/productos/2").set(conToken(tokenAdmin)).send({ precio: -1 });
    assert.equal(invalido.status, 400);

    const inexistente = await api.put("/api/productos/9999").set(conToken(tokenAdmin)).send({ precio: 1 });
    assert.equal(inexistente.status, 404);
  });

  it("desactiva un producto: deja de verse en el catálogo público pero el admin lo ve", async () => {
    const desactivado = await api.put("/api/productos/3").set(conToken(tokenAdmin)).send({ activo: false });
    assert.equal(desactivado.status, 200);
    assert.equal(desactivado.body.data.activo, false);

    assert.equal((await api.get("/api/productos/3")).status, 404);
    const publico = await api.get("/api/productos");
    assert.equal(
      publico.body.data.some((producto) => producto.codigo === 3),
      false,
    );
    const todos = await api.get("/api/productos?todos=1").set(conToken(tokenAdmin));
    assert.equal(
      todos.body.data.some((producto) => producto.codigo === 3),
      true,
    );
  });

  it("elimina un producto y responde 404 al eliminarlo otra vez", async () => {
    const eliminado = await api.delete("/api/productos/4").set(conToken(tokenAdmin));
    assert.equal(eliminado.status, 200);
    assert.deepEqual(eliminado.body, { success: true, data: null });

    const otraVez = await api.delete("/api/productos/4").set(conToken(tokenAdmin));
    assert.equal(otraVez.status, 404);
  });

  it("deriva las categorías de los productos activos", async () => {
    const respuesta = await api.get("/api/categorias");
    assert.equal(respuesta.status, 200);
    const nombres = respuesta.body.data.map((categoria) => categoria.nombre);
    assert.ok(nombres.includes("Remeras"));
    assert.deepEqual(
      nombres,
      [...nombres].sort((a, b) => a.localeCompare(b, "es")),
    );
  });
});

describe("Errores generales", () => {
  it("responde 404 con formato consistente en una ruta inexistente", async () => {
    const respuesta = await crearApi().get("/api/no-existe");
    assert.equal(respuesta.status, 404);
    assert.deepEqual(respuesta.body, { success: false, message: Messages.ROUTE_NOT_FOUND });
  });

  it("responde 400 ante un JSON mal formado", async () => {
    const respuesta = await crearApi().post("/api/auth/login").set("Content-Type", "application/json").send("{malo");
    assert.equal(respuesta.status, 400);
    assert.equal(respuesta.body.message, Messages.INVALID_DATA);
  });
});
