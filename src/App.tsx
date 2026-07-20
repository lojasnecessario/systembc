import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';

// Storefront Pages
import { StoreLayout } from './layouts/StoreLayout';
import { Home } from './pages/storefront/Home';
import { CategoryPage } from './pages/storefront/CategoryPage';
import { ProductPage } from './pages/storefront/ProductPage';

// Admin Pages
import { Login } from './pages/admin/Login';
import { Dashboard } from './pages/admin/Dashboard';
import { Logs } from './pages/admin/Logs';
import { Products } from './pages/admin/Products';
import { Categories } from './pages/admin/Categories';
import { Brands } from './pages/admin/Brands';
import { ProductGrids } from './pages/admin/ProductGrids';
import { Banners } from './pages/admin/Banners';
import { Settings } from './pages/admin/Settings';
import { Customers } from './pages/admin/Customers';
import { Orders } from './pages/admin/Orders';
import { ProtectedRoute } from './components/ProtectedRoute';

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Loja Virtual */}
        <Route path="/" element={<StoreLayout />}>
          <Route index element={<Home />} />
          <Route path="categoria/:slug" element={<CategoryPage />} />
          <Route path="produto/:slug" element={<ProductPage />} />
        </Route>

        {/* Admin Login */}
        <Route path="/admin/login" element={<Login />} />

        {/* Admin Rotas Protegidas */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            {/* Outras rotas do painel serão adicionadas aqui */}
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<Products />} />
            <Route path="categories" element={<Categories />} />
            <Route path="brands" element={<Brands />} />
            <Route path="grids" element={<ProductGrids />} />
            <Route path="banners" element={<Banners />} />
            <Route path="customers" element={<Customers />} />
            <Route path="logs" element={<Logs />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
