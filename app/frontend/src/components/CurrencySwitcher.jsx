import React from 'react';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

const CurrencySwitcher = () => {
  const { currency, toggleCurrency } = useCurrency();
  const { language } = useLanguage();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
      title={language === 'ru' ? 'Переключить валюту' : 'Change currency'}
      aria-label={language === 'ru' ? `TJS / USD — сейчас ${currency}` : `TJS / USD — current ${currency}`}
      aria-pressed={currency === 'USD'}
    >
      <span className={currency === 'TJS' ? 'text-[#074089] font-bold' : 'text-slate-600'}>
        TJS
      </span>
      <span className="text-slate-500">/</span>
      <span className={currency === 'USD' ? 'text-[#074089] font-bold' : 'text-slate-600'}>
        USD
      </span>
    </button>
  );
};

export default CurrencySwitcher;
