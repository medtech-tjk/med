import React, { useEffect, useRef } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Building2, Heart, Award, Users, Globe2, TrendingUp, CheckCircle, Phone, Mail } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { aboutTranslations } from '../translations/pagesTranslations';

const About = () => {
  const { t, language } = useLanguage();
  const trans = aboutTranslations[language];
  const heroRef = useRef(null);
  const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

  // Parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const scrolled = window.scrollY;
        heroRef.current.style.transform = `translateY(${scrolled * 0.5}px)`;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Parallax */}
      <div className="relative h-[70vh] overflow-hidden">
        <div
          ref={heroRef}
          className="absolute inset-0 bg-gradient-to-br from-[#074089] via-[#2C5BB4] to-[#052c5e]"
          style={{ height: '120%' }}
        >
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative h-full flex items-center justify-center text-white z-10 container mx-auto px-4">
          <div className="text-center max-w-4xl">
            <div className="mb-6 opacity-0 animate-fadeIn">
              <Building2 size={80} className="mx-auto mb-4 drop-shadow-lg" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 opacity-0 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Tib Technology
            </h1>
            <p className="text-xl md:text-2xl opacity-90 opacity-0 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
              {trans.subtitle}
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-20 relative z-20">
        {/* About Card */}
        <section className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-16 border border-gray-100">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-3 bg-gradient-to-br from-[#074089]/20 to-[#074089]/5 rounded-2xl">
                <Building2 className="text-[#074089]" size={36} />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{trans.aboutTitle}</h2>
            </div>

            <div className="space-y-6 text-gray-700 text-lg leading-relaxed">
              <p className="first-letter:text-5xl first-letter:font-bold first-letter:text-[#074089] first-letter:mr-2 first-letter:float-left">
                {trans.companyDesc1}
              </p>

              <p>
                {trans.companyDesc2}
              </p>
            </div>

            {/* Timeline */}
            <div className="mt-12 p-8 bg-gradient-to-r from-[#074089]/5 via-[#074089]/10 to-transparent rounded-2xl border border-[#074089]/20">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-white rounded-xl shadow-sm">
                  <Award className="text-[#074089]" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{trans.historyTitle}</h3>
              </div>
              <div className="space-y-8 relative before:absolute before:left-10 before:top-0 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-[#074089] before:to-transparent">
                <div className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#074089] to-[#2C5BB4] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                    2007
                  </div>
                  <div className="flex-1 pt-3 bg-white/50 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-gray-700">
                      {trans.timeline2007}
                    </p>
                  </div>
                </div>
                <div className="flex gap-6 items-start relative">
                  <div className="flex-shrink-0 w-20 h-20 bg-gradient-to-br from-[#2C5BB4] to-[#052c5e] rounded-2xl flex items-center justify-center text-white text-2xl font-bold shadow-lg transform hover:scale-105 transition-transform">
                    2018
                  </div>
                  <div className="flex-1 pt-3 bg-white/50 p-4 rounded-xl backdrop-blur-sm">
                    <p className="text-gray-700">
                      {trans.timeline2018}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-[#074089]/20 to-[#074089]/5 rounded-xl">
                  <TrendingUp className="text-[#074089]" size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">{trans.activitiesTitle}</h3>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  trans.activity1,
                  trans.activity2,
                  trans.activity3,
                  trans.activity4
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-5 bg-gradient-to-br from-gray-50 to-white rounded-xl hover:shadow-md hover:from-[#074089]/5 hover:to-white transition-all border border-gray-100">
                    <CheckCircle size={24} className="text-[#074089] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Clients Section - Modern Cards */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#074089]/20 to-[#074089]/5 rounded-2xl">
                <Users className="text-[#074089]" size={40} />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{trans.ourClients}</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {trans.clientsDesc}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { name: 'РНЦССХ', abbr: 'РНЦ ССХ', color: 'from-blue-500 to-blue-600' },
                { name: 'Истиклол', abbr: 'МЦ', color: 'from-green-500 to-green-600' },
                { name: 'Министерство здравоохранения', abbr: 'МЗиСЗН', color: 'from-purple-500 to-purple-600' },
                { name: 'JICA', abbr: 'JICA', color: 'from-red-500 to-red-600' },
                { name: 'GIZ', abbr: 'GIZ', color: 'from-orange-500 to-orange-600' },
                { name: 'KfW', abbr: 'KfW', color: 'from-teal-500 to-teal-600' },
                { name: 'Фонд Ага Хана', abbr: 'AKF', color: 'from-indigo-500 to-indigo-600' },
                { name: 'Центр трансплантологии', abbr: 'ЦТ', color: 'from-pink-500 to-pink-600' }
              ].map((client, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:shadow-xl transition-all duration-300 group transform hover:-translate-y-2 border border-gray-100">
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${client.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                    <span className="text-white font-bold text-sm">{client.abbr}</span>
                  </div>
                  <p className="text-xs text-center text-gray-700 font-semibold">{client.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Suppliers Section - Premium Logo Cards */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="p-3 bg-gradient-to-br from-[#074089]/20 to-[#074089]/5 rounded-2xl">
                <Globe2 className="text-[#074089]" size={40} />
              </div>
              <h2 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{trans.ourSuppliers}</h2>
            </div>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {trans.suppliersDesc}
            </p>
          </div>

          <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-6">
              {[
                {
                  name: 'Fujifilm',
                  country: language === 'ru' ? 'Япония' : 'Japan',
                  url: 'https://www.fujifilm.com/fhc/',
                  logo: `${API_URL}/uploads/logos/fujifilm.png`
                },
                {
                  name: 'B. Braun',
                  country: language === 'ru' ? 'Германия' : 'Germany',
                  url: 'https://www.bbraun.com/',
                  logo: `${API_URL}/uploads/logos/bbraun.png`
                },
                {
                  name: 'Hamilton Medical',
                  country: language === 'ru' ? 'Швейцария' : 'Switzerland',
                  url: 'https://www.hamilton-medical.com/',
                  logo: `${API_URL}/uploads/logos/hamilton.png`
                },
                {
                  name: 'Karl Storz',
                  country: language === 'ru' ? 'Германия' : 'Germany',
                  url: 'https://www.karlstorz.com/',
                  logo: `${API_URL}/uploads/logos/karlstorz.png`
                },
                {
                  name: 'Roche Diagnostics',
                  country: language === 'ru' ? 'Швейцария' : 'Switzerland',
                  url: 'https://www.roche.com/',
                  logo: `${API_URL}/uploads/logos/roche.png`
                },
                {
                  name: 'KLS Martin',
                  country: language === 'ru' ? 'Германия' : 'Germany',
                  url: 'https://www.klsmartin.com/',
                  logo: `${API_URL}/uploads/logos/klsmartin.png`
                },
                {
                  name: 'Mindray',
                  country: language === 'ru' ? 'КНР' : 'China',
                  url: 'https://www.mindray.com/',
                  logo: `${API_URL}/uploads/logos/mindray.png`
                },
                {
                  name: 'Samsung Medison',
                  country: language === 'ru' ? 'Южная Корея' : 'South Korea',
                  url: 'https://www.samsunghealthcare.com/',
                  logo: `${API_URL}/uploads/logos/samsung.png`
                }
              ].map((supplier, index) => (
                <a
                  key={index}
                  href={supplier.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 hover:shadow-2xl transition-all duration-300 group cursor-pointer transform hover:-translate-y-2 border border-gray-100 hover:border-[#074089]/40"
                >
                  <div className="w-28 h-20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden bg-white p-3 shadow-sm">
                    <img
                      src={supplier.logo}
                      alt={supplier.name}
                      className="max-w-full max-h-full object-contain filter grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full bg-gradient-to-br from-[#074089]/20 to-[#2C5BB4]/10 rounded flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-[#074089] font-bold text-sm text-center">{supplier.name}</span>
                    </div>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 text-center group-hover:text-[#074089] transition-colors">{supplier.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{supplier.country}</p>
                  <span className="mt-2 text-xs text-[#074089] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {language === 'ru' ? 'Перейти на сайт →' : 'Visit website →'}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section - Compact redesign */}
        <section className="bg-gradient-to-r from-[#074089] to-[#2C5BB4] rounded-xl shadow-lg p-6 md:p-8 text-white mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">{trans.ctaTitle}</h2>
              <p className="text-white/80 text-sm md:text-base max-w-md">
                {trans.ctaDesc}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="tel:+992918611259"
                className="flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#074089] transition-all text-sm"
              >
                <Phone size={18} />
                <span>+992 91 861 12 59</span>
              </a>
              <a
                href="mailto:info@medtech.tj"
                className="flex items-center gap-2 bg-transparent border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-[#074089] transition-all text-sm"
              >
                <Mail size={18} />
                <span>info@medtech.tj</span>
              </a>
            </div>
          </div>
        </section>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default About;
