import FilterOptions from '../components/FilterOptions';
import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import CategoryCard from '../components/CategoryCard';
import { useCategories, useProductsPage } from '../hooks/useApi';
import { SlidersHorizontal, X, ChevronRight, Loader2, PackageCheck } from 'lucide-react';
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
  const [priceRange, setPriceRange] = useState([0, '']);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortBy, setSortBy] = useState('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [inStockOnly, setInStockOnly] = useState(false); // Фильтр "В наличии"

  useEffect(() => {setCurrentPage(1);},[searchQuery,priceRange,selectedBrands,sortBy,inStockOnly,itemsPerPage]);

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

  // Загрузка товаров из API
  const { products: apiProducts, loading: productsLoading, error: productsError, total: filteredTotal, pages: totalPages, facets } = useProductsPage({
    category_id: currentCategory?.id,
    subcategory_id: currentSubcategory?.id,
    third_level_id: currentSubSubcategory?.id,
    search: searchQuery,
    brands: selectedBrands,
    min_price: Number(priceRange[0]) > 0 ? Number(priceRange[0]) : undefined,
    max_price: priceRange[1] !== '' ? Number(priceRange[1]) : undefined,
    in_stock: inStockOnly ? true : undefined,
    sort: ({'price-asc':'price_asc','price-desc':'price_desc',popular:'popular',new:'new'})[sortBy] || 'popular',
    page: currentPage,
    page_size: itemsPerPage,
    language
  });

  const products = apiProducts || [];
  const brands = facets?.brands || [];

  // Filter products
  const filteredProducts = products;
  const paginatedProducts = products;

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
    setPriceRange([0, '']);
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
    <div className="catalog-page min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <FloatingCart />

      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-8 flex-1">
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
                <span className={`w-2.5 h-2.5 rounded-full ${inStockOnly ? 'bg-white' : 'bg-[#074089]'} ${inStockOnly ? '' : ''}`}></span>
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
                {catalogTree.map(category => <CategoryCard key={category.id} category={category} headingLevel={2} />)}
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

            <div className="flex flex-col lg:flex-row gap-6 items-start">
              {/* Filters Sidebar - показываем только если есть подкатегория */}
              {showFiltersSection && (
                <aside className={`${showFilters ? 'block' : 'hidden'
                  } filter-sidebar catalog-filter-panel w-full lg:block lg:w-64 flex-shrink-0 lg:self-start bg-white border border-slate-200 rounded-xl p-5`}>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-6 lg:hidden">
                      <h2 className="text-xl font-bold">{t('filters')}</h2>
                      <button aria-label={language === 'ru' ? 'Закрыть фильтры' : 'Close filters'} onClick={() => setShowFilters(false)}>
                        <X size={24} />
                      </button>
                    </div>

                    <fieldset className="border-b border-slate-100 pb-5">
                      <legend className="font-semibold text-sm text-slate-800 mb-3">{t('price')} · TJS</legend>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="text-xs text-slate-600">{t('from')}<input type="number" min="0" value={priceRange[0]} onChange={e=>setPriceRange([e.target.value,priceRange[1]])} className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
                        <label className="text-xs text-slate-600">{t('to')}<input type="number" min="0" value={priceRange[1]} onChange={e=>setPriceRange([priceRange[0],e.target.value])} placeholder="—" className="mt-1 w-full px-3 py-2 border rounded-lg" /></label>
                      </div>
                    </fieldset>
                    {brands.length > 0 && <FilterOptions label={t('brand')} options={brands} value={selectedBrands} onChange={setSelectedBrands} />}
                    <label className="flex items-center gap-3 text-sm min-h-[44px] cursor-pointer"><input type="checkbox" checked={inStockOnly} onChange={e=>setInStockOnly(e.target.checked)} className="w-4 h-4"/>{language === 'ru' ? 'Только в наличии' : 'In stock only'}</label>
                    {/* Clear Filters */}
                    <button
                      onClick={clearFilters}
                      className="w-full py-3 text-sm text-[#074089] hover:text-[#074089] font-semibold bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      {t('clearFilters')}
                    </button>
                  </div>
                </aside>
              )}

              {/* Products Grid */}
              <div className={`${showFiltersSection ? "flex-1" : "w-full"} catalog-results min-h-[calc(100vh-200px)]`}>
                {/* Toolbar */}
                <div className="catalog-toolbar bg-white p-4 rounded-lg mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <button
                      aria-expanded={showFilters} onClick={() => setShowFilters(value=>!value)}
                      className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#074089] text-white rounded-lg hover:bg-[#2C5BB4] transition-colors"
                    >
                      <SlidersHorizontal size={18} />
                      {t('filters')}
                    </button>
                    <span className="text-gray-600">
                      {t('foundProducts')} {filteredTotal} {t('productsWord')}
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
                        className="bg-blue-100 text-[#074089] px-3 py-1 rounded-full text-sm flex items-center gap-2"
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
                  {productsLoading ? <div role="status" className="py-16 text-center text-slate-600"><Loader2 className="animate-spin mx-auto mb-3 text-[#074089]" size={28}/>{language === 'ru' ? 'Загружаем оборудование…' : 'Loading equipment…'}</div> : productsError ? <div role="alert" className="p-6 rounded-xl border border-red-200 bg-red-50 text-red-800">{language === 'ru' ? 'Не удалось загрузить товары. Повторите поиск или позвоните нам: +992 93 333 96 39.' : 'Unable to load products. Search again or call +992 93 333 96 39.'}</div> : paginatedProducts.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
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
      </main>

      <Footer />
    </div>
  );
};

export default Catalog;
