import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LayoutGrid, Info, Wrench, Home, ShoppingCart, Globe, Phone, Mail } from 'lucide-react';
import CurrencySwitcher from './CurrencySwitcher';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

const Header = ({ cartCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actualCartCount, setActualCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  // Синхронизация корзины
  useEffect(() => {
    const updateCartCount = () => {
      const cart = localStorage.getItem('cart');
      if (cart) {
        const items = JSON.parse(cart);
        setActualCartCount(items.length);
      } else {
        setActualCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);

    const interval = setInterval(updateCartCount, 500);

    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', handleCartUpdate);
      clearInterval(interval);
    };
  }, [cartCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const displayCount = cartCount > 0 ? cartCount : actualCartCount;

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <header className="sticky top-0 z-50 bg-white shadow-md">
        {/* Top bar - Desktop only */}
        <div className="hidden md:block bg-gradient-to-r from-[#074089] to-[#2C5BB4] text-white py-2">
          <div className="container mx-auto px-4 flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <a href="tel:+992918611259" className="hover:opacity-80 transition-opacity flex items-center gap-1.5">
                <Phone size={14} /> +992 91 861 12 59
              </a>
              <a href="mailto:info@medtech.tj" className="hover:opacity-80 transition-opacity flex items-center gap-1.5">
                <Mail size={14} /> info@medtech.tj
              </a>
            </div>
            <div>{t('workingHours')}</div>
          </div>
        </div>

        {/* Main header */}
        <div className="container mx-auto px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-4 md:gap-8">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
              <Logo className="w-9 h-9 md:w-11 md:h-11 text-[#074089]" />
              <span className="text-lg md:text-2xl font-bold text-[#074089] hidden sm:block">Tib Technology</span>
            </Link>

            {/* Search - Expanded */}
            <form onSubmit={handleSearch} className="flex-1 max-w-3xl">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full px-4 py-2.5 md:py-3 pr-10 md:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089] transition-all text-base shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#074089] transition-colors"
                >
                  <Search size={22} className="md:w-6 md:h-6" />
                </button>
              </div>
            </form>

            {/* Desktop right side */}
            <div className="hidden md:flex items-center gap-3">
              {/* Catalog Button - Moved Here */}
              <Link
                to="/catalog"
                className="flex items-center gap-2 px-5 py-2.5 bg-[#074089] hover:bg-[#2C5BB4] text-white font-semibold rounded-lg transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              >
                <LayoutGrid size={20} />
                <span>{t('catalog')}</span>
              </Link>

              {/* Functional Links */}
              <div className="flex items-center gap-1 border-l border-gray-200 pl-3 ml-1">
                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
                >
                  <Globe size={18} className="text-[#074089]" />
                  <span className="uppercase text-sm font-bold text-gray-700">{language}</span>
                </button>

                <CurrencySwitcher />
              </div>

              <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                <Link to="/about" className="px-3 py-2 hover:bg-gray-100 rounded-lg hover:text-[#074089] transition-colors">
                  {t('about')}
                </Link>
                <Link to="/services" className="px-3 py-2 hover:bg-gray-100 rounded-lg hover:text-[#074089] transition-colors">
                  {t('services')}
                </Link>
              </div>
            </div>

            {/* Mobile: Language + Currency */}
            <div className="md:hidden flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-gray-700 border border-gray-200"
              >
                <Globe size={14} className="text-[#074089]" />
                <span className="uppercase text-xs font-bold">{language}</span>
              </button>
              <CurrencySwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-4 relative max-w-md mx-auto">
          {/* Главная */}
          <Link
            to="/"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[50px] ${isActive('/') && location.pathname === '/'
              ? 'text-[#074089]'
              : 'text-gray-500 hover:text-[#074089]'
              }`}
          >
            <Home size={22} strokeWidth={location.pathname === '/' ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 font-medium">{t('home')}</span>
          </Link>

          {/* Каталог */}
          <Link
            to="/catalog"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[50px] ${isActive('/catalog')
              ? 'text-[#074089]'
              : 'text-gray-500 hover:text-[#074089]'
              }`}
          >
            <LayoutGrid size={22} strokeWidth={isActive('/catalog') ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 font-medium">{t('catalog')}</span>
          </Link>

          {/* Корзина - центральная кнопка */}
          <Link
            to="/cart"
            className="relative flex flex-col items-center justify-center -mt-5"
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${isActive('/cart')
              ? 'bg-[#2C5BB4]'
              : 'bg-[#074089]'
              }`}>
              <ShoppingCart size={24} className="text-white" />
              {displayCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                  {displayCount > 9 ? '9+' : displayCount}
                </span>
              )}
            </div>
            <span className="text-[10px] mt-0.5 font-medium text-[#074089]">{t('cart')}</span>
          </Link>

          {/* О нас */}
          <Link
            to="/about"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[50px] ${isActive('/about')
              ? 'text-[#074089]'
              : 'text-gray-500 hover:text-[#074089]'
              }`}
          >
            <Info size={22} strokeWidth={isActive('/about') ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 font-medium">{t('about')}</span>
          </Link>

          {/* Услуги */}
          <Link
            to="/services"
            className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl transition-all min-w-[50px] ${isActive('/services')
              ? 'text-[#074089]'
              : 'text-gray-500 hover:text-[#074089]'
              }`}
          >
            <Wrench size={22} strokeWidth={isActive('/services') ? 2.5 : 2} />
            <span className="text-[10px] mt-0.5 font-medium">{t('services')}</span>
          </Link>
        </div>
      </nav>
    </>
  );
};

export default Header;
