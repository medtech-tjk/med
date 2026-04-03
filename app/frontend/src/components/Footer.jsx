import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-gradient-to-b from-[#074089] to-[#052c5e] text-white mt-16 pb-20 md:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 items-start">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo className="w-12 h-12" variant="footer" />
              <span className="text-xl font-bold text-white">Tib Technology</span>
            </div>
            <div className="space-y-2 mt-4">
              <Link to="/about" className="block text-sm text-white/90 hover:text-white transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                {t('aboutCompany')}
              </Link>
              <Link to="/services" className="block text-sm text-white/90 hover:text-white transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                {t('ourServices')}
              </Link>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">{t('catalogTitle')}</h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/catalog" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {t('allProducts')}
                </Link>
              </li>
              <li>
                <Link to="/catalog/ultrasound" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {t('ultrasound')}
                </Link>
              </li>
              <li>
                <Link to="/catalog/flexible-endoscopy" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {t('flexibleEndoscopy')}
                </Link>
              </li>
              <li>
                <Link to="/catalog/anesthesiology" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {t('anesthesiology')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">{t('contactsTitle')}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-white/70 flex-shrink-0" />
                <div>
                  <a href="tel:+992933339639" className="hover:text-white/80 transition-colors font-medium underline decoration-white/40 hover:decoration-white underline-offset-4">
                    +992 93 333 96 39
                  </a>
                  <div className="text-xs text-white/60 mt-1">{t('workingHours')}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={18} className="mt-0.5 text-white/70 flex-shrink-0" />
                <div className="space-y-1">
                  <a href="mailto:tjkmedtech@gmail.com" className="hover:text-white/80 transition-colors block underline decoration-white/40 hover:decoration-white underline-offset-4">
                    tjkmedtech@gmail.com
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 text-white/70 flex-shrink-0" />
                <a href="https://yandex.tj/maps/-/CLh8iRyb" target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {language === 'ru' ? 'г. Душанбе, улица Нисора Мухаммада, 5/5' : 'Dushanbe, Nisora Muhammad street, 5/5'}
                </a>
              </li>
            </ul>
          </div>

          {/* Social media */}
          <div>
            <h3 className="text-white font-bold mb-4 text-lg">{t('socialTitle')}</h3>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/medtech.tj/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
              >
                <Instagram size={22} />
              </a>
              <a
                href="https://t.me/TibTekhnologiya"
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 bg-white/20 hover:bg-white/30 rounded-xl flex items-center justify-center transition-all duration-300 transform hover:scale-110 hover:-translate-y-1"
              >
                <Send size={22} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/60">
              © {new Date().getFullYear()} Tib Technology. {t('allRightsReserved')}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/40 leading-relaxed text-center md:text-left">
              {language === 'ru'
                ? '* Сайт носит информационный характер и не является публичной офертой. Стоимость товаров и услуг зависит от комплектации, текущего курса валют и прочих факторов. Наличие и подробные характеристики уточняйте у представителей компании.'
                : '* This website is for informational purposes only and is not a public offer. Prices depend on configuration, current exchange rates and other factors. Please check availability and detailed specifications with company representatives.'
              }
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
