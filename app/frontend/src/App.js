import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Catalog from "./pages/Catalog";
import CategoryView from "./pages/CategoryView";
import SubcategoryView from "./pages/SubcategoryView";
import ThirdLevelView from "./pages/ThirdLevelView";
import ProductDetail from "./pages/ProductDetail";
import BrandPage from "./pages/BrandPage";
import Cart from "./pages/Cart";
import About from "./pages/About";
import Services from "./pages/Services";
import { Toaster } from "./components/ui/sonner";
import { CurrencyProvider } from "./context/CurrencyContext";
import { LanguageProvider } from "./context/LanguageContext";

// Admin pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminSlides from "./pages/admin/AdminSlides";
import AdminFeatured from "./pages/admin/AdminFeatured";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettings from "./pages/admin/AdminSettings";

function App() {
  return (
    <div className="App">
      <LanguageProvider>
        <CurrencyProvider>
          <BrowserRouter>
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
          </BrowserRouter>
          <Toaster />
        </CurrencyProvider>
      </LanguageProvider>
    </div>
  );
}

export default App;
