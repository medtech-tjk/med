import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import ProductCard from '../components/ProductCard';
import { useProducts, useCategories } from '../hooks/useApi';
import { ChevronRight, Loader2, Package, Building2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useLanguage } from '../context/LanguageContext';

const BrandPage = () => {
    const { brandSlug } = useParams();
    const brandName = decodeURIComponent(brandSlug || '');
    const { t, language, getLocalizedName } = useLanguage();

    const [cart, setCart] = useState([]);
    const [sortBy, setSortBy] = useState('popular');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(20);
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Fetch products by brand
    const { products, loading: productsLoading } = useProducts({ brand: brandName });
    const { categories } = useCategories();

    // Get unique categories from brand's products
    const brandCategories = React.useMemo(() => {
        const categoryIds = [...new Set(products.map(p => p.category_id))];
        return categories.filter(c => categoryIds.includes(c.id));
    }, [products, categories]);

    // Filter products by selected category
    const filteredProducts = React.useMemo(() => {
        let filtered = [...products];

        if (selectedCategory) {
            filtered = filtered.filter(p => p.category_id === selectedCategory);
        }

        // Sort
        if (sortBy === 'price-asc') {
            filtered.sort((a, b) => {
                if (a.price_on_request && !b.price_on_request) return 1;
                if (!a.price_on_request && b.price_on_request) return -1;
                return a.price - b.price;
            });
        } else if (sortBy === 'price-desc') {
            filtered.sort((a, b) => {
                if (a.price_on_request && !b.price_on_request) return 1;
                if (!a.price_on_request && b.price_on_request) return -1;
                return b.price - a.price;
            });
        } else if (sortBy === 'new') {
            filtered.sort((a, b) => (b.is_new ? 1 : 0) - (a.is_new ? 1 : 0));
        }

        return filtered;
    }, [products, selectedCategory, sortBy]);

    // Pagination
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddToCart = (product) => {
        setCart([...cart, product]);
        toast({
            title: language === 'ru' ? 'Товар добавлен в корзину' : 'Product added to cart',
            description: getLocalizedName(product),
        });
    };

    // Brand logos mapping (можно расширить)
    const brandLogos = {
        'Karl Storz': 'https://www.karlstorz.com/cps/rde/xbcr/karlstorz_assets/ASSETS/2000001/KARL_STORZ_Logo.png',
        'B. Braun': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/13/B._Braun_logo.svg/200px-B._Braun_logo.svg.png',
        'Hamilton Medical': 'https://www.hamilton-medical.com/dam/jcr:2d41e9e5-adb5-4e99-a80c-e3fb3c6e4a3a/Hamilton-Medical-Logo.png',
        'Fujifilm': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/66/Fujifilm_logo.svg/200px-Fujifilm_logo.svg.png',
        'Roche': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/Roche_Logo.svg/200px-Roche_Logo.svg.png',
        'Mindray': 'https://www.mindray.com/content/dam/xpace/en/about/brand-center/logo/mindray-logo-1.png',
        'Samsung': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/24/Samsung_Logo.svg/200px-Samsung_Logo.svg.png',
    };

    const brandLogo = Object.keys(brandLogos).find(key =>
        brandName.toLowerCase().includes(key.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Header />
            <FloatingCart />

            <div className="container mx-auto px-4 py-8 flex-1">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                    <Link to="/" className="hover:text-[#074089]">{language === 'ru' ? 'Главная' : 'Home'}</Link>
                    <span>/</span>
                    <Link to="/catalog" className="hover:text-[#074089]">{language === 'ru' ? 'Каталог' : 'Catalog'}</Link>
                    <span>/</span>
                    <span className="text-gray-900">{brandName}</span>
                </div>

                {/* Brand Header */}
                <div className="bg-white rounded-xl shadow-md p-6 md:p-8 mb-8">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        {/* Brand Info */}
                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                                {brandName}
                            </h1>
                            <p className="text-gray-600 mb-4">
                                {language === 'ru'
                                    ? `Медицинское оборудование от ${brandName}. Найдено ${products.length} товаров.`
                                    : `Medical equipment from ${brandName}. Found ${products.length} products.`
                                }
                            </p>

                            {/* Category filter chips */}
                            {brandCategories.length > 1 && (
                                <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                    <button
                                        onClick={() => setSelectedCategory(null)}
                                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${!selectedCategory
                                            ? 'bg-[#074089] text-white'
                                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                            }`}
                                    >
                                        {language === 'ru' ? 'Все категории' : 'All categories'}
                                    </button>
                                    {brandCategories.map(cat => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedCategory === cat.id
                                                ? 'bg-[#074089] text-white'
                                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                                }`}
                                        >
                                            {getLocalizedName(cat)}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Toolbar */}
                <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <span className="text-gray-600">
                        {language === 'ru' ? 'Найдено' : 'Found'} {filteredProducts.length} {language === 'ru' ? 'товаров' : 'products'}
                    </span>
                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089]"
                    >
                        <option value="popular">{language === 'ru' ? 'По популярности' : 'By popularity'}</option>
                        <option value="new">{language === 'ru' ? 'Новинки' : 'New arrivals'}</option>
                        <option value="price-asc">{language === 'ru' ? 'Сначала дешевые' : 'Price: Low to High'}</option>
                        <option value="price-desc">{language === 'ru' ? 'Сначала дорогие' : 'Price: High to Low'}</option>
                    </select>
                </div>

                {/* Products Grid */}
                {productsLoading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="animate-spin text-[#074089]" size={48} />
                    </div>
                ) : paginatedProducts.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                            {paginatedProducts.map((product) => (
                                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex justify-center items-center gap-2 flex-wrap">
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

                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    let pageNum;
                                    if (totalPages <= 5) {
                                        pageNum = i + 1;
                                    } else if (currentPage <= 3) {
                                        pageNum = i + 1;
                                    } else if (currentPage >= totalPages - 2) {
                                        pageNum = totalPages - 4 + i;
                                    } else {
                                        pageNum = currentPage - 2 + i;
                                    }

                                    return (
                                        <button
                                            key={pageNum}
                                            onClick={() => setCurrentPage(pageNum)}
                                            className={`px-4 py-2 rounded-lg font-semibold transition-all ${currentPage === pageNum
                                                ? 'bg-[#074089] text-white'
                                                : 'bg-white text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}

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
                        <Package size={64} className="mx-auto text-gray-300 mb-4" />
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {language === 'ru' ? 'Товары не найдены' : 'No products found'}
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {language === 'ru'
                                ? `К сожалению, товары бренда "${brandName}" пока не добавлены в каталог.`
                                : `Unfortunately, products from "${brandName}" are not yet in our catalog.`
                            }
                        </p>
                        <Link
                            to="/catalog"
                            className="inline-block bg-[#074089] hover:bg-[#2C5BB4] text-white font-semibold px-6 py-3 rounded-lg transition-colors"
                        >
                            {language === 'ru' ? 'Перейти в каталог' : 'Go to catalog'}
                        </Link>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default BrandPage;
