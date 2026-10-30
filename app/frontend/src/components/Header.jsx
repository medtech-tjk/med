import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, LayoutGrid, Info, Wrench, Home, ShoppingCart, Globe, Phone, Mail } from 'lucide-react';
import CurrencySwitcher from './CurrencySwitcher';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { readCart, cartQuantity } from '../lib/cart';

const Header = ({ cartCount = 0 }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [actualCartCount, setActualCartCount] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, toggleLanguage, t } = useLanguage();

  // Синхронизация корзины
  useEffect(() => {
    const updateCartCount = () => {
      setActualCartCount(cartQuantity(readCart()));
    };

    updateCartCount();
    window.addEventListener('storage', updateCartCount);

    const handleCartUpdate = () => updateCartCount();
    window.addEventListener('cartUpdated', handleCartUpdate);


    return () => {
      window.removeEventListener('storage', updateCartCount);
      window.removeEventListener('cartUpdated', handleCartUpdate);
    };
  }, [cartCount]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/catalog?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const displayCount = actualCartCount;

  useEffect(() => {
    setSearchQuery(new URLSearchParams(location.search).get('search') || '');
  }, [location.search]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">{language === 'ru' ? 'Перейти к содержимому' : 'Skip to content'}</a>
      <header className="site-header sticky top-0 z-50 bg-white border-b border-slate-200">
        {/* Main header */}
        <div className="container mx-auto px-4 py-2 md:py-3">
          <div className="header-layout flex flex-wrap items-center justify-between gap-3 xl:gap-6">
            {/* Logo */}
            <Link to="/" aria-label={language === 'ru' ? 'Tib Technology — главная' : 'Tib Technology — home'} className="flex items-center space-x-2 flex-shrink-0">
              <Logo className="w-8 h-8 sm:w-10 sm:h-10 text-[#074089]" />
              <span className="text-sm sm:text-xl font-bold tracking-tight text-[#074089]">Tib Technology</span>
            </Link>

            {/* Search - Expanded */}
            <form onSubmit={handleSearch} role="search" className="order-3 basis-full xl:order-none xl:basis-auto xl:flex-1 min-w-0">
              <div className="relative">
                <input
                  type="search"
                  maxLength={200}
                  aria-label={t('search')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('search')}
                  className="w-full px-4 py-2.5 md:py-3 pr-10 md:pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089] transition-all text-base shadow-sm"
                />
                <button
                  type="submit"
                  aria-label={language === 'ru' ? 'Найти оборудование' : 'Search equipment'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-gray-500 hover:text-[#074089] transition-colors"
                >
                  <Search size={22} className="md:w-6 md:h-6" />
                </button>
              </div>
            </form>

            {/* Desktop right side */}
            <div className="hidden xl:flex items-center gap-3">
              {/* Functional Links */}
              <div className="flex items-center gap-1">
                {/* Language Switcher */}
                <button
                  onClick={toggleLanguage}
                  className="flex items-center gap-1 px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  title={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
                  aria-label={language === 'ru' ? 'RU — Switch to English' : 'EN — Переключить на русский'}
                >
                  <Globe size={18} className="text-[#074089]" />
                  <span className="uppercase text-sm font-bold text-gray-700">{language}</span>
                </button>

                <CurrencySwitcher />
              </div>

            </div>

            {/* Mobile: Language + Currency */}
            <div className="xl:hidden flex items-center gap-1">
              <button
                onClick={toggleLanguage}
                aria-label={language === 'ru' ? 'RU — Switch to English' : 'EN — Переключить на русский'}
                className="flex items-center gap-0.5 px-2 py-1 rounded-lg text-gray-700 border border-gray-200"
              >
                <Globe size={14} className="text-[#074089]" />
                <span className="uppercase text-xs font-bold">{language}</span>
              </button>
              <CurrencySwitcher />
            </div>
          </div>
        </div>
        <nav aria-label={language === 'ru' ? 'Разделы сайта' : 'Site sections'} className="hidden xl:block border-t border-slate-100">
          <div className="container header-desktop-links flex items-center justify-between">
            <div className="flex items-center gap-8">
              {[['/',t('home')],['/catalog',t('catalog')],['/about',t('about')],['/services',t('services')]].map(([path,label]) => <Link key={path} to={path} aria-current={isActive(path) ? 'page' : undefined}>{label}</Link>)}
            </div>
            <div className="flex items-center gap-5 text-xs text-slate-600">
              <a href="tel:+992933339639" className="inline-flex items-center gap-2 whitespace-nowrap"><Phone size={14} aria-hidden="true" />+992 93 333 96 39</a>
              <a href="mailto:tjkmedtech@gmail.com" className="inline-flex items-center gap-2"><Mail size={14} aria-hidden="true" />tjkmedtech@gmail.com</a>
              <span className="whitespace-nowrap">{t('workingHours')}</span>
            </div>
          </div>
        </nav>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav aria-label={language === 'ru' ? 'Основная навигация' : 'Main navigation'} className="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.1)] safe-area-inset-bottom">
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
                <span className="absolute -top-0.5 -right-0.5 bg-red-700 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
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
