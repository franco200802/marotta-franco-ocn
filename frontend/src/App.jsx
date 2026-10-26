import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ToastProvider from "./context/ToastProvider.jsx";
import AuthProvider from "./context/AuthProvider.jsx";
import CartProvider from "./context/CartProvider.jsx";
import ConfirmProvider from "./context/ConfirmProvider.jsx";
import MainLayout from "./components/layout/MainLayout.jsx";
import RequireAuth from "./components/layout/RequireAuth.jsx";
import { Loading } from "./components/ui/Feedback.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import PedidoPage from "./pages/PedidoPage.jsx";
import MisPedidosPage from "./pages/MisPedidosPage.jsx";
import MiCuentaPage from "./pages/MiCuentaPage.jsx";
import IngresarPage from "./pages/IngresarPage.jsx";
import RegistrarsePage from "./pages/RegistrarsePage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

// El panel del administrador se carga aparte: los clientes no descargan ese código.
const AdminLayout = lazy(() => import("./components/layout/AdminLayout.jsx"));
const AdminProductsPage = lazy(() => import("./pages/admin/AdminProductsPage.jsx"));
const ProductCreatePage = lazy(() => import("./pages/admin/ProductCreatePage.jsx"));
const ProductEditPage = lazy(() => import("./pages/admin/ProductEditPage.jsx"));
const AdminPedidosPage = lazy(() => import("./pages/admin/AdminPedidosPage.jsx"));
const AdminClientesPage = lazy(() => import("./pages/admin/AdminClientesPage.jsx"));
const AdminReportesPage = lazy(() => import("./pages/admin/AdminReportesPage.jsx"));
const AdminEnviosPage = lazy(() => import("./pages/admin/AdminEnviosPage.jsx"));

const cargandoPanel = (
  <div className="container section">
    <Loading message="Cargando el panel…" />
  </div>
);

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <ConfirmProvider>
            {/* Sin transiciones: los filtros del catálogo viven en la URL y deben actualizarse
                en forma sincrónica para no perder caracteres al escribir rápido. */}
            <BrowserRouter useTransitions={false}>
              <Suspense fallback={cargandoPanel}>
                <Routes>
                  <Route element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="productos" element={<CatalogPage />} />
                    <Route path="productos/:codigo" element={<ProductDetailPage />} />
                    <Route path="carrito" element={<CartPage />} />
                    <Route path="ingresar" element={<IngresarPage />} />
                    <Route path="registrarse" element={<RegistrarsePage />} />
                    <Route
                      path="checkout"
                      element={
                        <RequireAuth rol="cliente">
                          <CheckoutPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="pedidos/:id"
                      element={
                        <RequireAuth>
                          <PedidoPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="mis-pedidos"
                      element={
                        <RequireAuth rol="cliente">
                          <MisPedidosPage />
                        </RequireAuth>
                      }
                    />
                    <Route
                      path="mi-cuenta"
                      element={
                        <RequireAuth rol="cliente">
                          <MiCuentaPage />
                        </RequireAuth>
                      }
                    />
                    <Route path="admin" element={<AdminLayout />}>
                      <Route index element={<Navigate to="productos" replace />} />
                      <Route path="productos" element={<AdminProductsPage />} />
                      <Route path="productos/nuevo" element={<ProductCreatePage />} />
                      <Route path="productos/:codigo/editar" element={<ProductEditPage />} />
                      <Route path="pedidos" element={<AdminPedidosPage />} />
                      <Route path="clientes" element={<AdminClientesPage />} />
                      <Route path="reportes" element={<AdminReportesPage />} />
                      <Route path="envios" element={<AdminEnviosPage />} />
                    </Route>
                    <Route path="*" element={<NotFoundPage />} />
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ConfirmProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
