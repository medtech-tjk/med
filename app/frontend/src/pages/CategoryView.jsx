import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useApi';
import { useLanguage } from '../context/LanguageContext';
import { ChevronRight, Loader2, Filter, X, SlidersHorizontal, PackageCheck } from 'lucide-react';

const CategoryView = () => {
  const [cart] = useState([]);
  const { categorySlug } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const { language, t, getLocalizedName, getLocalizedDescription } = useLanguage();

  // Загрузка категорий из API
  const { categories: catalogTree, loading: categoriesLoading } = useCategories();

  // Найти категорию
  const category = useMemo(() =>
    catalogTree.find(cat => cat.slug === categorySlug),
    [catalogTree, categorySlug]
  );

  // Загрузка товаров категории
  const { products, loading: productsLoading } = useProducts({
    category_id: category?.id,
    brand: selectedBrand || undefined
  });

  // Получить уникальные бренды
  const brands = useMemo(() => {
    const unique = new Map();
    products.forEach(p => {
      if (!p.brand || typeof p.brand !== 'string') return;
      const trimmed = p.brand.trim();
      const lower = trimmed.toLowerCase();
      if (lower === 'все бренды' || lower === 'all brands' || lower === 'all') return;
      
      if (!unique.has(lower)) {
        unique.set(lower, trimmed);
      } else {
        const current = unique.get(lower);
        const currentUppers = (current.match(/[A-ZА-Я]/g) || []).length;
        const newUppers = (trimmed.match(/[A-ZА-Я]/g) || []).length;
        if (newUppers > currentUppers) {
          unique.set(lower, trimmed);
        }
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  }, [products]);

  // Фильтрация по цене и наличию
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (priceRange.min && product.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && product.price > parseFloat(priceRange.max)) return false;
      if (inStockOnly && product.in_stock !== true) return false;
      return true;
    });
  }, [products, priceRange, inStockOnly]);

  // Sorting products
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => {
          if (a.price_on_request && !b.price_on_request) return 1;
          if (!a.price_on_request && b.price_on_request) return -1;
          return a.price - b.price;
        });
      case 'price_desc':
        return sorted.sort((a, b) => {
          if (a.price_on_request && !b.price_on_request) return 1;
          if (!a.price_on_request && b.price_on_request) return -1;
          return b.price - a.price;
        });
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = language === 'ru' ? (a.name_ru || a.name_en) : (a.name_en || a.name_ru);
          const nameB = language === 'ru' ? (b.name_ru || b.name_en) : (b.name_en || b.name_ru);
          return nameA.localeCompare(nameB);
        });
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      case 'popular':
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy, language]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, itemsPerPage, priceRange, selectedBrand, inStockOnly]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    return sortedProducts.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Прокрутка в начало при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug]);

  // SEO: dynamic title, meta description, canonical, JSON-LD
  useEffect(() => {
    if (!category) return;

    const name = getLocalizedName(category);
    const title = `${name} — медицинское оборудование | Tib Technology`;
    const desc = `${name} — профессиональное медицинское оборудование от ведущих мировых производителей. Купить в Душанбе. Tib Technology, Таджикистан.`;

    document.title = title;

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;

    // Open Graph
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `https://medtech.tj/catalog/${category.slug}`;

    // BreadcrumbList JSON-LD
    let breadcrumbJsonLd = document.querySelector('#category-breadcrumb-jsonld');
    if (!breadcrumbJsonLd) {
      breadcrumbJsonLd = document.createElement('script');
      breadcrumbJsonLd.id = 'category-breadcrumb-jsonld';
      breadcrumbJsonLd.type = 'application/ld+json';
      document.head.appendChild(breadcrumbJsonLd);
    }
    breadcrumbJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://medtech.tj/" },
        { "@type": "ListItem", "position": 2, "name": "Каталог", "item": "https://medtech.tj/catalog" },
        { "@type": "ListItem", "position": 3, "name": name, "item": `https://medtech.tj/catalog/${category.slug}` }
      ]
    });

    // CollectionPage JSON-LD
    let collectionJsonLd = document.querySelector('#category-collection-jsonld');
    if (!collectionJsonLd) {
      collectionJsonLd = document.createElement('script');
      collectionJsonLd.id = 'category-collection-jsonld';
      collectionJsonLd.type = 'application/ld+json';
      document.head.appendChild(collectionJsonLd);
    }
    collectionJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": desc,
      "url": `https://medtech.tj/catalog/${category.slug}`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Tib Technology",
        "url": "https://medtech.tj"
      }
    });

    return () => {
      document.title = 'Tib Technology — Медицинское оборудование';
      const el1 = document.querySelector('#category-breadcrumb-jsonld');
      if (el1) el1.remove();
      const el2 = document.querySelector('#category-collection-jsonld');
      if (el2) el2.remove();
      const can = document.querySelector('link[rel="canonical"]');
      if (can) can.remove();
    };
  }, [category, language, getLocalizedName, categorySlug]);

  const clearFilters = () => {
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
  };

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#074089] mx-auto" size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('categoryNotFound')}</h1>
          <Link to="/catalog" className="text-[#074089] hover:text-[#2C5BB4]">
            {t('backToCatalog')}
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <FloatingCart cartCount={cart.length} />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#074089]">{t('home')}</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-[#074089]">{t('catalog')}</Link>
          <span>/</span>
          <span className="text-gray-900">{getLocalizedName(category)}</span>
        </div>

        {/* Category Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            {getLocalizedName(category)}
          </h1>

          {/* Mobile filter button */}
          <div className="flex gap-2">
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${inStockOnly
                ? 'bg-[#074089] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-[#074089]'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-white' : 'bg-[#074089] animate-pulse'}`}></span>
              <PackageCheck size={16} />
              <span className="hidden sm:inline">{language === 'ru' ? 'В наличии' : 'In Stock'}</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700"
            >
              <SlidersHorizontal size={18} />
              {t('filters')}
            </button>
          </div>
        </div>

        {/* Category Description */}
        {getLocalizedDescription(category) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">{getLocalizedDescription(category)}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} />
                  {t('filters')}
                </h3>
                {(selectedBrand || priceRange.min || priceRange.max) && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={14} />
                    {t('reset')}
                  </button>
                )}
              </div>

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('brand')}
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent"
                  >
                    <option value="">{t('allBrands')}</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('price')}
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t('from')}
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    placeholder={t('to')}
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Subcategories */}
              {category.children && category.children.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('subcategories')}
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {category.children.map((sub) => (
                      <Link
                        key={sub.id}
                        to={`/catalog/${category.slug}/${sub.slug}`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#074089] hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {getLocalizedName(sub)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Subcategories Grid */}
            {category.children && category.children.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('subcategories')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.children.map((subcategory) => (
                    <Link
                      key={subcategory.id}
                      to={`/catalog/${category.slug}/${subcategory.slug}`}
                      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                    >
                      <div className="relative h-32 md:h-40 overflow-hidden bg-gradient-to-br from-[#074089]/10 to-white">
                        {subcategory.image ? (
                          <img
                            src={subcategory.image}
                            alt={getLocalizedName(subcategory)}
                            className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#074089]/20 to-[#074089]/5">
                            <div className="w-12 h-12 bg-[#074089]/30 rounded-full flex items-center justify-center">
                              <ChevronRight className="w-6 h-6 text-[#074089]" />
                            </div>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      </div>

                      <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                        <h3 className="text-sm md:text-base font-bold group-hover:translate-x-1 transition-transform duration-300 line-clamp-2">
                          {getLocalizedName(subcategory)}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Grid */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('products')} {sortedProducts.length > 0 && `(${sortedProducts.length})`}
                </h2>

                {/* Sorting and Items Per Page Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{language === 'ru' ? 'Показать:' : 'Show:'}</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#074089] focus:border-transparent"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Sort by */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{language === 'ru' ? 'Сортировка:' : 'Sort by:'}</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-[#074089] focus:border-transparent"
                    >
                      <option value="popular">{language === 'ru' ? 'По популярности' : 'By popularity'}</option>
                      <option value="newest">{language === 'ru' ? 'Сначала новые' : 'Newest first'}</option>
                      <option value="price_asc">{language === 'ru' ? 'Цена: по возрастанию' : 'Price: Low to High'}</option>
                      <option value="price_desc">{language === 'ru' ? 'Цена: по убыванию' : 'Price: High to Low'}</option>
                      <option value="name">{language === 'ru' ? 'По названию' : 'By name'}</option>
                    </select>
                  </div>
                </div>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#074089]" size={48} />
                </div>
              ) : filteredProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 flex-wrap mt-8">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        ←
                      </button>

                      {(() => {
                        const pages = [];
                        if (totalPages <= 7) {
                          for (let i = 1; i <= totalPages; i++) {
                            pages.push(
                              <button key={i} onClick={() => setCurrentPage(i)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === i
                                  ? 'bg-[#074089] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                {i}
                              </button>
                            );
                          }
                        } else {
                          pages.push(
                            <button key={1} onClick={() => setCurrentPage(1)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                                ? 'bg-[#074089] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                              1
                            </button>
                          );
                          if (currentPage > 3) pages.push(<span key="el1" className="px-2 text-gray-500">...</span>);
                          const start = Math.max(2, currentPage - 1);
                          const end = Math.min(totalPages - 1, currentPage + 1);
                          for (let i = start; i <= end; i++) {
                            pages.push(
                              <button key={i} onClick={() => setCurrentPage(i)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === i
                                  ? 'bg-[#074089] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                                {i}
                              </button>
                            );
                          }
                          if (currentPage < totalPages - 2) pages.push(<span key="el2" className="px-2 text-gray-500">...</span>);
                          pages.push(
                            <button key={totalPages} onClick={() => setCurrentPage(totalPages)}
                              className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                                ? 'bg-[#074089] text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}>
                              {totalPages}
                            </button>
                          );
                        }
                        return pages;
                      })()}

                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                          }`}
                      >
                        →
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-white rounded-xl shadow-md p-8 text-center">
                  <div className="text-5xl mb-4">📦</div>
                  <p className="text-gray-900 text-lg font-semibold mb-2">{t('noProducts')}</p>
                  <p className="text-gray-500">
                    {selectedBrand || priceRange.min || priceRange.max
                      ? t('changeFilters')
                      : t('comingSoon')}
                  </p>
                </div>
              )}
            </section>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CategoryView;
