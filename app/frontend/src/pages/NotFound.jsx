import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLanguage } from '../context/LanguageContext';

export default function NotFound() {
  const { language } = useLanguage();
  return <div className="min-h-screen flex flex-col"><Header/><main id="main-content" tabIndex={-1} className="flex-1 container mx-auto px-4 py-24 text-center"><p className="text-sm font-bold text-[#074089] mb-4">404</p><h1 className="text-3xl font-bold text-slate-900">{language === 'ru' ? 'Страница не найдена' : 'Page not found'}</h1><p className="mt-4 text-slate-600">{language === 'ru' ? 'Откройте каталог или вернитесь на главную.' : 'Browse the catalog or return to the homepage.'}</p><Link to="/catalog" className="inline-flex mt-8 px-6 py-3 bg-[#074089] text-white rounded-lg font-semibold">{language === 'ru' ? 'Перейти в каталог' : 'Browse catalog'}</Link></main><Footer/></div>;
}
