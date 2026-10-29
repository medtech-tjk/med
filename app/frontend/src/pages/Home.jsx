import CategoryCard from '../components/CategoryCard';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import HeroSlider from '../components/HeroSlider';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useFeaturedProducts } from '../hooks/useApi';
import { ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { COMPANY } from '../lib/company';

const Home = () => {
  const [featuredPage, setFeaturedPage] = useState(0);
  const { t, language, getLocalizedName } = useLanguage();

  // Загрузка категорий из API
  const { categories: catalogTree, loading: categoriesLoading, error: categoriesError } = useCategories();
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

  // SEO: Organization + WebSite JSON-LD for homepage
  useEffect(() => {
    // Organization schema
    const orgJsonLd = document.createElement('script');
    orgJsonLd.id = 'org-jsonld';
    orgJsonLd.type = 'application/ld+json';
    orgJsonLd.textContent = JSON.stringify({
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
        "streetAddress": COMPANY.street,
        "addressLocality": "Душанбе",
        "addressCountry": "TJ"
      },
      "sameAs": [
        "https://www.instagram.com/medtech.tj/",
        "https://t.me/TibTekhnologiya"
      ],
      "openingHoursSpecification": {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    });
    document.head.appendChild(orgJsonLd);

    // WebSite schema with SearchAction — helps Google show search box and proper sitelinks
    const websiteJsonLd = document.createElement('script');
    websiteJsonLd.id = 'website-jsonld';
    websiteJsonLd.type = 'application/ld+json';
    websiteJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Tib Technology",
      "alternateName": "Тиб Технология",
      "url": "https://medtech.tj",
      "potentialAction": {
        "@type": "SearchAction",
        "target": {
          "@type": "EntryPoint",
          "urlTemplate": "https://medtech.tj/catalog?search={search_term_string}"
        },
        "query-input": "required name=search_term_string"
      }
    });
    document.head.appendChild(websiteJsonLd);

    // SiteNavigationElement — tells Google the real site sections
    const navJsonLd = document.createElement('script');
    navJsonLd.id = 'nav-jsonld';
    navJsonLd.type = 'application/ld+json';
    navJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "SiteNavigationElement",
          "position": 1,
          "name": "Каталог оборудования",
          "description": "Каталог медицинского оборудования",
          "url": "https://medtech.tj/catalog"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 2,
          "name": "Ультразвуковая диагностика",
          "description": "УЗИ аппараты и сканеры",
          "url": "https://medtech.tj/catalog/ultrasound"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 3,
          "name": "Эндоскопия",
          "description": "Эндоскопическое оборудование",
          "url": "https://medtech.tj/catalog/flexible-endoscopy"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 4,
          "name": "О компании",
          "description": "О компании Tib Technology",
          "url": "https://medtech.tj/about"
        },
        {
          "@type": "SiteNavigationElement",
          "position": 5,
          "name": "Наши услуги",
          "description": "Услуги компании Tib Technology",
          "url": "https://medtech.tj/services"
        }
      ]
    });
    document.head.appendChild(navJsonLd);

    return () => {
      const el1 = document.querySelector('#org-jsonld');
      if (el1) el1.remove();
      const el2 = document.querySelector('#website-jsonld');
      if (el2) el2.remove();
      const el3 = document.querySelector('#nav-jsonld');
      if (el3) el3.remove();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <FloatingCart />

      <main id="main-content" tabIndex={-1} className="flex-1">
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
                      aria-label={language === 'ru' ? 'Предыдущие товары' : 'Previous products'}
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
                      aria-label={language === 'ru' ? 'Следующие товары' : 'Next products'}
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
            ) : categoriesError || catalogTree.length === 0 ? (
              <div role="status" className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center">
                <p className="text-slate-700">{language === 'ru' ? 'Каталог сейчас недоступен. Поможем подобрать оборудование по телефону.' : 'The catalog is currently unavailable. Call us for help choosing equipment.'}</p>
                <a href="tel:+992933339639" className="inline-block mt-4 text-[#074089] font-semibold underline underline-offset-4">+992 93 333 96 39</a>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {catalogTree.map(category => <CategoryCard key={category.id} category={category} />)}
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
      </main>

      <Footer />
    </div>
  );
};

export default Home;
