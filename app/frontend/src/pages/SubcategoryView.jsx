import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts, useCategorySpecs } from '../hooks/useApi';
import { ChevronRight, Loader2, Filter, X, SlidersHorizontal, PackageCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const SubcategoryView = () => {
  const { categorySlug, subcategorySlug } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState({});
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popular');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const [inStockOnly, setInStockOnly] = useState(false);
  const { language, t, getLocalizedName, getLocalizedDescription } = useLanguage();
  const [cart, setCart] = useState([]);

  // Загрузка категорий
  const { categories: catalogTree, loading: categoriesLoading } = useCategories();

  // Load cart from localStorage
  useEffect(() => {
    const loadCart = () => {
      const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCart(savedCart);
    };
    loadCart();
    window.addEventListener('cartUpdated', loadCart);
    return () => window.removeEventListener('cartUpdated', loadCart);
  }, []);

  // Прокрутка в начало
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug, subcategorySlug]);

  // Найти категории
  const category = useMemo(() =>
    catalogTree.find(cat => cat.slug === categorySlug),
    [catalogTree, categorySlug]
  );

  const subcategory = useMemo(() =>
    category?.children?.find(sub => sub.slug === subcategorySlug),
    [category, subcategorySlug]
  );

  // Получить фильтры для этой подкатегории из API
  const { specs: apiFilters } = useCategorySpecs(subcategorySlug, language);
  const filters = apiFilters || [];

  // Загрузка товаров
  const { products, loading: productsLoading } = useProducts({
    subcategory_id: subcategory?.id,
    brand: activeFilters.brand || undefined
  });

  // Получить уникальные бренды из товаров
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

  // Фильтрация товаров
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      // Фильтр по цене
      if (priceRange.min && product.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && product.price > parseFloat(priceRange.max)) return false;

      // Фильтр по наличию
      if (inStockOnly && product.in_stock === false) return false;

      // Фильтр по активным чекбоксам
      for (const [key, values] of Object.entries(activeFilters)) {
        if (key === 'brand' || key === 'price') continue;
        if (values && values.length > 0) {
          const productValue = product.specs?.[key] || product[key];
          if (productValue && !values.includes(productValue)) {
            return false;
          }
        }
      }

      return true;
    });
  }, [products, priceRange, activeFilters, inStockOnly]);

  // Сортировка товаров
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    switch (sortBy) {
      case 'price_asc':
        return sorted.sort((a, b) => (a.price || 0) - (b.price || 0));
      case 'price_desc':
        return sorted.sort((a, b) => (b.price || 0) - (a.price || 0));
      case 'name_asc':
        return sorted.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      case 'newest':
        return sorted.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // Пагинация
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(start, start + itemsPerPage);
  }, [sortedProducts, currentPage, itemsPerPage]);

  // Сброс страницы при изменении фильтров
  useEffect(() => {
    setCurrentPage(1);
  }, [activeFilters, priceRange, sortBy, itemsPerPage]);

  const handleFilterChange = (filterKey, value, isChecked) => {
    setActiveFilters(prev => {
      const current = prev[filterKey] || [];
      if (isChecked) {
        return { ...prev, [filterKey]: [...current, value] };
      } else {
        return { ...prev, [filterKey]: current.filter(v => v !== value) };
      }
    });
  };

  const handleSelectChange = (filterKey, value) => {
    setActiveFilters(prev => ({
      ...prev,
      [filterKey]: value || undefined
    }));
  };

  const clearFilters = () => {
    setActiveFilters({});
    setPriceRange({ min: '', max: '' });
  };

  const hasActiveFilters = Object.keys(activeFilters).some(k => {
    const v = activeFilters[k];
    return v && (Array.isArray(v) ? v.length > 0 : true);
  }) || priceRange.min || priceRange.max;

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

  if (!category || !subcategory) {
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
          <Link to={`/catalog/${category.slug}`} className="hover:text-[#074089]">{getLocalizedName(category)}</Link>
          <span>/</span>
          <span className="text-gray-900">{getLocalizedName(subcategory)}</span>
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{getLocalizedName(subcategory)}</h1>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} {t('productsWord')}
            </p>
          </div>

          {/* Filter buttons */}
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
              {hasActiveFilters && (
                <span className="bg-[#074089] text-white text-xs px-2 py-0.5 rounded-full">!</span>
              )}
            </button>
          </div>
        </div>

        {/* Subcategory Description */}
        {getLocalizedDescription(subcategory) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">{getLocalizedDescription(subcategory)}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-72 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} />
                  {t('filters')}
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={14} />
                    {t('reset')}
                  </button>
                )}
              </div>

              {/* Close button for mobile */}
              <button
                onClick={() => setShowFilters(false)}
                className="lg:hidden absolute top-4 right-4 text-gray-500"
              >
                <X size={24} />
              </button>

              {/* Dynamic Filters */}
              {filters.map((filter) => {
                // Преобразуем формат API к формату компонента
                const filterKey = filter.key;
                const filterLabel = filter.key;
                const filterOptions = filter.options || [];
                const isInput = filter.type === 'input';

                return (
                  <div key={filterKey} className="mb-6 border-b border-gray-100 pb-4 last:border-0">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {filterLabel}
                    </label>

                    {/* Select (для Бренд с type: input или с большим количеством опций) */}
                    {(isInput || filterOptions.length > 8) && (
                      <select
                        value={activeFilters[filterKey] || ''}
                        onChange={(e) => handleSelectChange(filterKey, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent text-sm"
                      >
                        <option value="">{t('all')}</option>
                        {filterKey === 'Бренд' ? (
                          // Для брендов показываем бренды из товаров + опции из фильтров
                          (() => {
                            const combined = [...brands, ...filterOptions];
                            const unique = new Map();
                            combined.forEach(opt => {
                              if (typeof opt !== 'string') return;
                              const trimmed = opt.trim();
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
                          })().map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))
                        ) : (
                          filterOptions.filter(opt => {
                            if (typeof opt !== 'string') return true;
                            const lower = opt.trim().toLowerCase();
                            return lower !== 'все бренды' && lower !== 'all brands' && lower !== 'all';
                          }).map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))
                        )}
                      </select>
                    )}

                    {/* Checkbox group (для типов, классов и т.д.) */}
                    {!isInput && filterOptions.length <= 8 && filterOptions.length > 0 && (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {filterOptions.filter(opt => {
                            if (typeof opt !== 'string') return true;
                            const lower = opt.trim().toLowerCase();
                            return lower !== 'все бренды' && lower !== 'all brands' && lower !== 'all';
                          }).map(option => (
                          <label key={option} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={activeFilters[filterKey]?.includes(option) || false}
                              onChange={(e) => handleFilterChange(filterKey, option, e.target.checked)}
                              className="w-4 h-4 text-[#074089] rounded focus:ring-[#074089]"
                            />
                            <span className="text-gray-700">{option}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Price filter */}
              <div className="mb-6 border-b border-gray-100 pb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('price')} (TJS)
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

              {/* Third level categories */}
              {subcategory.children && subcategory.children.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('types')}
                  </label>
                  <div className="space-y-1 max-h-64 overflow-y-auto">
                    {subcategory.children.map((child) => (
                      <Link
                        key={child.id}
                        to={`/catalog/${category.slug}/${subcategory.slug}/${child.slug}`}
                        className="block px-3 py-2 text-sm text-gray-600 hover:text-[#074089] hover:bg-gray-50 rounded-lg transition-colors"
                      >
                        {getLocalizedName(child)}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Third level categories grid */}
            {subcategory.children && subcategory.children.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold text-gray-900 mb-6">{t('types')}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {subcategory.children.map((child) => (
                    <Link
                      key={child.id}
                      to={`/catalog/${category.slug}/${subcategory.slug}/${child.slug}`}
                      className="group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-white"
                    >
                      <div className="relative h-32 md:h-40 overflow-hidden bg-gradient-to-br from-[#074089]/10 to-white">
                        {child.image ? (
                          <img
                            src={child.image}
                            alt={child.name}
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
                          {getLocalizedName(child)}
                        </h3>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Products Grid */}
            <section>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {t('products')} ({sortedProducts.length})
                </h2>

                {/* Sorting and Items per page */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Items per page */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 hidden sm:inline">{language === 'ru' ? 'Показать:' : 'Show:'}</span>
                    <select
                      value={itemsPerPage}
                      onChange={(e) => setItemsPerPage(Number(e.target.value))}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#074089] focus:border-transparent bg-white"
                    >
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </div>

                  {/* Sort */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#074089] focus:border-transparent bg-white"
                  >
                    <option value="popular">{language === 'ru' ? 'По популярности' : 'By popularity'}</option>
                    <option value="newest">{language === 'ru' ? 'Сначала новые' : 'Newest first'}</option>
                    <option value="price_asc">{language === 'ru' ? 'Цена ↑' : 'Price ↑'}</option>
                    <option value="price_desc">{language === 'ru' ? 'Цена ↓' : 'Price ↓'}</option>
                    <option value="name_asc">{language === 'ru' ? 'По названию' : 'By name'}</option>
                  </select>
                </div>
              </div>

              {productsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="animate-spin text-[#074089]" size={48} />
                </div>
              ) : paginatedProducts.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {paginatedProducts.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                      >
                        ←
                      </button>
                      <span className="px-4 py-2 text-sm text-gray-600">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
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
                    {hasActiveFilters
                      ? t('changeFilters')
                      : t('comingSoon')}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="mt-4 text-[#074089] hover:text-[#2C5BB4] font-medium"
                    >
                      {t('clearFilters')}
                    </button>
                  )}
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

export default SubcategoryView;
