import Button from "../components/ui/Button.jsx";
import PhotoPlaceholder from "../components/ui/PhotoPlaceholder.jsx";
import { StarIcon } from "../components/ui/Icons.jsx";
import { NEGOCIO, whatsappUrl } from "../utils/negocio.js";
import "./HomePage.css";

// Contenido de la sección "Productos estrella" tal como figura en el mockup.
const DESTACADOS = [
  { titulo: "Algodón", texto: "Remeras y buzos — “excelente calidad”" },
  { titulo: "Jeans & Chinos", texto: "Variedad de talles, para salir" },
  { titulo: "Accesorios", texto: "Gorras, cintos, billeteras — ideal regalo" },
  { titulo: "Asesoramiento", texto: "“Te asesoran en todo” — trato cercano" },
];

/** Landing page: navbar, hero, sobre nosotros, productos estrella y footer (wireframe original). */
export default function HomePage() {
  return (
    <>
      <title>OCN Villa Urquiza | Ropa urbana con sello propio</title>

      <section className="hero" aria-labelledby="hero-titulo">
        <div className="container hero__inner">
          <div className="hero__text">
            <h1 id="hero-titulo">
              Ropa urbana
              <br /> con sello propio
            </h1>
            <p className="hero__lead">
              Remeras, buzos y jeans de fabricación propia, más accesorios y skates. Atención personalizada y envíos a
              domicilio.
            </p>
            <div className="hero__actions">
              <Button to="/productos">Ver catálogo</Button>
              <Button variant="outline" href={whatsappUrl("Hola! Quería hacer una consulta.")}>
                Escribinos por WhatsApp
              </Button>
            </div>
          </div>
          <PhotoPlaceholder label="FOTO: fachada / look urbano" className="hero__photo" />
        </div>
      </section>

      <section id="sobre-nosotros" className="section section--white about" aria-labelledby="about-titulo">
        <div className="container about__inner">
          <PhotoPlaceholder label="FOTO: interior del local" className="about__photo" />
          <div className="about__text">
            <h2 id="about-titulo">Sobre nosotros</h2>
            <p className="text-muted">
              Somos la tienda oficial de OCN en Villa Urquiza. Fabricamos nuestra propia ropa en algodón, gabardina y
              lycra para toda la familia, con buena relación calidad-precio y el asesoramiento cercano de siempre.
            </p>
            <p className="about__rating">
              <StarIcon size={16} />
              <span>{NEGOCIO.rating}</span>
            </p>
          </div>
        </div>
      </section>

      <section className="section featured" aria-labelledby="featured-titulo">
        <div className="container">
          <h2 id="featured-titulo">Productos estrella</h2>
          <ul className="featured__grid">
            {DESTACADOS.map(({ titulo, texto }) => (
              <li key={titulo} className="featured__card">
                <PhotoPlaceholder className="featured__photo" />
                <div className="featured__body">
                  <h3>{titulo}</h3>
                  <p>{texto}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="featured__cta">
            <Button variant="outline" to="/productos">
              Ver todos los productos
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
