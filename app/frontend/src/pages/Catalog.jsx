import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { useCategories, useProducts, useCategorySpecs } from '../hooks/useApi';
import { ChevronDown, ChevronUp, SlidersHorizontal, X, ChevronRight, Loader2, PackageCheck } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useLanguage } from '../context/LanguageContext';

const Catalog = () => {
  const { categorySlug, subcategorySlug, subSubcategorySlug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const { t, language, getLocalizedName, getLocalizedDescription } = useLanguage();

  // Загрузка категорий из API
  const { categories: catalogTree, loading: categoriesLoading } = useCategories();

  // Прокрутка в начало при изменении категории
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug, subcategorySlug, subSubcategorySlug]);

  // Если нет параметров - показываем все категории
  const showAllCategories = !categorySlug && !subcategorySlug && !subSubcategorySlug && !searchQuery;

  const [cart, setCart] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showAllFilters, setShowAllFilters] = useState(false); // Для кнопки "Еще"
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [inStockOnly, setInStockOnly] = useState(false); // Фильтр "В наличии"

  // Get current category, subcategory and sub-subcategory
  const currentCategory = catalogTree.find(c => c.slug === categorySlug);
  const currentSubcategory = currentCategory?.children?.find(s => s.slug === subcategorySlug);
  const currentSubSubcategory = currentSubcategory?.children?.find(s => s.slug === subSubcategorySlug);

  // SEO: динамические title и meta description
  useEffect(() => {
    let title = 'Каталог медицинского оборудования — Tib Technology';
    let desc = 'Купить медицинское оборудование в Душанбе и Таджикистане. УЗИ аппараты, эндоскопы, рентген и другое профессиональное оборудование от Tib Technology.';

    if (currentSubSubcategory) {
      const name = getLocalizedName(currentSubSubcategory);
      title = `${name} — купить в Tib Technology`;
      desc = `${name} в Душанбе. Медицинское оборудование от ведущих производителей с гарантией. Tib Technology, Таджикистан.`;
    } else if (currentSubcategory) {
      const name = getLocalizedName(currentSubcategory);
      title = `${name} — купить в Tib Technology`;
      desc = `${name} — широкий выбор медицинского оборудования в Душанбе. Доставка по Таджикистану. Tib Technology.`;
    } else if (currentCategory) {
      const name = getLocalizedName(currentCategory);
      title = `${name} — медицинское оборудование | Tib Technology`;
      desc = `${name} — профессиональное медицинское оборудование от ведущих мировых производителей. Купить в Душанбе, Tib Technology.`;
    } else if (searchQuery) {
      title = `Поиск: ${searchQuery} — Tib Technology`;
      desc = `Результаты поиска медицинского оборудования по запросу "${searchQuery}". Tib Technology, Душанбе.`;
    }

    document.title = title;
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = desc;

    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = title;
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.content = desc;

    // BreadcrumbList JSON-LD
    let breadcrumbJsonLd = document.querySelector('#catalog-breadcrumb-jsonld');
    if (!breadcrumbJsonLd) {
      breadcrumbJsonLd = document.createElement('script');
      breadcrumbJsonLd.id = 'catalog-breadcrumb-jsonld';
      breadcrumbJsonLd.type = 'application/ld+json';
      document.head.appendChild(breadcrumbJsonLd);
    }
    const breadcrumbItems = [
      { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://medtech.tj/" },
      { "@type": "ListItem", "position": 2, "name": "Каталог", "item": "https://medtech.tj/catalog" }
    ];
    if (currentCategory) {
      breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": getLocalizedName(currentCategory), "item": `https://medtech.tj/catalog/${currentCategory.slug}` });
    }
    if (currentSubcategory) {
      breadcrumbItems.push({ "@type": "ListItem", "position": 4, "name": getLocalizedName(currentSubcategory), "item": `https://medtech.tj/catalog/${categorySlug}/${currentSubcategory.slug}` });
    }
    if (currentSubSubcategory) {
      breadcrumbItems.push({ "@type": "ListItem", "position": 5, "name": getLocalizedName(currentSubSubcategory), "item": `https://medtech.tj/catalog/${categorySlug}/${subcategorySlug}/${currentSubSubcategory.slug}` });
    }
    breadcrumbJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbItems
    });

    // CollectionPage JSON-LD — helps Google understand this is a product catalog page
    let collectionJsonLd = document.querySelector('#catalog-collection-jsonld');
    if (!collectionJsonLd) {
      collectionJsonLd = document.createElement('script');
      collectionJsonLd.id = 'catalog-collection-jsonld';
      collectionJsonLd.type = 'application/ld+json';
      document.head.appendChild(collectionJsonLd);
    }
    collectionJsonLd.textContent = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": title,
      "description": desc,
      "url": `https://medtech.tj${window.location.pathname}`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "Tib Technology",
        "url": "https://medtech.tj"
      }
    });

    return () => {
      document.title = 'Tib Technology — Медицинское оборудование в Таджикистане';
      const el1 = document.querySelector('#catalog-breadcrumb-jsonld');
      if (el1) el1.remove();
      const el2 = document.querySelector('#catalog-collection-jsonld');
      if (el2) el2.remove();
    };
  }, [currentCategory, currentSubcategory, currentSubSubcategory, searchQuery, language, getLocalizedName, categorySlug, subcategorySlug]);

  // Определяем активную категорию для отображения фильтров
  const activeCategory = subSubcategorySlug ? currentSubSubcategory : currentSubcategory;
  const activeSlug = subSubcategorySlug || subcategorySlug;

  // Получаем фильтры для текущей подкатегории из API
  const { specs: availableFilters } = useCategorySpecs(activeSlug, language);

  // Загрузка товаров из API
  const { products: apiProducts, loading: productsLoading } = useProducts({
    category_id: currentCategory?.id,
    subcategory_id: currentSubcategory?.id,
    search: searchQuery
  });

  const products = apiProducts || [];
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))]; // Уникальные бренды из товаров

  // Filter products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (subcategorySlug && currentSubcategory) {
      filtered = filtered.filter(p => p.subcategory_id === currentSubcategory.id);
    } else if (categorySlug && currentCategory) {
      filtered = filtered.filter(p => p.category_id === currentCategory.id);
    }

    // Note: Search filtering is done on backend with fuzzy search
    // No need for client-side search filter

    // Filter by price
    filtered = filtered.filter(p => p.price >= priceRange[0] && p.price <= priceRange[1]);

    // Filter by in stock
    if (inStockOnly) {
      filtered = filtered.filter(p => p.in_stock === true);
    }

    // Filter by brands
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(p => selectedBrands.includes(p.brand));
    }

    // Sort
    if (sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'popular') {
      filtered.sort((a, b) => (b.isPopular ? 1 : 0) - (a.isPopular ? 1 : 0));
    } else if (sortBy === 'new') {
      filtered.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
    }

    return filtered;
  }, [products, categorySlug, subcategorySlug, searchQuery, priceRange, selectedBrands, sortBy, inStockOnly]);

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleAddToCart = (product) => {
    setCart([...cart, product]);
    toast({
      title: 'Товар добавлен в корзину',
      description: product.name,
    });
  };

  const toggleBrand = (brand) => {
    setSelectedBrands(prev =>
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const clearFilters = () => {
    setPriceRange([0, 5000000]);
    setSelectedBrands([]);
    setInStockOnly(false);
  };

  // Breadcrumbs
  const breadcrumbs = [
    { name: t('home'), path: '/' },
    { name: t('catalog'), path: '/catalog' }
  ];
  if (currentCategory) {
    breadcrumbs.push({ name: getLocalizedName(currentCategory), path: `/catalog/${currentCategory.slug}` });
  }
  if (currentSubcategory) {
    breadcrumbs.push({ name: getLocalizedName(currentSubcategory), path: `/catalog/${categorySlug}/${subcategorySlug}` });
  }
  if (currentSubSubcategory) {
    breadcrumbs.push({ name: getLocalizedName(currentSubSubcategory), path: `/catalog/${categorySlug}/${subcategorySlug}/${subSubcategorySlug}` });
  }

  // Всегда показываем фильтры если есть категория или подкатегория (страница товаров)
  const showFiltersSection = (categorySlug && (subcategorySlug || subSubcategorySlug)) || searchQuery;

  // Определяем заголовок страницы
  const pageTitle = currentSubSubcategory
    ? getLocalizedName(currentSubSubcategory)
    : currentSubcategory
      ? getLocalizedName(currentSubcategory)
      : currentCategory
        ? getLocalizedName(currentCategory)
        : (searchQuery ? `${t('searchResults')}: \"${searchQuery}\"` : t('allProducts'));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <FloatingCart />

      <div className="container mx-auto px-4 py-8 flex-1">
        {/* Показываем все категории если нет параметров */}
        {showAllCategories ? (
          <>
            {/* Header with In Stock filter */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <h1 className="text-4xl font-bold text-gray-900">{language === 'ru' ? 'Каталог медицинского оборудования' : 'Medical Equipment Catalog'}</h1>
              <button
                onClick={() => setInStockOnly(!inStockOnly)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all duration-300 shadow-md hover:shadow-lg ${inStockOnly
                  ? 'bg-[#074089] text-white border-2 border-[#074089]'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-[#074089]'
                  }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full ${inStockOnly ? 'bg-white' : 'bg-[#074089]'} ${inStockOnly ? '' : 'animate-pulse'}`}></span>
                <PackageCheck size={18} className={inStockOnly ? 'text-white' : 'text-[#074089]'} />
                <span>{language === 'ru' ? 'В наличии' : 'In Stock'}</span>
              </button>
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
                      <h3 className="text-xl font-bold mb-2 group-hover:translate-x-2 transition-transform duration-300">
                        {getLocalizedName(category)}
                      </h3>
                      <div className="flex items-center text-sm opacity-90 group-hover:opacity-100 transition-opacity">
                        <span>{language === 'ru' ? 'Смотреть категорию' : 'View category'}</span>
                        <ChevronRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Count badge - glassmorphism effect */}
                    {category.children && category.children.length > 0 && (
                      <div className="absolute top-3 right-3 backdrop-blur-md bg-white/30 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg border border-white/20">
                        {category.children.length} {language === 'ru' ? 'подкатегорий' : 'subcategories'}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  <a href={crumb.path} className="hover:text-[#074089]">{crumb.name}</a>
                </React.Fragment>
              ))}
            </div>

            {/* Page title */}
            <h1 className="text-3xl font-bold text-gray-900 mb-8">
              {pageTitle}
            </h1>

            <div className="flex gap-8 items-start">
              {/* Filters Sidebar - показываем только если есть подкатегория */}
              {showFiltersSection && (
                <aside className={`${showFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto' : 'hidden'
                  } lg:block lg:w-72 flex-shrink-0 lg:sticky lg:top-24 lg:self-start`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                      <h2 className="text-xl font-bold">{t('filters')}</h2>
                      <button onClick={() => setShowFilters(false)}>
                        <X size={24} />
                      </button>
                    </div>

                    {/* Динамические фильтры */}
                    {availableFilters.slice(0, showAllFilters ? availableFilters.length : 3).map((filter) => (
                      <div key={filter.key} className="bg-white p-5 rounded-lg shadow-md">
                        <h3 className="font-semibold mb-4 text-gray-900">{filter.label}</h3>

                        {filter.type === 'range' && (
                          <div className="space-y-3">
                            <input
                              type="number"
                              placeholder="От"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                            <input
                              type="number"
                              placeholder="До"
                              className="w-full px-3 py-2 border rounded-lg text-sm"
                            />
                          </div>
                        )}

                        {filter.type === 'select' && filter.adminManaged && (
                          <div className="space-y-2">
                            {(filter.key === 'brand' ? brands : ['Россия', 'Китай', 'США', 'Германия', 'Япония']).map((option) => (
                              <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-[#074089] rounded"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}

                        {filter.type === 'checkbox' && filter.options && (
                          <div className="space-y-2">
                            {filter.options.map((option) => (
                              <label key={option} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                                <input
                                  type="checkbox"
                                  className="w-4 h-4 text-[#074089] rounded"
                                />
                                <span className="text-sm">{option}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Show More Filters Button */}
                    {availableFilters.length > 3 && (
                      <button
                        onClick={() => setShowAllFilters(!showAllFilters)}
                        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        {showAllFilters ? (
                          <>
                            <ChevronUp size={18} />
                            {t('hideFilters')}
                          </>
                        ) : (
                          <>
                            <ChevronDown size={18} />
                            {t('moreFilters')} ({availableFilters.length - 3})
                          </>
                        )}
                      </button>
                    )}

                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      className="w-full py-3 text-sm text-[#074089] hover:text-#2C5BB4 font-semibold bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {t('clearFilters')}
                    </button>
                  </div>
                </aside>
              )}

              {/* Products Grid */}
              <div className={`${showFiltersSection ? "flex-1" : "w-full"} min-h-[calc(100vh-200px)]`}>
                {/* Toolbar */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowFilters(true)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#074089] text-white rounded-lg hover:bg-[#2C5BB4] transition-colors"
                    >
                      <SlidersHorizontal size={18} />
                      {t('filters')}
                    </button>
                    <span className="text-gray-600">
                      {t('foundProducts')} {filteredProducts.length} {t('productsWord')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <select
                      value={itemsPerPage}
                      onChange={(e) => {
                        setItemsPerPage(Number(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={20}>{t('items20')}</option>
                      <option value={50}>{t('items50')}</option>
                      <option value={100}>{t('items100')}</option>
                    </select>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="popular">{t('byPopularity')}</option>
                      <option value="new">{t('newItems')}</option>
                      <option value="price-asc">{t('priceAsc')}</option>
                      <option value="price-desc">{t('priceDesc')}</option>
                    </select>
                  </div>
                </div>

                {/* Active Filters */}
                {(selectedBrands.length > 0) && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {selectedBrands.map((brand) => (
                      <div
                        key={brand}
                        className="bg-blue-100 text-#2C5BB4 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {brand}
                        <button onClick={() => toggleBrand(brand)} className="hover:text-blue-900">
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Products - Block 2: Product Grid */}
                <section className="mb-12">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">{searchQuery ? t('searchResults') : t('popularProducts')}</h2>
                  {paginatedProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {paginatedProducts.map((product) => (
                          <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                        ))}
                      </div>

                      {/* Pagination */}
                      {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                          {/* Previous Button */}
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

                          {/* Page Numbers with Smart Display */}
                          {(() => {
                            const pages = [];
                            const showEllipsisThreshold = 7; // Show ellipsis if more than 7 pages

                            if (totalPages <= showEllipsisThreshold) {
                              // Show all pages if total is small
                              for (let i = 1; i <= totalPages; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === i
                                      ? 'bg-[#074089] text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-100'
                                      }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }
                            } else {
                              // Smart pagination: show first, last, current and 2 neighbors with ellipsis
                              // Always show first page
                              pages.push(
                                <button
                                  key={1}
                                  onClick={() => setCurrentPage(1)}
                                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === 1
                                    ? 'bg-[#074089] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                  1
                                </button>
                              );

                              // Left ellipsis
                              if (currentPage > 3) {
                                pages.push(
                                  <span key="ellipsis-left" className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }

                              // Pages around current
                              const start = Math.max(2, currentPage - 1);
                              const end = Math.min(totalPages - 1, currentPage + 1);

                              for (let i = start; i <= end; i++) {
                                pages.push(
                                  <button
                                    key={i}
                                    onClick={() => setCurrentPage(i)}
                                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === i
                                      ? 'bg-[#074089] text-white'
                                      : 'bg-white text-gray-700 hover:bg-gray-100'
                                      }`}
                                  >
                                    {i}
                                  </button>
                                );
                              }

                              // Right ellipsis
                              if (currentPage < totalPages - 2) {
                                pages.push(
                                  <span key="ellipsis-right" className="px-2 text-gray-500">
                                    ...
                                  </span>
                                );
                              }

                              // Always show last page
                              pages.push(
                                <button
                                  key={totalPages}
                                  onClick={() => setCurrentPage(totalPages)}
                                  className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === totalPages
                                    ? 'bg-[#074089] text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                    }`}
                                >
                                  {totalPages}
                                </button>
                              );
                            }

                            return pages;
                          })()}

                          {/* Next Button */}
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
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                      <div className="text-6xl mb-6">🔍</div>
                      {searchQuery ? (
                        <>
                          <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('noResultsFound')}</h3>
                          <p className="text-gray-600 mb-8 max-w-md mx-auto">
                            {language === 'ru' ? `По вашему запросу "${searchQuery}" ${t('tryChangingQuery')}` : `For your search "${searchQuery}" ${t('tryChangingQuery')}`}
                          </p>
                          <button
                            onClick={() => window.location.href = 'mailto:tjkmedtech@gmail.com?subject=Product search request: ' + searchQuery}
                            className="bg-[#074089] hover:bg-[#2C5BB4] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
                          >
                            {t('submitRequest')}
                          </button>
                        </>
                      ) : (
                        <>
                          <p className="text-gray-900 text-lg font-semibold mb-2">{t('noProducts')}</p>
                          <p className="text-gray-500">{t('comingSoon')}</p>
                        </>
                      )}
                    </div>
                  )}
                </section>

                {/* Category Description - теперь ПОСЛЕ продуктов */}
                {!searchQuery && activeCategory && (
                  <section className="mt-12">
                    <div className="bg-white rounded-xl shadow-md p-8">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">{t('aboutSection')} "{getLocalizedName(activeCategory)}"</h2>
                      <div className="text-gray-700 leading-relaxed space-y-4">
                        {getLocalizedDescription(activeCategory) ? (
                          <p>{getLocalizedDescription(activeCategory)}</p>
                        ) : (
                          <p>
                            {getLocalizedName(activeCategory)} — {language === 'ru' ? 'это современное медицинское оборудование от ведущих мировых производителей. В данном разделе представлены устройства высокого качества, соответствующие международным стандартам. Все оборудование сертифицировано и имеет гарантию производителя.' : 'modern medical equipment from world-leading manufacturers. This section features high-quality devices that comply with international standards. All equipment is certified and comes with a manufacturer warranty.'}
                          </p>
                        )}
                        <p>
                          {language === 'ru' ? 'Для получения консультации или оформления заказа обращайтесь по телефону +992 93 333 96 39 или отправьте заявку через форму на сайте.' : 'For consultation or to place an order, call +992 93 333 96 39 or submit a request through the form on the website.'}
                        </p>
                      </div>
                    </div>
                  </section>
                )}

                {/* Block 3: Category Description MOVED BELOW - будет после products */}
              </div>
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
