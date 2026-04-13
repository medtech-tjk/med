import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useFeaturedProducts } from '../hooks/useApi';
import { ChevronRight, ChevronLeft, Loader2, ShoppingCart } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

const Home = () => {
  const [cart, setCart] = useState([]);
  const [featuredPage, setFeaturedPage] = useState(0);
  const { formatPrice } = useCurrency();
  const { t, language, getLocalizedName } = useLanguage();

  // Загрузка категорий из API
  const { categories: catalogTree, loading: categoriesLoading } = useCategories();
  // Загрузка рекомендованных товаров
  const { products: featuredProducts, loading: featuredLoading } = useFeaturedProducts();

  // Параметры сетки популярных товаров
  const itemsPerPage = 8; // 4x2
  const totalPages = Math.ceil((featuredProducts?.length || 0) / itemsPerPage);
  const currentProducts = featuredProducts?.slice(
    featuredPage * itemsPerPage,
    (featuredPage + 1) * itemsPerPage
  ) || [];

  const nextPage = () => {
    if (featuredPage < totalPages - 1) {
      setFeaturedPage(prev => prev + 1);
    }
  };

  const prevPage = () => {
    if (featuredPage > 0) {
      setFeaturedPage(prev => prev - 1);
    }
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${(process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '')}${imagePath}`;
  };

  // SEO: Organization JSON-LD for homepage
  useEffect(() => {
    const jsonLd = document.createElement('script');
    jsonLd.id = 'org-jsonld';
    jsonLd.type = 'application/ld+json';
    jsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MedicalBusiness",
      "name": "Tib Technology",
      "alternateName": "ООО «Тиб Технология»",
      "url": "https://medtech.tj",
      "logo": "https://medtech.tj/logo.svg",
      "description": "Магазин современного медицинского оборудования в Душанбе, Таджикистане. УЗИ аппараты, эндоскопы, рентген от ведущих мировых производителей.",
      "telephone": "+992933339639",
      "email": "tjkmedtech@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Душанбе",
        "addressCountry": "TJ"
      },
      "sameAs": [],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    });
    document.head.appendChild(jsonLd);

    return () => {
      const el = document.querySelector('#org-jsonld');
      if (el) el.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FloatingCart cartCount={cart.length} />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Featured Products Section - 4x2 grid */}
      {featuredProducts && featuredProducts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{t('popularProducts')}</h2>
                <p className="text-gray-600 mt-2">{t('popularProductsDesc')}</p>
              </div>
              {totalPages > 1 && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={prevPage}
                    disabled={featuredPage === 0}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={24} className="text-gray-600" />
                  </button>
                  <span className="text-sm text-gray-500 px-2">
                    {featuredPage + 1} / {totalPages}
                  </span>
                  <button
                    onClick={nextPage}
                    disabled={featuredPage >= totalPages - 1}
                    className="p-2 rounded-full bg-white shadow-md hover:shadow-lg transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={24} className="text-gray-600" />
                  </button>
                </div>
              )}
            </div>

            {featuredLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="animate-spin text-[#074089]" size={48} />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {currentProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* View all button */}
            <div className="text-center mt-8">
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#074089] text-white rounded-lg hover:bg-[#2C5BB4] transition-colors font-semibold"
              >
                {language === 'ru' ? 'Смотреть весь каталог' : 'View full catalog'}
                <ChevronRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Categories Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              {language === 'ru' ? 'Категории оборудования' : 'Equipment Categories'}
            </h2>
            <p className="text-gray-600 mt-2">
              {language === 'ru' ? 'Выберите нужную категорию' : 'Select the category you need'}
            </p>
          </div>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="animate-spin text-[#074089]" size={48} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {catalogTree.map((category) => (
                <Link
                  key={category.id}
                  to={`/catalog/${category.slug}`}
                  className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                >
                  {/* Image */}
                  <div className="relative h-48 overflow-hidden bg-gradient-to-br from-blue-50 to-white">
                    {category.image ? (
                      <img
                        src={category.image}
                        alt={category.name}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                        <span className="text-4xl text-blue-300">📁</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                    <h3 className="text-lg font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
                      {getLocalizedName(category)}
                    </h3>
                    <div className="flex items-center text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                      <span>{language === 'ru' ? 'Смотреть товары' : 'View products'}</span>
                      <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>

                  {/* Count badge - glassmorphism effect */}
                  {category.children && category.children.length > 0 && (
                    <div className="absolute top-3 right-3 backdrop-blur-md bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                      {category.children.length}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">{t('whyUs')}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#074089]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#074089]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('qualityEquipment')}</h3>
            <p className="text-gray-600">{t('qualityEquipmentDesc')}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#074089]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#074089]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('fastDelivery')}</h3>
            <p className="text-gray-600">{t('fastDeliveryDesc')}</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow">
            <div className="w-16 h-16 bg-[#074089]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-[#074089]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold mb-2">{t('support247')}</h3>
            <p className="text-gray-600">{t('support247Desc')}</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
