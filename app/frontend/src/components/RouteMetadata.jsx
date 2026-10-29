import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

// Keep shared head state correct across SPA navigation. Product/category titles
// continue to be managed by their existing page components.
export default function RouteMetadata() {
  const { pathname } = useLocation();
  const { language } = useLanguage();
  useEffect(() => {
    const url = `https://medtech.tj${pathname === '/' ? '/' : pathname}`;
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', url);
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', url);
    let robots = document.querySelector('meta[name="robots"]');
    if (!robots) { robots = document.createElement('meta'); robots.name = 'robots'; document.head.appendChild(robots); }
    robots.content = /^\/(admin|cart)(\/|$)/.test(pathname) ? 'noindex, nofollow' : 'index, follow';
    const titles = {
      '/': language === 'ru' ? 'Tib Technology — Медицинское оборудование в Душанбе' : 'Tib Technology — Medical equipment in Dushanbe',
      '/about': language === 'ru' ? 'О компании — Tib Technology' : 'About us — Tib Technology',
      '/services': language === 'ru' ? 'Наши услуги — Tib Technology' : 'Our services — Tib Technology',
      '/cart': language === 'ru' ? 'Корзина — Tib Technology' : 'Cart — Tib Technology',
    };
    if (titles[pathname]) {
      document.title = titles[pathname];
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', titles[pathname]);
      document.querySelector('meta[name="description"]')?.setAttribute('content', language === 'ru' ? 'Медицинское оборудование, подбор, поставка и сервис в Таджикистане. Tib Technology, Душанбе, улица Академика Акобира Адхамова, 11/5. +992 93 333 96 39.' : 'Medical equipment, selection, supply and service in Tajikistan. Tib Technology, 11/5 Academician Akobir Adhamov Street, Dushanbe. +992 93 333 96 39.');
    }
  }, [pathname, language]);
  return null;
}
