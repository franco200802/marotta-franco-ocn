import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Button from "../components/ui/Button.jsx";
import Festoneado from "../components/ui/Festoneado.jsx";
import LetrasOcn from "../components/ui/LetrasOcn.jsx";
import PhotoPlaceholder from "../components/ui/PhotoPlaceholder.jsx";
import { ClockIcon, CloseIcon, MapPinIcon, StarIcon } from "../components/ui/Icons.jsx";
import EtiquetaProducto from "../components/productos/EtiquetaProducto.jsx";
import { useProductos } from "../hooks/useProductos.js";
import { agruparPrendas, tinteDeColor } from "../utils/prendas.js";
import { NEGOCIO, whatsappUrl } from "../utils/negocio.js";
import "./HomePage.css";

// Contenido de "Productos estrella" tal como figura en el boceto y en la Ficha Técnica.
const DESTACADOS = [
  {
    titulo: "Algodón",
    texto: "Remeras y buzos. Los clientes dicen “excelente calidad”.",
    to: "/productos?categoria=Remeras",
    forma: "rect",
  },
  {
    titulo: "Jeans y chinos",
    texto: "Variedad de talles, para salir.",
    to: "/productos?categoria=Jeans",
    forma: "circulo",
  },
  {
    titulo: "Accesorios",
    texto: "Gorras, cintos y billeteras: el regalo resuelto.",
    to: "/productos?categoria=Gorras",
    forma: "etiqueta",
  },
  {
    titulo: "Asesoramiento",
    texto: "“Te asesoran en todo.” Trato de barrio.",
    href: whatsappUrl("Hola! Quería que me asesoren."),
    forma: "escudo",
  },
];

const PASOS = [
  { titulo: "Elegí", texto: "La prenda, el color y el talle. Ves el stock real antes de decidir." },
  { titulo: "Sumá al carrito", texto: "Si un precio cambia mientras tanto, te avisamos antes de confirmar." },
  { titulo: "Retiro o envío", texto: "Pasás por Bauness y Monroe o te lo mandamos a tu zona." },
  { titulo: "Seguilo", texto: "Ves cada paso: confirmado, en preparación, enviado y finalizado." },
];

const FRASES = ["Marca propia", "Villa Urquiza", "Remeras", "Buzos", "Jeans y chinos", "Gorras", "Skates"];

/** El producto de la etiqueta del hero: una prenda real del catálogo con stock. */
function elegirDestacado(productos) {
  const prendas = agruparPrendas(productos).filter((prenda) => prenda.stockTotal > 0);
  return prendas.find((prenda) => prenda.categoria === "Buzos") ?? prendas[0] ?? null;
}

function Cinta() {
  const grupo = (oculto) => (
    <ul className="cinta__grupo" aria-hidden={oculto || undefined}>
      {FRASES.map((frase) => (
        <li key={frase}>
          {frase}
          <CloseIcon size={22} />
        </li>
      ))}
    </ul>
  );
  return (
    <div className="cinta">
      <div className="cinta__pista">
        {grupo(false)}
        {grupo(true)}
      </div>
    </div>
  );
}

