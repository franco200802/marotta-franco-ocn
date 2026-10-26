import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import ProductCard from "../components/productos/ProductCard.jsx";
import ProductFilters from "../components/productos/ProductFilters.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { normalizeText } from "../utils/text.js";
import "./CatalogPage.css";

function obtenerCategorias(productos) {
  const porClave = new Map();
  productos.forEach(({ categoria }) => {
    if (typeof categoria === "string" && categoria.trim()) {
      const clave = normalizeText(categoria);
      if (!porClave.has(clave)) porClave.set(clave, categoria.trim());
    }
  });
  return [...porClave.values()].sort((a, b) => a.localeCompare(b, "es"));
}

/** Catálogo público con búsqueda y filtro por categoría (los filtros quedan en la URL). */
export default function CatalogPage() {
  const { productos, isLoading, error, reload } = useProductos();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const categoria = searchParams.get("categoria") ?? "";

  const categorias = useMemo(() => obtenerCategorias(productos), [productos]);

  const productosFiltrados = useMemo(() => {
    const texto = normalizeText(query);
    const categoriaBuscada = normalizeText(categoria);
    return productos.filter((producto) => {
      const coincideCategoria = !categoriaBuscada || normalizeText(producto.categoria) === categoriaBuscada;
      const coincideTexto =
        !texto ||
        [producto.nombre, producto.descripcion, producto.color, producto.categoria].some((campo) =>
          normalizeText(campo).includes(texto),
        );
      return coincideCategoria && coincideTexto;
    });
  }, [productos, query, categoria]);

  function updateParam(nombre, valor) {
    const next = new URLSearchParams(searchParams);
    if (valor) next.set(nombre, valor);
    else next.delete(nombre);
    setSearchParams(next, { replace: true });
  }

  const hayFiltros = Boolean(query || categoria);

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando productos…" />;

    if (error) {
      return <ErrorMessage title="No pudimos cargar el catálogo" message={error.message} onRetry={reload} />;
    }

    if (productos.length === 0) {
      return (
        <EmptyState
          title="Todavía no hay productos"
          message="El catálogo se está armando. Mientras tanto, podés consultarnos por WhatsApp o visitarnos en el local."
        />
      );
    }

    return (
      <>
        <ProductFilters
          idPrefix="catalogo"
          searchLabel="Buscar prendas"
          searchPlaceholder="Remera, jean, negro…"
          query={query}
          onQueryChange={(valor) => updateParam("q", valor)}
          categorias={categorias}
          categoria={categoria}
          onCategoriaChange={(valor) => updateParam("categoria", valor)}
        />
        <p className="catalog__count text-muted" role="status">
          {hayFiltros
            ? `Mostrando ${productosFiltrados.length} de ${productos.length} productos`
            : `${productos.length} ${productos.length === 1 ? "producto" : "productos"}`}
        </p>

        {productosFiltrados.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            message="No encontramos productos que coincidan con la búsqueda o la categoría elegida."
            action={
              <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <ul className="catalog__grid">
            {productosFiltrados.map((producto) => (
              <li key={producto.codigo}>
                <ProductCard producto={producto} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className="section">
      <title>Productos | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          eyebrow="Catálogo"
          title="Productos"
          description="Ropa de fabricación propia, accesorios y skates. Precios y stock actualizados desde el sistema del local."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
