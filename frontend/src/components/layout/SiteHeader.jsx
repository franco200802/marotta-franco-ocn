import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { BagIcon, CloseIcon, MenuIcon, UserIcon } from "../ui/Icons.jsx";
import { useCart } from "../../hooks/useCart.js";
import { useAuth } from "../../hooks/useAuth.js";
import "./SiteHeader.css";

const navLinkClass = ({ isActive }) => `site-nav__link${isActive ? " site-nav__link--active" : ""}`;

/** Navbar del boceto: logo OCN a la izquierda y enlaces a la derecha sobre fondo charcoal. */
export default function SiteHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cantidadTotal, abrirCajon } = useCart();
  const { usuario, esAdmin } = useAuth();

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsMenuOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen]);

  const closeMenu = () => setIsMenuOpen(false);

  const cuenta = esAdmin
    ? { to: "/admin", label: "Panel" }
    : usuario
      ? { to: "/mi-cuenta", label: usuario.nombre }
      : { to: "/ingresar", label: "Ingresar" };

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Link to="/" className="site-header__logo" onClick={closeMenu}>
          OCN<span className="visually-hidden"> Villa Urquiza, inicio</span>
        </Link>

        <nav aria-label="Principal" className={`site-nav${isMenuOpen ? " site-nav--open" : ""}`}>
          <ul id="menu-principal" className="site-nav__list" onClick={closeMenu}>
            <li>
              <NavLink to="/" end className={navLinkClass}>
                Inicio
              </NavLink>
            </li>
            <li>
              <NavLink to="/productos" className={navLinkClass}>
                Productos
              </NavLink>
            </li>
            <li>
              <Link to="/#sobre-nosotros" className="site-nav__link">
                Sobre nosotros
              </Link>
            </li>
            <li>
              <a href="#contacto" className="site-nav__link">
                Contacto
              </a>
            </li>
          </ul>
        </nav>

        <div className="site-header__acciones">
          <NavLink to={cuenta.to} className={({ isActive }) => `site-header__cuenta${isActive ? " is-active" : ""}`}>
            <UserIcon size={20} />
            <span className="site-header__cuenta-texto">{cuenta.label}</span>
          </NavLink>
          <button type="button" className="site-header__carrito" onClick={abrirCajon}>
            <BagIcon size={20} />
            <span className="visually-hidden">Abrir carrito,</span>
            <span className="site-header__contador" aria-live="polite">
              {cantidadTotal}
              <span className="visually-hidden">{cantidadTotal === 1 ? " prenda" : " prendas"}</span>
            </span>
          </button>
          <button
            type="button"
            className="site-header__toggle"
            aria-expanded={isMenuOpen}
            aria-controls="menu-principal"
            onClick={() => setIsMenuOpen((open) => !open)}
          >
            {isMenuOpen ? <CloseIcon size={24} /> : <MenuIcon size={24} />}
            <span className="visually-hidden">{isMenuOpen ? "Cerrar menú" : "Abrir menú"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
