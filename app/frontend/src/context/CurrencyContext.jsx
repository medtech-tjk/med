import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState('TJS');
  const [exchangeRate, setExchangeRate] = useState(11.2); // Default


  // Fetch exchange rate from API
  const fetchExchangeRate = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings`);
      if (response.ok) {
        const data = await response.json();
        setExchangeRate(data.usd_to_tjs_rate || 11.2);
      }
    } catch (err) {
      console.error('Failed to fetch exchange rate, using default');
    }
  };

  useEffect(() => {
    fetchExchangeRate();
  }, []);

  // Load currency preference from localStorage
  useEffect(() => {
    const savedCurrency = localStorage.getItem('currency');
    if (savedCurrency && (savedCurrency === 'TJS' || savedCurrency === 'USD')) {
      setCurrency(savedCurrency);
    }
  }, []);

  // Save currency preference to localStorage
  useEffect(() => {
    localStorage.setItem('currency', currency);
  }, [currency]);

  const formatPrice = (price, old_price = null) => {
    // Handle null/undefined/0 prices
    if (!price || price === 0) return currency === 'TJS' ? '0 с' : '$0';

    // Convert price based on selected currency
    const convertedPrice = currency === 'USD'
      ? price / exchangeRate
      : price;

    const formatted = new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: 0,
      maximumFractionDigits: currency === 'USD' ? 2 : 0,
    }).format(convertedPrice);

    return currency === 'TJS' ? `${formatted} с` : `$${formatted}`;
  };

  const toggleCurrency = () => {
    setCurrency(prev => prev === 'TJS' ? 'USD' : 'TJS');
  };

  // Function to manually refresh the exchange rate (useful after admin updates)
  const refreshExchangeRate = () => {
    fetchExchangeRate();
  };

  return (
    <CurrencyContext.Provider value={{
      currency,
      setCurrency,
      formatPrice,
      toggleCurrency,
      exchangeRate,
      refreshExchangeRate
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};
