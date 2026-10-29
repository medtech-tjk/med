import FilterOptions from '../components/FilterOptions';
import CategoryCard from '../components/CategoryCard';
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useProductsPage } from '../hooks/useApi';
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
  const { products, loading: productsLoading, total, pages: totalPages, facets } = useProductsPage({
    category_id: category?.id, brand: selectedBrand || undefined,
    min_price: priceRange.min ? Number(priceRange.min) : undefined,
    max_price: priceRange.max ? Number(priceRange.max) : undefined,
    in_stock: inStockOnly ? true : undefined,
    sort: ({popular:'popular',price_asc:'price_asc',price_desc:'price_desc',name:'name',newest:'new'})[sortBy] || 'popular',
    page: currentPage, page_size: itemsPerPage, language
  });

  // Получить уникальные бренды
  const brands = useMemo(() => {
    if (facets?.brands) return facets.brands;
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
  }, [products, facets]);

  // Фильтрация по цене и наличию
  const paginatedProducts = products;

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy, itemsPerPage, priceRange, selectedBrand, inStockOnly]);

  // Pagination

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
      <div className="catalog-page min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-16 text-center flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-[#074089] mx-auto" size={48} />
        </main>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="catalog-page min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">{t('categoryNotFound')}</h1>
          <Link to="/catalog" className="text-[#074089] hover:text-[#2C5BB4]">
            {t('backToCatalog')}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="catalog-page min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <FloatingCart cartCount={cart.length} />

      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-8 flex-1">
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
              aria-label={language === 'ru' ? 'В наличии' : 'In Stock'}
              aria-pressed={inStockOnly}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${inStockOnly
                ? 'bg-[#074089] text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-[#074089]'
                }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? 'bg-white' : 'bg-[#074089] '}`}></span>
              <PackageCheck size={16} />
              <span className="hidden sm:inline">{language === 'ru' ? 'В наличии' : 'In Stock'}</span>
            </button>
            <button
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300 text-gray-700"
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
          <aside className={`filter-sidebar w-full lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-5">
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
                  <FilterOptions label={t('brand')} options={brands} value={selectedBrand} onChange={setSelectedBrand} multiple={false} />
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
                  <div className="space-y-1 ">
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
          <div className="catalog-results flex-1">
            {/* Subcategories Grid */}
            {category.children && category.children.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('subcategories')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {category.children.map(subcategory => <CategoryCard key={subcategory.id} category={subcategory} to={`/catalog/${category.slug}/${subcategory.slug}`} />)}
                </div>
              </section>
            )}

            {/* Products Grid */}
            <section>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('products')} {total > 0 && `(${total})`}
                </h2>

                {/* Sorting and Items Per Page Controls */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">{language === 'ru' ? 'Показать:' : 'Show:'}</span>
                    <select
                      aria-label={language === 'ru' ? 'Количество товаров на странице' : 'Products per page'}
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
                      aria-label={language === 'ru' ? 'Сортировка товаров' : 'Sort products'}
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
              ) : products.length > 0 ? (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
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
      </main>

      <Footer />
    </div>
  );
};

export default CategoryView;
