import { useMemo, useRef, useState } from "react";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { EmptyState, ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import { PlusIcon, RefreshIcon } from "../components/ui/Icons.jsx";
import ProductFilters from "../components/productos/ProductFilters.jsx";
import ProductTable from "../components/productos/ProductTable.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { useToast } from "../hooks/useToast.js";
import { deleteProducto } from "../services/productoService.js";
import { normalizeText } from "../utils/text.js";
import "./AdminProductsPage.css";

/** Gestión de productos del administrador: listado, búsqueda y eliminación con confirmación. */
export default function AdminProductsPage() {
  const { productos, isLoading, error, reload, setData } = useProductos();
  const toast = useToast();
  const [query, setQuery] = useState("");
  const [productoAEliminar, setProductoAEliminar] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const headingRef = useRef(null);

  const productosFiltrados = useMemo(() => {
    const texto = normalizeText(query);
    if (!texto) return productos;
    return productos.filter((producto) =>
      [producto.codigo, producto.nombre, producto.categoria].some((campo) => normalizeText(campo).includes(texto)),
    );
  }, [productos, query]);

  async function confirmarEliminacion() {
    if (!productoAEliminar || isDeleting) return;
    const { codigo, nombre } = productoAEliminar;

    setIsDeleting(true);
    try {
      await deleteProducto(codigo);
      // El servidor confirmó la eliminación: se quita el producto del listado visible.
      setData((actuales) => actuales.filter((producto) => producto.codigo !== codigo));
      setProductoAEliminar(null);
      toast.success(`Se eliminó "${nombre}".`, "Producto eliminado");
    } catch (deleteError) {
      toast.error(deleteError.message, "No se pudo eliminar el producto");
      if (deleteError.isNotFound) {
        setProductoAEliminar(null);
        reload();
      }
    } finally {
      setIsDeleting(false);
    }
  }

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando productos…" />;

    if (error) {
      return <ErrorMessage title="No pudimos cargar los productos" message={error.message} onRetry={reload} />;
    }

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
            searchLabel="Buscar por nombre, código o categoría"
            query={query}
            onQueryChange={setQuery}
          />
          <Button variant="ghost" icon={<RefreshIcon size={18} />} onClick={reload}>
            Actualizar listado
          </Button>
        </div>
        <p className="admin-count text-muted" role="status">
          {query
            ? `${productosFiltrados.length} de ${productos.length} productos coinciden con la búsqueda`
            : `${productos.length} ${productos.length === 1 ? "producto registrado" : "productos registrados"}`}
        </p>

        {productosFiltrados.length === 0 ? (
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
          <ProductTable productos={productosFiltrados} onDelete={setProductoAEliminar} caption="Productos registrados" />
        )}
      </>
    );
  }

  return (
    <div className="section">
      <title>Administración de productos | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          eyebrow="Administración"
          title="Gestión de productos"
          description="Alta, edición y baja de las prendas, accesorios y skates del local."
          headingRef={headingRef}
          actions={
            <Button to="/admin/productos/nuevo" icon={<PlusIcon size={18} />}>
              Nuevo producto
            </Button>
          }
        />
        {renderContenido()}
      </div>

      <ConfirmDialog
        open={productoAEliminar !== null}
        title="¿Eliminar producto?"
        confirmLabel="Sí, eliminar"
        processingLabel="Eliminando…"
        onConfirm={confirmarEliminacion}
        onCancel={() => setProductoAEliminar(null)}
        isProcessing={isDeleting}
        fallbackFocusRef={headingRef}
      >
        {productoAEliminar && (
          <>
            <p>
              Vas a eliminar <strong>{productoAEliminar.nombre}</strong> (código #{productoAEliminar.codigo}).
            </p>
            <p>Esta acción no se puede deshacer.</p>
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
