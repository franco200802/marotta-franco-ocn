import { useCallback, useMemo, useRef, useState } from "react";
import PageHeader from "../../components/ui/PageHeader.jsx";
import Button from "../../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../../components/ui/Feedback.jsx";
import { PlusIcon, RefreshIcon } from "../../components/ui/Icons.jsx";
import ProductFilters from "../../components/productos/ProductFilters.jsx";
import ProductTable from "../../components/productos/ProductTable.jsx";
import { useApiResource } from "../../hooks/useApiResource.js";
import { useToast } from "../../hooks/useToast.js";
import { useConfirm } from "../../hooks/useConfirm.js";
import { deleteProducto, getProductos, updateProducto } from "../../services/productoService.js";
import { nombreDeVariante } from "../../utils/prendas.js";
import { normalizeText } from "../../utils/text.js";
import "./AdminPages.css";

const fetchTodos = (signal) => getProductos({ signal, todos: true });

/** Gestión de productos: listado (con desactivados), búsqueda, stock rápido y baja con confirmación. */
export default function AdminProductsPage() {
  const { data, isLoading, error, reload, setData } = useApiResource(fetchTodos);
  const productos = useMemo(() => data ?? [], [data]);
  const toast = useToast();
  const confirmar = useConfirm();
  const [query, setQuery] = useState("");
  const headingRef = useRef(null);

  const filtrados = useMemo(() => {
    const texto = normalizeText(query);
    if (!texto) return productos;
    return productos.filter((producto) =>
      [producto.codigo, producto.nombre, producto.categoria, producto.color, producto.talle].some((campo) =>
        normalizeText(campo).includes(texto),
      ),
    );
  }, [productos, query]);

  const guardarStock = useCallback(
    async (producto, stock) => {
      try {
        const actualizado = await updateProducto(producto.codigo, { stock });
        setData((actuales) => actuales.map((p) => (p.codigo === actualizado.codigo ? actualizado : p)));
        toast.success(`${nombreDeVariante(actualizado)}: stock ${actualizado.stock}.`, "Stock actualizado");
      } catch (fallo) {
        toast.error(fallo.message, "No se pudo actualizar el stock");
        throw fallo;
      }
    },
    [setData, toast],
  );

  function pedirEliminacion(producto) {
    confirmar({
      titulo: "¿Eliminar producto?",
      mensaje: (
        <>
          <p>
            Vas a eliminar <strong>{nombreDeVariante(producto)}</strong> (código #{producto.codigo}).
          </p>
          <p>Esta acción no se puede deshacer. Si solo querés ocultarlo, editalo y desactivalo.</p>
        </>
      ),
      confirmar: "Sí, eliminar",
      procesando: "Eliminando…",
      focoAlTerminar: headingRef.current,
      accion: async () => {
        try {
          await deleteProducto(producto.codigo);
          setData((actuales) => actuales.filter((p) => p.codigo !== producto.codigo));
          toast.success(`Se eliminó ${nombreDeVariante(producto)}.`, "Producto eliminado");
        } catch (fallo) {
          toast.error(fallo.message, "No se pudo eliminar");
          if (fallo.isNotFound) reload();
          throw fallo;
        }
      },
    });
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando productos…" />;
    if (error) return <ErrorMessage title="No pudimos cargar los productos" message={error.message} onRetry={reload} />;
    if (productos.length === 0) {
      return (
        <EmptyState
          title="No hay productos cargados"
          message="Creá el primer producto para que aparezca en el catálogo."
          action={
            <Button to="/admin/productos/nuevo" icon={<PlusIcon size={18} />}>
              Crear producto
            </Button>
          }
        />
      );
    }

    return (
      <>
        <div className="admin-toolbar">
          <ProductFilters
            idPrefix="admin"
            searchLabel="Buscar por nombre, código, categoría, talle o color"
            query={query}
            onQueryChange={setQuery}
          />
          <Button variant="ghost" icon={<RefreshIcon size={18} />} onClick={reload}>
            Actualizar
          </Button>
        </div>
        <p className="admin-count" role="status">
          {query
            ? `${filtrados.length} de ${productos.length} productos coinciden`
            : `${productos.length} productos (cada talle y color es un producto)`}
        </p>
        {filtrados.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            message={`Ningún producto coincide con "${query}".`}
            action={
              <Button variant="outline" onClick={() => setQuery("")}>
                Limpiar búsqueda
              </Button>
            }
          />
        ) : (
          <ProductTable
            productos={filtrados}
            onDelete={pedirEliminacion}
            onStock={guardarStock}
            caption="Productos registrados"
          />
        )}
      </>
    );
  }

  return (
    <div className="section">
      <title>Productos | Administración OCN</title>
      <div className="container">
        <PageHeader
          title="Productos"
          description="Alta, edición, stock y baja de prendas, accesorios y skates."
          headingRef={headingRef}
          actions={
            <Button to="/admin/productos/nuevo" icon={<PlusIcon size={18} />}>
              Nuevo producto
            </Button>
          }
        />
        {renderContenido()}
      </div>
    </div>
  );
}
