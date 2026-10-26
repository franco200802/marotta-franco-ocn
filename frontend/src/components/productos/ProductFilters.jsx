import { SearchIcon } from "../ui/Icons.jsx";
import "./ProductFilters.css";

/**
 * Búsqueda por texto y filtro por categoría.
 * El filtrado se realiza en el navegador sobre los productos ya obtenidos de la API.
 */
export default function ProductFilters({
  idPrefix,
  query,
  onQueryChange,
  searchLabel = "Buscar",
  searchPlaceholder,
  categorias,
  categoria,
  onCategoriaChange,
}) {
  return (
    <form className="product-filters" role="search" onSubmit={(event) => event.preventDefault()}>
      <div className="product-filters__field product-filters__field--search">
        <label htmlFor={`${idPrefix}-buscar`}>{searchLabel}</label>
        <div className="product-filters__search">
          <SearchIcon size={18} className="product-filters__search-icon" />
          <input
            id={`${idPrefix}-buscar`}
            type="search"
            className="form-control"
            value={query}
            placeholder={searchPlaceholder}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
      </div>

      {categorias && (
        <div className="product-filters__field">
          <label htmlFor={`${idPrefix}-categoria`}>Categoría</label>
          <select
            id={`${idPrefix}-categoria`}
            className="form-control"
            value={categoria}
            onChange={(event) => onCategoriaChange(event.target.value)}
          >
            <option value="">Todas las categorías</option>
            {categorias.map((nombre) => (
              <option key={nombre} value={nombre}>
                {nombre}
              </option>
            ))}
          </select>
        </div>
      )}
    </form>
  );
}
