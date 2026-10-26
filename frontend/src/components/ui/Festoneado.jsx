/** Borde festoneado entre dos secciones: `de` cae como ondas sobre `a`. Decorativo. */
export default function Festoneado({ de, a, invertido = false }) {
  return (
    <div
      className={`festoneado ${invertido ? "festoneado--invertido" : ""}`.trim()}
      style={{ "--festoneado-de": de, "--festoneado-a": a }}
      aria-hidden="true"
    />
  );
}