/** Landing: navbar, hero, sobre nosotros, productos estrella y footer del boceto, más cómo comprar y dónde estamos. */
export default function HomePage() {
  const { productos, isLoading, error } = useProductos();
  const destacado = useMemo(() => elegirDestacado(productos), [productos]);
  const [tinte, setTinte] = useState(null);

  return (
    <>
      <title>OCN Villa Urquiza | Ropa urbana con sello propio</title>

      <section className="hero section--stone" aria-labelledby="hero-titulo">
        <div className="container hero__inner">
          <div className="hero__texto">
            <h1 id="hero-titulo">
              Ropa urbana
              <br /> con sello propio
            </h1>
            <p className="hero__bajada">
              Remeras, buzos y jeans de fabricación propia, más accesorios y skates. Atención personalizada y envíos a
              domicilio.
            </p>
            <div className="hero__acciones">
              <Button to="/productos" size="lg">
                Ver catálogo
              </Button>
              <Button variant="outline" size="lg" href={whatsappUrl("Hola! Quería hacer una consulta.")}>
                Escribinos por WhatsApp
              </Button>
            </div>
            <p className="hero__rating">
              <StarIcon size={18} />
              {NEGOCIO.rating}
            </p>
          </div>

          <div className="hero__escena">
            <div className="hero__parche parche parche--oscuro">
              <LetrasOcn
                className="hero__letras"
                tinte={tinte ?? "#FF5A1F"}
                titulo="Letras OCN infladas, el sello de la marca"
              />
            </div>
            <div className="hero__etiqueta">
              {destacado ? (
                <EtiquetaProducto
                  key={destacado.clave}
                  prenda={destacado}
                  onColorChange={(color) => setTinte(tinteDeColor(color))}
                />
              ) : (
                !isLoading && (
                  <p className="hero__sin-producto">
                    {error ? "No pudimos cargar un producto ahora. " : ""}
                    <Link to="/productos">Mirá el catálogo completo</Link>.
                  </p>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      <Festoneado de="var(--color-stone)" a="var(--color-white)" />

      <section id="sobre-nosotros" className="section section--white" aria-labelledby="nosotros-titulo">
        <div className="container nosotros">
          <PhotoPlaceholder label="Foto del local (falta la real)" className="nosotros__foto parche" />
          <div className="nosotros__texto">
            <h2 id="nosotros-titulo">Sobre nosotros</h2>
            <p>
              Somos la tienda oficial de OCN en Villa Urquiza. Fabricamos nuestra propia ropa en algodón, gabardina y
              lycra para toda la familia, con buena relación calidad-precio y el asesoramiento cercano de siempre.
            </p>
            <ul className="nosotros__datos">
              <li>
                <MapPinIcon size={18} /> Bauness 2395, esquina Monroe
              </li>
              <li>
                <ClockIcon size={18} /> {NEGOCIO.horario}
              </li>
            </ul>
          </div>
        </div>
      </section>

      <Cinta />

      <section className="section section--stone" aria-labelledby="estrella-titulo">
        <div className="container">
          <h2 id="estrella-titulo" className="titulo-seccion">
            Productos estrella
          </h2>
          <ul className="estrella">
            {DESTACADOS.map(({ titulo, texto, to, href, forma }) => (
              <li key={titulo} className={`estrella__parche estrella__parche--${forma}`}>
                <h3>
                  {to ? (
                    <Link to={to}>{titulo}</Link>
                  ) : (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {titulo}
                      <span className="visually-hidden"> (WhatsApp, se abre en una pestaña nueva)</span>
                    </a>
                  )}
                </h3>
                <p>{texto}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="como-comprar" className="section section--charcoal" aria-labelledby="comprar-titulo">
        <div className="container">
          <h2 id="comprar-titulo" className="titulo-seccion">
            Cómo comprar
          </h2>
          <ol className="pasos">
            {PASOS.map(({ titulo, texto }, indice) => (
              <li key={titulo} className="pasos__paso">
                <span className="pasos__numero" aria-hidden="true">
                  {indice + 1}
                </span>
                <h3>{titulo}</h3>
                <p>{texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="donde-estamos" className="section section--white" aria-labelledby="donde-titulo">
        <div className="container donde">
          <div className="donde__texto">
            <h2 id="donde-titulo" className="titulo-seccion">
              Dónde estamos
            </h2>
            <p>
              En una esquina tranquila de Villa Urquiza, fuera de la avenida. Si venís a retirar, te esperamos con tu
              pedido listo.
            </p>
            <ul className="nosotros__datos">
              <li>
                <MapPinIcon size={18} /> {NEGOCIO.direccion}
              </li>
              <li>
                <ClockIcon size={18} /> {NEGOCIO.horario}
              </li>
            </ul>
            <Button variant="outline" href={NEGOCIO.mapaUrl}>
              Cómo llegar
            </Button>
          </div>
          <iframe
            className="donde__mapa parche"
            title="Mapa: OCN Villa Urquiza en Bauness 2395"
            src={NEGOCIO.mapaEmbed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </section>

      <section className="cierre section--stone" aria-labelledby="cierre-titulo">
        <div className="container cierre__inner">
          <h2 id="cierre-titulo">¿Qué te ponés hoy?</h2>
          <Button to="/productos" size="lg">
            Elegir mi próxima prenda
          </Button>
        </div>
      </section>
    </>
  );
}
