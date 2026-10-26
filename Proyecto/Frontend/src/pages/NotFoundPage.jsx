import Button from "../components/ui/Button.jsx";
import "./NotFoundPage.css";

export default function NotFoundPage() {
  return (
    <section className="section not-found" aria-labelledby="not-found-titulo">
      <title>Página no encontrada | OCN Villa Urquiza</title>
      <div className="container not-found__inner">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-titulo">Página no encontrada</h1>
        <p className="text-muted">La dirección que ingresaste no existe o cambió de lugar.</p>
        <div className="not-found__actions">
          <Button to="/">Ir al inicio</Button>
          <Button variant="outline" to="/productos">
            Ver catálogo
          </Button>
        </div>
      </div>
    </section>
  );
}
