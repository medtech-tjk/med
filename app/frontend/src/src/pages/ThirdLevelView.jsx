import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useCategories, useProducts } from '../hooks/useApi';
import { Loader2, Filter, X, SlidersHorizontal, PackageCheck } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const ThirdLevelView = () => {
  const { categorySlug, subcategorySlug, subSubcategorySlug } = useParams();
  const [showFilters, setShowFilters] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('popular');
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [currentPage, setCurrentPage] = useState(1);
  const { language, t, getLocalizedName, getLocalizedDescription } = useLanguage();
  const [cart, setCart] = useState([]);

  // Загрузка категорий из API
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

  // Прокрутка в начало при загрузке
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [categorySlug, subcategorySlug, subSubcategorySlug]);

  // Найти категории
  const category = useMemo(() =>
    catalogTree.find(cat => cat.slug === categorySlug),
    [catalogTree, categorySlug]
  );

  const subcategory = useMemo(() =>
    category?.children?.find(sub => sub.slug === subcategorySlug),
    [category, subcategorySlug]
  );

  const thirdLevel = useMemo(() =>
    subcategory?.children?.find(child => child.slug === subSubcategorySlug),
    [subcategory, subSubcategorySlug]
  );

  // Загрузка товаров
  const { products, loading: productsLoading } = useProducts({
    subcategory_id: thirdLevel?.id || subcategory?.id,
    brand: selectedBrand || undefined
  });

  // Получить уникальные бренды
  const brands = useMemo(() => {
    const uniqueBrands = [...new Set(products.map(p => p.brand).filter(Boolean))];
    return uniqueBrands.sort();
  }, [products]);

  // Фильтрация
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      if (priceRange.min && product.price < parseFloat(priceRange.min)) return false;
      if (priceRange.max && product.price > parseFloat(priceRange.max)) return false;
      if (inStockOnly && product.in_stock === false) return false;
      return true;
    });
  }, [products, priceRange, inStockOnly]);

  const clearFilters = () => {
    setSelectedBrand('');
    setPriceRange({ min: '', max: '' });
    setInStockOnly(false);
  };

  const hasActiveFilters = selectedBrand || priceRange.min || priceRange.max || inStockOnly;

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
  }, [selectedBrand, priceRange, inStockOnly, sortBy, itemsPerPage]);

  if (categoriesLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <Loader2 className="animate-spin text-[#074089] mx-auto" size={48} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!category || !subcategory) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Категория не найдена</h1>
          <Link to="/catalog" className="text-[#074089] hover:text-[#2C5BB4]">
            Вернуться в каталог
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const currentName = getLocalizedName(thirdLevel) || getLocalizedName(subcategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <FloatingCart cartCount={cart.length} />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-6 flex-wrap">
          <Link to="/" className="hover:text-[#074089]">Главная</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-[#074089]">Каталог</Link>
          <span>/</span>
          <Link to={`/catalog/${category.slug}`} className="hover:text-[#074089]">{getLocalizedName(category)}</Link>
          <span>/</span>
          <Link to={`/catalog/${category.slug}/${subcategory.slug}`} className="hover:text-[#074089]">{getLocalizedName(subcategory)}</Link>
          {thirdLevel && (
            <>
              <span>/</span>
              <span className="text-gray-900">{getLocalizedName(thirdLevel)}</span>
            </>
          )}
        </div>

        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {currentName}
            </h1>
            <p className="text-gray-600 mt-1">
              {filteredProducts.length} {language === 'ru' ? (filteredProducts.length === 1 ? 'товар' : 'товаров') : 'products'}
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
              {language === 'ru' ? 'Фильтры' : 'Filters'}
              {hasActiveFilters && (
                <span className="bg-[#074089] text-white text-xs px-2 py-0.5 rounded-full">!</span>
              )}
            </button>
          </div>
        </div>

        {/* Third Level or Subcategory Description */}
        {(getLocalizedDescription(thirdLevel) || getLocalizedDescription(subcategory)) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-8">
            <p className="text-gray-700 leading-relaxed">{getLocalizedDescription(thirdLevel) || getLocalizedDescription(subcategory)}</p>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-64 flex-shrink-0 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <Filter size={18} />
                  Фильтры
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
                  >
                    <X size={14} />
                    Сбросить
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

              {/* Brand Filter */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Бренд
                  </label>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent"
                  >
                    <option value="">Все бренды</option>
                    {brands.map(brand => (
                      <option key={brand} value={brand}>{brand}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Price Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цена
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="От"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    placeholder="До"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                    className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#074089] focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* In Stock Filter */}
              <div className="mb-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => setInStockOnly(e.target.checked)}
                    className="w-4 h-4 text-[#074089] rounded focus:ring-[#074089]"
                  />
                  <span className="text-sm text-gray-700">Только в наличии</span>
                </label>
              </div>

              {/* Sibling categories */}
              {subcategory.children && subcategory.children.length > 1 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Другие типы
                  </label>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {subcategory.children.map((sibling) => (
                      <Link
                        key={sibling.id}
                        to={`/catalog/${category.slug}/${subcategory.slug}/${sibling.slug}`}
                        className={`block px-3 py-2 text-sm rounded-lg transition-colors ${sibling.slug === subSubcategorySlug
                          ? 'bg-[#074089]/10 text-[#074089] font-medium'
                          : 'text-gray-600 hover:text-[#074089] hover:bg-gray-50'
                          }`}
                      >
                        {sibling.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Sorting and Items per page */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {language === 'ru' ? 'Товары' : 'Products'} ({sortedProducts.length})
              </h2>

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
                <p className="text-gray-900 text-lg font-semibold mb-2">{language === 'ru' ? 'Товаров пока нет' : 'No products yet'}</p>
                <p className="text-gray-500">
                  {hasActiveFilters
                    ? (language === 'ru' ? 'Попробуйте изменить параметры фильтрации' : 'Try changing filter parameters')
                    : (language === 'ru' ? 'Товары скоро появятся в этой категории' : 'Products will appear in this category soon')}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="mt-4 text-[#074089] hover:text-[#2C5BB4] font-medium"
                  >
                    {language === 'ru' ? 'Сбросить фильтры' : 'Clear filters'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ThirdLevelView;
