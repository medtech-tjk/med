import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  ru: {
    // Header
    search: 'Поиск...',
    catalog: 'Каталог',
    about: 'О нас',
    services: 'Услуги',
    cart: 'Корзина',
    home: 'Главная',

    // Categories
    allProducts: 'Все товары',
    filters: 'Фильтры',
    reset: 'Сбросить',
    brand: 'Бренд',
    allBrands: 'Все бренды',
    price: 'Цена',
    from: 'от',
    to: 'до',
    inStockOnly: 'Только в наличии',
    subcategories: 'Подкатегории',
    types: 'Типы',
    products: 'Товары',
    noProducts: 'Товаров пока нет',
    changeFilters: 'Попробуйте изменить параметры фильтрации',
    comingSoon: 'Товары скоро появятся в этой категории',
    clearFilters: 'Очистить фильтры',
    moreFilters: 'Еще фильтры',
    hideFilters: 'Скрыть фильтры',
    itemsPerPage: 'Товаров на странице',
    items20: '20 товаров',
    items50: '50 товаров',
    items100: '100 товаров',
    page: 'Страница',
    previous: 'Предыдущая',
    next: 'Следующая',

    // Product
    addToCart: 'Добавить в корзину',
    inStock: 'В наличии',
    onRequest: 'По заявке',
    new: 'Новинка',
    hit: 'Хит',
    details: 'Подробнее',

    // Cart
    cartTitle: 'Корзина',
    emptyCart: 'Корзина пуста',
    addProductsFromCatalog: 'Добавьте товары из каталога',
    goToCatalog: 'Перейти в каталог',
    total: 'Итого',
    items: 'шт.',
    sum: 'Сумма',
    checkout: 'Оформить заявку',
    back: 'Назад',

    // Checkout form
    checkoutTitle: 'Оформление заявки',
    fullName: 'ФИО',
    phone: 'Номер телефона',
    address: 'Адрес доставки',
    email: 'Email (необязательно)',
    organization: 'Организация (необязательно)',
    comment: 'Комментарий',
    submit: 'Отправить заявку',
    submitting: 'Отправка...',
    agreeToProcessing: 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных',

    // Messages
    productAdded: 'Товар добавлен в корзину',
    productRemoved: 'Товар удалён из корзины',
    orderSent: 'Заявка отправлена!',
    orderSentDesc: 'Мы свяжемся с вами в ближайшее время',
    orderError: 'Ошибка отправки',
    orderErrorDesc: 'Попробуйте позже или свяжитесь с нами по телефону',
    enterName: 'Введите ФИО',
    enterPhone: 'Введите номер телефона',
    enterAddress: 'Введите адрес доставки',

    // Footer
    catalogTitle: 'Каталог',
    contactsTitle: 'Контакты',
    socialTitle: 'Мы в соцсетях',
    workingHours: 'Пн-Пт: 9:00-18:00',
    allRightsReserved: 'Все права защищены.',
    companyDesc: 'Профессиональное медицинское оборудование от ведущих мировых производителей',
    aboutCompany: 'О компании',
    ourServices: 'Наши услуги',
    allProducts2: 'Все товары',

    // Home page
    popularProducts: 'Популярные товары',
    popularProductsDesc: 'Рекомендуем обратить внимание',
    foundProducts: 'Найдено',
    productsWord: 'товаров',
    sortBy: 'Сортировка',
    byPopularity: 'По популярности',
    newItems: 'Новинки',
    priceAsc: 'Цена: по возрастанию',
    priceDesc: 'Цена: по убыванию',
    perPage: 'на странице',

    // Why us section
    whyUs: 'Почему мы?',
    qualityEquipment: 'Качественное оборудование',
    qualityEquipmentDesc: 'Только проверенные бренды и производители',
    fastDelivery: 'Быстрая доставка',
    fastDeliveryDesc: 'Доставка по всему Таджикистану в кратчайшие сроки',
    support247: 'Поддержка 24/7',
    support247Desc: 'Квалифицированная помощь в любое время',

    // Category description
    aboutSection: 'О разделе',
    searchResults: 'Результаты поиска',
    searchResultsFor: 'По вашему запросу',
    noResultsFound: 'К сожалению, ничего не найдено',
    tryChangingQuery: 'товары не найдены. Попробуйте изменить запрос или оставьте заявку, и мы найдем этот товар для вас.',
    submitRequest: 'Оставить заявку на товар',

    // Categories names
    ultrasound: 'Ультразвуковая диагностика',
    flexibleEndoscopy: 'Гибкая эндоскопия',
    anesthesiology: 'Анестезиология и реанимация',
    surgical: 'Хирургическое оборудование',

    // Misc
    categoryNotFound: 'Категория не найдена',
    backToCatalog: 'Вернуться в каталог',
    all: 'Все',
  },
  en: {
    // Header
    search: 'Search...',
    catalog: 'Catalog',
    about: 'About',
    services: 'Services',
    cart: 'Cart',
    home: 'Home',

    // Categories
    allProducts: 'All products',
    filters: 'Filters',
    reset: 'Reset',
    brand: 'Brand',
    allBrands: 'All brands',
    price: 'Price',
    from: 'from',
    to: 'to',
    inStockOnly: 'In stock only',
    subcategories: 'Subcategories',
    types: 'Types',
    products: 'Products',
    noProducts: 'No products yet',
    changeFilters: 'Try changing filter parameters',
    comingSoon: 'Products coming soon to this category',
    clearFilters: 'Clear filters',
    moreFilters: 'More filters',
    hideFilters: 'Hide filters',
    itemsPerPage: 'Items per page',
    items20: '20 items',
    items50: '50 items',
    items100: '100 items',
    page: 'Page',
    previous: 'Previous',
    next: 'Next',

    // Product
    addToCart: 'Add to cart',
    inStock: 'In stock',
    onRequest: 'On request',
    new: 'New',
    hit: 'Popular',
    details: 'Details',

    // Cart
    cartTitle: 'Cart',
    emptyCart: 'Cart is empty',
    addProductsFromCatalog: 'Add products from catalog',
    goToCatalog: 'Go to catalog',
    total: 'Total',
    items: 'pcs.',
    sum: 'Sum',
    checkout: 'Checkout',
    back: 'Back',

    // Checkout form
    checkoutTitle: 'Checkout',
    fullName: 'Full Name',
    phone: 'Phone Number',
    address: 'Delivery Address',
    email: 'Email (optional)',
    organization: 'Organization (optional)',
    comment: 'Comment',
    submit: 'Submit Order',
    submitting: 'Submitting...',
    agreeToProcessing: 'By clicking the button, you agree to the processing of personal data',

    // Messages
    productAdded: 'Product added to cart',
    productRemoved: 'Product removed from cart',
    orderSent: 'Order submitted!',
    orderSentDesc: 'We will contact you shortly',
    orderError: 'Submission error',
    orderErrorDesc: 'Please try later or contact us by phone',
    enterName: 'Enter your name',
    enterPhone: 'Enter phone number',
    enterAddress: 'Enter delivery address',

    // Footer
    catalogTitle: 'Catalog',
    contactsTitle: 'Contacts',
    socialTitle: 'Follow Us',
    workingHours: 'Mon-Fri: 9:00-18:00',
    allRightsReserved: 'All rights reserved.',
    companyDesc: 'Professional medical equipment from world-leading manufacturers',
    aboutCompany: 'About Company',
    ourServices: 'Our Services',
    allProducts2: 'All Products',

    // Home page
    popularProducts: 'Popular Products',
    popularProductsDesc: 'We recommend paying attention',
    foundProducts: 'Found',
    productsWord: 'products',
    sortBy: 'Sort by',
    byPopularity: 'By popularity',
    newItems: 'New arrivals',
    priceAsc: 'Price: low to high',
    priceDesc: 'Price: high to low',
    perPage: 'per page',

    // Why us section
    whyUs: 'Why Us?',
    qualityEquipment: 'Quality Equipment',
    qualityEquipmentDesc: 'Only verified brands and manufacturers',
    fastDelivery: 'Fast Delivery',
    fastDeliveryDesc: 'Delivery throughout Tajikistan in the shortest time',
    support247: '24/7 Support',
    support247Desc: 'Qualified assistance at any time',

    // Category description
    aboutSection: 'About section',
    searchResults: 'Search Results',
    searchResultsFor: 'For your request',
    noResultsFound: 'Unfortunately, nothing found',
    tryChangingQuery: 'products not found. Try changing the query or leave a request and we will find this product for you.',
    submitRequest: 'Submit product request',

    // Categories names
    ultrasound: 'Ultrasound Diagnostics',
    flexibleEndoscopy: 'Flexible Endoscopy',
    anesthesiology: 'Anesthesiology and Resuscitation',
    surgical: 'Surgical Equipment',

    // Misc
    categoryNotFound: 'Category not found',
    backToCatalog: 'Back to catalog',
    all: 'All',
  }
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('language');
    return saved || 'ru';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
    document.documentElement.lang = language;
  }, [language]);

  const t = (key) => {
    return translations[language]?.[key] || translations['ru'][key] || key;
  };

  // Функция для получения локализованного названия из объекта с name и name_en
  const getLocalizedName = (item) => {
    if (!item) return '';
    if (language === 'en' && item.name_en) {
      return item.name_en;
    }
    return item.name || '';
  };

  // Функция для получения локализованного описания из объекта с description и description_en
  const getLocalizedDescription = (item) => {
    if (!item) return '';
    if (language === 'en' && item.description_en) {
      return item.description_en;
    }
    return item.description || '';
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'ru' ? 'en' : 'ru');
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      toggleLanguage,
      t,
      getLocalizedName,
      getLocalizedDescription
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageContext;
