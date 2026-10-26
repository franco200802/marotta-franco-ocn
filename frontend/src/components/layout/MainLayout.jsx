import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SiteHeader from "./SiteHeader.jsx";
import SiteFooter from "./SiteFooter.jsx";
import CartDrawer from "../carrito/CartDrawer.jsx";

/** Desplaza a la sección indicada en el hash (#sobre-nosotros) o al inicio al cambiar de pantalla. */
function useScrollOnNavigation() {
  const { pathname, hash, key } = useLocation();
  // Con hash, cada navegación (aunque repita la URL) vuelve a desplazar a la sección.
  // Sin hash, solo se reacciona al cambio de pantalla (no a los filtros de la URL).
  const hashNavigationKey = hash ? key : null;

  useEffect(() => {
    if (hash) {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash, hashNavigationKey]);
}

export default function MainLayout() {
  useScrollOnNavigation();

  return (
    <>
      <a href="#contenido" className="skip-link">
        Saltar al contenido
      </a>
      <SiteHeader />
      <main id="contenido" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
