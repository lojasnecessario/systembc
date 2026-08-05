import { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';

import { ScrollToTop } from './components/ScrollToTop';
import { AdminLayout } from './layouts/AdminLayout';
import { StoreLayout } from './layouts/StoreLayout';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/storefront/Home';
// Storefront Pages (Lazy)
const Checkout = lazy(() => import('./pages/storefront/Checkout').then(m => ({ default: m.Checkout })));
const CategoryPage = lazy(() => import('./pages/storefront/CategoryPage').then(m => ({ default: m.CategoryPage })));
const ProductPage = lazy(() => import('./pages/storefront/ProductPage').then(m => ({ default: m.ProductPage })));
const GoogleReviews = lazy(() => import('./pages/storefront/GoogleReviews').then(m => ({ default: m.GoogleReviews })));
const Testimonials = lazy(() => import('./pages/storefront/Testimonials').then(m => ({ default: m.Testimonials })));
const LegalPage = lazy(() => import('./pages/storefront/LegalPage').then(m => ({ default: m.LegalPage })));
const AllCategories = lazy(() => import('./pages/storefront/AllCategories').then(m => ({ default: m.AllCategories })));
const AllProductsPage = lazy(() => import('./pages/storefront/AllProductsPage').then(m => ({ default: m.AllProductsPage })));
const AboutUs = lazy(() => import('./pages/storefront/AboutUs').then(m => ({ default: m.AboutUs })));
const FaqPage = lazy(() => import('./pages/storefront/FaqPage').then(m => ({ default: m.FaqPage })));
const ContactPage = lazy(() => import('./pages/storefront/ContactPage').then(m => ({ default: m.ContactPage })));

// Admin Pages (Lazy)
const Login = lazy(() => import('./pages/admin/Login').then(m => ({ default: m.Login })));
const Dashboard = lazy(() => import('./pages/admin/Dashboard').then(m => ({ default: m.Dashboard })));
const Logs = lazy(() => import('./pages/admin/Logs').then(m => ({ default: m.Logs })));
const Products = lazy(() => import('./pages/admin/Products').then(m => ({ default: m.Products })));
const Categories = lazy(() => import('./pages/admin/Categories').then(m => ({ default: m.Categories })));
const Brands = lazy(() => import('./pages/admin/Brands').then(m => ({ default: m.Brands })));
const ProductGrids = lazy(() => import('./pages/admin/ProductGrids').then(m => ({ default: m.ProductGrids })));
const Banners = lazy(() => import('./pages/admin/Banners').then(m => ({ default: m.Banners })));
const HighlightsAdmin = lazy(() => import('./pages/admin/HighlightsAdmin').then(m => ({ default: m.HighlightsAdmin })));
const Settings = lazy(() => import('./pages/admin/Settings').then(m => ({ default: m.Settings })));
const CheckoutSettings = lazy(() => import('./pages/admin/CheckoutSettings').then(m => ({ default: m.CheckoutSettings })));
const Customers = lazy(() => import('./pages/admin/Customers').then(m => ({ default: m.Customers })));
const Orders = lazy(() => import('./pages/admin/Orders').then(m => ({ default: m.Orders })));
const Reviews = lazy(() => import('./pages/admin/Reviews').then(m => ({ default: m.Reviews })));

const SuspenseFallback = () => (
  <div className="min-h-screen bg-[#0a0d0a] flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-[#33e36a] border-t-transparent rounded-full animate-spin"></div>
  </div>
);

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          {/* Loja Virtual */}
          <Route path="/" element={<StoreLayout />}>
            <Route index element={<Home />} />
            <Route path="categorias" element={<AllCategories />} />
            <Route path="produtos" element={<AllProductsPage />} />
            <Route path="categoria/:slug" element={<CategoryPage />} />
            <Route path="produto/:slug" element={<ProductPage />} />
            <Route path="sobre-nos" element={<AboutUs />} />
            <Route path="depoimentos" element={<Testimonials />} />
            <Route path="legal/:slug" element={<LegalPage />} />
            <Route path="faq" element={<FaqPage />} />
            <Route path="contato" element={<ContactPage />} />
          </Route>

          {/* Checkout sem Header/Footer */}
          <Route path="/checkout/:slug" element={<Checkout />} />

          <Route path="/google" element={<GoogleReviews />} />

          {/* Admin Login */}
          <Route path="/bc0035862-10/login" element={<Login />} />

          {/* Admin Rotas Protegidas */}
          <Route path="/bc0035862-10" element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="orders" element={<Orders />} />
              <Route path="products" element={<Products />} />
              <Route path="categories" element={<Categories />} />
              <Route path="brands" element={<Brands />} />
              <Route path="grids" element={<ProductGrids />} />
              <Route path="banners" element={<Banners />} />
              <Route path="destaques" element={<HighlightsAdmin />} />
              <Route path="customers" element={<Customers />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="logs" element={<Logs />} />
              <Route path="settings" element={<Settings />} />
              <Route path="checkout-settings" element={<CheckoutSettings />} />
            </Route>
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
