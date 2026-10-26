import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import PageHeader from "../components/ui/PageHeader.jsx";
import Button from "../components/ui/Button.jsx";
import { EmptyState, ErrorMessage, Loading } from "../components/ui/Feedback.jsx";
import PrendaCard from "../components/productos/PrendaCard.jsx";
import ProductFilters from "../components/productos/ProductFilters.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { agruparPrendas, compararTalles } from "../utils/prendas.js";
import { normalizeText } from "../utils/text.js";
import "./CatalogPage.css";

const ORDENES = [
  { value: "", label: "Destacados" },
  { value: "precio-asc", label: "Menor precio" },
  { value: "precio-desc", label: "Mayor precio" },
  { value: "nombre", label: "Nombre (A-Z)" },
];

const unicos = (valores, comparar) => [...new Set(valores.filter(Boolean))].sort(comparar);
const aOpciones = (valores) => valores.map((valor) => ({ value: valor, label: valor }));

function ordenar(prendas, orden) {
  const copia = [...prendas];
  if (orden === "precio-asc") return copia.sort((a, b) => a.precioMin - b.precioMin);
  if (orden === "precio-desc") return copia.sort((a, b) => b.precioMin - a.precioMin);
  if (orden === "nombre") return copia.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
  // Destacados: primero lo que tiene stock.
  return copia.sort((a, b) => Number(b.stockTotal > 0) - Number(a.stockTotal > 0));
}

/** Catálogo público: prendas agrupadas, con búsqueda y filtros guardados en la URL. */
export default function CatalogPage() {
  const { productos, isLoading, error, reload } = useProductos();
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") ?? "";
  const categoria = searchParams.get("categoria") ?? "";
  const talle = searchParams.get("talle") ?? "";
  const color = searchParams.get("color") ?? "";
  const orden = searchParams.get("orden") ?? "";

  const prendas = useMemo(() => agruparPrendas(productos), [productos]);
  const categorias = useMemo(
    () =>
      unicos(
        prendas.map((p) => p.categoria),
        (a, b) => a.localeCompare(b, "es"),
      ),
    [prendas],
  );
  const talles = useMemo(
    () =>
      unicos(
        productos.map((p) => p.talle),
        compararTalles,
      ),
    [productos],
  );
  const colores = useMemo(
    () =>
      unicos(
        productos.map((p) => p.color),
        (a, b) => a.localeCompare(b, "es"),
      ),
    [productos],
  );

  const visibles = useMemo(() => {
    const texto = normalizeText(query);
    const filtradas = prendas.filter((prenda) => {
      const coincideTexto =
        !texto ||
        [prenda.nombre, prenda.categoria, prenda.descripcion, ...prenda.colores].some((campo) =>
          normalizeText(campo).includes(texto),
        );
      return (
        coincideTexto &&
        (!categoria || normalizeText(prenda.categoria) === normalizeText(categoria)) &&
        (!talle || prenda.talles.includes(talle)) &&
        (!color || prenda.colores.includes(color))
      );
    });
    return ordenar(filtradas, orden);
  }, [prendas, query, categoria, talle, color, orden]);

  function actualizar(nombre, valor) {
    setSearchParams(
      (actuales) => {
        const siguientes = new URLSearchParams(actuales);
        if (valor) siguientes.set(nombre, valor);
        else siguientes.delete(nombre);
        return siguientes;
      },
      { replace: true },
    );
  }

  const hayFiltros = Boolean(query || categoria || talle || color);

  function renderContenido() {
    if (isLoading) return <Loading message="Cargando productos…" />;
    if (error) return <ErrorMessage title="No pudimos cargar el catálogo" message={error.message} onRetry={reload} />;
    if (prendas.length === 0) {
      return (
        <EmptyState
          title="Todavía no hay productos"
          message="El catálogo se está armando. Mientras tanto, escribinos por WhatsApp o pasá por el local."
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
          onQueryChange={(valor) => actualizar("q", valor)}
          filtros={[
            {
              id: "categoria",
              label: "Categoría",
              value: categoria,
              onChange: (v) => actualizar("categoria", v),
              opciones: aOpciones(categorias),
              todas: "Todas",
            },
            {
              id: "talle",
              label: "Talle",
              value: talle,
              onChange: (v) => actualizar("talle", v),
              opciones: aOpciones(talles),
              todas: "Todos",
            },
            {
              id: "color",
              label: "Color",
              value: color,
              onChange: (v) => actualizar("color", v),
              opciones: aOpciones(colores),
              todas: "Todos",
            },
            {
              id: "orden",
              label: "Ordenar por",
              value: orden,
              onChange: (v) => actualizar("orden", v),
              opciones: ORDENES,
            },
          ]}
        />
        <p className="catalog__count" role="status">
          {hayFiltros
            ? `${visibles.length} de ${prendas.length} prendas coinciden`
            : `${prendas.length} ${prendas.length === 1 ? "prenda" : "prendas"}`}
        </p>

        {visibles.length === 0 ? (
          <EmptyState
            title="Sin resultados"
            message="No encontramos prendas con esa búsqueda o esos filtros."
            action={
              <Button variant="outline" onClick={() => setSearchParams({}, { replace: true })}>
                Limpiar filtros
              </Button>
            }
          />
        ) : (
          <ul className="catalog__grid">
            {visibles.map((prenda) => (
              <li key={prenda.clave}>
                <PrendaCard prenda={prenda} />
              </li>
            ))}
          </ul>
        )}
      </>
    );
  }

  return (
    <div className="section section--stone">
      <title>Productos | OCN Villa Urquiza</title>
      <div className="container">
        <PageHeader
          title="Productos"
          description="Ropa de fabricación propia, accesorios y skates. Precios y stock al día. Por ahora el catálogo es de ejemplo: el local está cargando el real."
        />
        {renderContenido()}
      </div>
    </div>
  );
}
