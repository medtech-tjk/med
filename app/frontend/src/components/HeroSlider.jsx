import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2, ArrowUpRight, Phone, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSlides } from '../hooks/useApi';
import { useLanguage } from '../context/LanguageContext';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [paused, setPaused] = useState(false);
  const { slides, loading } = useSlides();
  const { language } = useLanguage();

  useEffect(() => {
    if (slides.length < 2 || paused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length, paused]);

  const nextSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    if (slides.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Загрузка
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="relative h-[480px] sm:h-[440px] lg:h-[500px] overflow-hidden bg-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
          <Loader2 className="animate-spin text-[#074089]" size={48} />
        </div>
      </div>
    );
  }

  // Нет слайдов
  if (slides.length === 0) {
    return (
      <section className="container mx-auto px-4 py-6" aria-labelledby="hero-title">
        <div className="hero-panel min-h-[480px] sm:min-h-[440px] lg:min-h-[500px] flex items-center rounded-2xl border border-blue-100 bg-[#eef4fc] overflow-hidden">
          <div className="p-6 sm:p-10 lg:p-14 flex flex-col items-start justify-center">
            <p className="text-xs font-semibold tracking-[0.14em] uppercase text-[#074089] mb-5">Tib Technology · {language === 'ru' ? 'Таджикистан' : 'Tajikistan'}</p>
            <h1 id="hero-title" className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.15] text-[#102f57] max-w-2xl">
              {language === 'ru' ? 'Медицинское оборудование для вашей практики' : 'Medical equipment for your practice'}
            </h1>
            <p className="mt-5 text-base sm:text-lg leading-relaxed text-slate-600 max-w-xl">
              {language === 'ru' ? 'Подберём оборудование для клиники, диагностического центра и лаборатории. Поможем с выбором, поставкой и сервисом.' : 'Find equipment for your clinic, diagnostic centre or laboratory. Get help with selection, supply and service.'}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/catalog" className="inline-flex items-center gap-3 bg-[#074089] text-white font-semibold px-5 py-3 rounded-lg hover:bg-[#2C5BB4] transition-colors">
                {language === 'ru' ? 'Каталог оборудования' : 'Equipment catalog'}<ArrowUpRight size={20} />
              </Link>
              <a href="tel:+992933339639" className="inline-flex items-center gap-2 px-4 py-3 text-[#074089] font-semibold rounded-lg border border-blue-200 bg-white hover:bg-blue-50"><Phone size={18}/>{language === 'ru' ? 'Консультация' : 'Contact us'}</a>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div role="region" aria-roledescription="carousel" aria-label={language === 'ru' ? 'Предложения' : 'Highlights'} onMouseEnter={() => setPaused(true)} onFocusCapture={() => setPaused(true)} className="relative h-[480px] sm:h-[440px] lg:h-[500px] overflow-hidden bg-gray-900 rounded-2xl shadow-xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            aria-hidden={index !== currentSlide}
            inert={index !== currentSlide ? true : undefined}
            className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
          >
            {/* Адаптивные изображения */}
            <picture className="absolute inset-0">
              {/* Мобильное изображение */}
              {slide.image_mobile && (
                <source
                  media="(max-width: 767px)"
                  srcSet={slide.image_mobile}
                />
              )}
              {/* Планшетное изображение */}
              {slide.image_tablet && (
                <source
                  media="(max-width: 1023px)"
                  srcSet={slide.image_tablet}
                />
              )}
              {/* Десктопное изображение (по умолчанию) */}
              <img
                src={slide.image_desktop || slide.image}
                loading={index === currentSlide ? 'eager' : 'lazy'}
                fetchPriority={index === currentSlide ? 'high' : 'low'}
                decoding="async"
                alt={slide.title}
                className="w-full h-full object-cover"
                style={{
                  transform: index === currentSlide ? 'scale(1)' : 'scale(1.05)',
                  transition: 'transform 8s ease-out'
                }}
              />
            </picture>

            {/* Затемнение */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

            {/* Контент */}
            <div className="relative h-full container mx-auto px-4 flex items-center justify-center">
              <div className="max-w-4xl text-center text-white space-y-4 md:space-y-6 animate-fadeIn px-4">
                <h1 className="text-2xl md:text-4xl lg:text-5xl xl:text-6xl font-bold leading-tight">
                  {language === 'en' && slide.title_en ? slide.title_en : slide.title}
                </h1>
                {(slide.subtitle || slide.subtitle_en) && (
                  <p className="text-sm md:text-lg lg:text-xl text-gray-200 max-w-2xl mx-auto">
                    {language === 'en' && slide.subtitle_en ? slide.subtitle_en : slide.subtitle}
                  </p>
                )}
                {slide.cta_link && slide.cta_text && (
                  <Link
                    to={slide.cta_link}
                    className="inline-block bg-[#074089] hover:bg-[#2C5BB4] text-white font-semibold px-6 md:px-8 py-2 md:py-3 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl mt-2 md:mt-4 text-sm md:text-base"
                  >
                    {language === 'en' && slide.cta_text_en ? slide.cta_text_en : slide.cta_text}
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Навигация - только если больше 1 слайда */}
        {slides.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              aria-label={language === 'ru' ? 'Предыдущий слайд' : 'Previous slide'}
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button
              onClick={nextSlide}
              aria-label={language === 'ru' ? 'Следующий слайд' : 'Next slide'}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>

            {/* Индикаторы */}
            <button type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? (language === 'ru' ? 'Продолжить слайд-шоу' : 'Play slideshow') : (language === 'ru' ? 'Приостановить слайд-шоу' : 'Pause slideshow')} className="absolute bottom-4 right-4 text-white p-3 rounded-full bg-black/40">
              {paused ? <Play size={18}/> : <Pause size={18}/>}
            </button>
            <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 md:gap-3">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`transition-all duration-300 rounded-full ${index === currentSlide
                    ? 'w-8 md:w-10 h-2 md:h-2.5 bg-[#074089]'
                    : 'w-2 md:w-2.5 h-2 md:h-2.5 bg-white/50 hover:bg-white/75'
                    }`}
                  aria-label={`Перейти к слайду ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HeroSlider;
