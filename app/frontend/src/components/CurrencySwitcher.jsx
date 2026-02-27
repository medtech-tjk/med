import React from 'react';
import { useCurrency } from '../context/CurrencyContext';

const CurrencySwitcher = () => {
  const { currency, toggleCurrency } = useCurrency();

  return (
    <button
      onClick={toggleCurrency}
      className="flex items-center gap-1 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm font-medium"
      title="Переключить валюту"
    >
      <span className={currency === 'TJS' ? 'text-[#074089] font-bold' : 'text-gray-400'}>
        TJS
      </span>
      <span className="text-gray-300">/</span>
      <span className={currency === 'USD' ? 'text-[#074089] font-bold' : 'text-gray-400'}>
        USD
      </span>
    </button>
  );
};

export default CurrencySwitcher;
