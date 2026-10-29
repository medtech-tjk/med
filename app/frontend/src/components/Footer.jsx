import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Instagram, Send } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import Logo from './Logo';
import { COMPANY } from '../lib/company';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="site-footer text-white mt-16 pb-24 xl:pb-0">
      <div className="container mx-auto px-4 py-12">
        <div className="footer-grid items-start">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Logo className="w-12 h-12" variant="footer" />
              <span className="text-xl font-bold text-white">Tib Technology</span>
            </div>
            <p className="footer-brand-copy">{language === 'ru' ? 'Медицинское оборудование, поставка и сервис в Таджикистане.' : 'Medical equipment, supply and service in Tajikistan.'}</p>
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
            <h2 className="text-white font-bold mb-4 text-lg">{t('catalogTitle')}</h2>
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
            <h2 className="text-white font-bold mb-4 text-lg">{t('contactsTitle')}</h2>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Phone size={18} className="mt-0.5 text-white/70 flex-shrink-0" />
                <div>
                  <a href="tel:+992933339639" className="hover:text-white/80 transition-colors font-medium underline decoration-white/40 hover:decoration-white underline-offset-4">
                    +992 93 333 96 39
                  </a>
                  <div className="text-xs text-white/80 mt-1">{t('workingHours')}</div>
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
                <a href={COMPANY.mapUrl} target="_blank" rel="noopener noreferrer" className="hover:text-white/80 transition-colors underline decoration-white/40 hover:decoration-white underline-offset-4">
                  {COMPANY.address[language] || COMPANY.address.ru}
                </a>
              </li>
            </ul>
          </div>

          {/* Social media */}
          <div>
            <h2 className="text-white font-bold mb-4 text-lg">{t('socialTitle')}</h2>
            <div className="flex gap-3 mb-6">
              <a
                href="https://www.instagram.com/medtech.tj/"
                aria-label="Instagram — medtech.tj"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button w-11 h-11 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center"
              >
                <Instagram size={22} />
              </a>
              <a
                href="https://t.me/TibTekhnologiya"
                aria-label="Telegram — Tib Technology"
                target="_blank"
                rel="noopener noreferrer"
                className="ui-button w-11 h-11 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center"
              >
                <Send size={22} />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-white/20">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-white/80">
              © {new Date().getFullYear()} Tib Technology. {t('allRightsReserved')}
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 pt-4 border-t border-white/10">
            <p className="text-xs text-white/75 leading-relaxed text-center md:text-left">
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
