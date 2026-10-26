import { BrowserRouter, Route, Routes } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout.jsx";
import ToastProvider from "./context/ToastProvider.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductDetailPage from "./pages/ProductDetailPage.jsx";
import AdminProductsPage from "./pages/AdminProductsPage.jsx";
import ProductCreatePage from "./pages/ProductCreatePage.jsx";
import ProductEditPage from "./pages/ProductEditPage.jsx";
import NotFoundPage from "./pages/NotFoundPage.jsx";

export default function App() {
  return (
    <ToastProvider>
      {/* Sin transiciones: la búsqueda del catálogo vive en la URL y debe actualizarse
          en forma sincrónica para no perder caracteres al escribir rápido. */}
      <BrowserRouter useTransitions={false}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route index element={<HomePage />} />
            <Route path="productos" element={<CatalogPage />} />
            <Route path="productos/:codigo" element={<ProductDetailPage />} />
            <Route path="admin/productos" element={<AdminProductsPage />} />
            <Route path="admin/productos/nuevo" element={<ProductCreatePage />} />
            <Route path="admin/productos/:codigo/editar" element={<ProductEditPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}
