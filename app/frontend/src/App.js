import "./App.css";
import "./design-system.css";
import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RouteMetadata from "./components/RouteMetadata";
import { Toaster } from "./components/ui/sonner";
import { Toaster as CartToaster } from "./components/ui/toaster";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";


const Home = lazy(() => import("./pages/Home"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Catalog = lazy(() => import("./pages/Catalog"));
const CategoryView = lazy(() => import("./pages/CategoryView"));
const SubcategoryView = lazy(() => import("./pages/SubcategoryView"));
const ThirdLevelView = lazy(() => import("./pages/ThirdLevelView"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const BrandPage = lazy(() => import("./pages/BrandPage"));
const Cart = lazy(() => import("./pages/Cart"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminSlides = lazy(() => import("./pages/admin/AdminSlides"));
const AdminFeatured = lazy(() => import("./pages/admin/AdminFeatured"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <CurrencyProvider>
          <BrowserRouter>
            <RouteMetadata />
            <Suspense fallback={<div className="route-loading" role="status" aria-live="polite">Загрузка страницы…</div>}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/catalog" element={<Catalog />} />
              <Route path="/catalog/:categorySlug" element={<CategoryView />} />
              <Route path="/catalog/:categorySlug/:subcategorySlug" element={<SubcategoryView />} />
              <Route path="/catalog/:categorySlug/:subcategorySlug/:subSubcategorySlug" element={<ThirdLevelView />} />
              <Route path="/product/:slug" element={<ProductDetail />} />
              <Route path="/brand/:brandSlug" element={<BrandPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="*" element={<NotFound />} />

              {/* Admin routes */}
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="products/new" element={<AdminProductForm />} />
                <Route path="products/:productId/edit" element={<AdminProductForm />} />
                <Route path="slides" element={<AdminSlides />} />
                <Route path="featured" element={<AdminFeatured />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="settings" element={<AdminSettings />} />
              </Route>
            </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster />
          <CartToaster />
        </CurrencyProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
