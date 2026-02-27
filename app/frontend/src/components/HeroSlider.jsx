import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSlides } from '../hooks/useApi';
import { useLanguage } from '../context/LanguageContext';

const HeroSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { slides, loading } = useSlides();
  const { language } = useLanguage();

  useEffect(() => {
    if (slides.length === 0) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-200 rounded-2xl shadow-xl flex items-center justify-center">
          <Loader2 className="animate-spin text-[#074089]" size={48} />
        </div>
      </div>
    );
  }

  // Нет слайдов
  if (slides.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gradient-to-br from-[#074089] to-[#2C5BB4] rounded-2xl shadow-xl flex items-center justify-center">
          <div className="text-center text-white p-8">
            <h2 className="text-2xl md:text-4xl font-bold mb-4">Добро пожаловать в Tib Tekhnologiya</h2>
            <p className="text-lg opacity-90 mb-6">Профессиональное медицинское оборудование</p>
            <Link
              to="/catalog"
              className="inline-block bg-white text-[#074089] font-semibold px-8 py-3 rounded-lg transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              {language === 'ru' ? 'Смотреть каталог' : 'View Catalog'}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden bg-gray-900 rounded-2xl shadow-xl">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
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
              className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronLeft size={20} className="md:w-6 md:h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 md:p-3 rounded-full transition-all duration-300 hover:scale-110 border border-white/30"
            >
              <ChevronRight size={20} className="md:w-6 md:h-6" />
            </button>

            {/* Индикаторы */}
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
