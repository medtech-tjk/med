import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Trash2, Plus, Minus, ShoppingBag, MapPin, User, Phone, Check } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

const Cart = () => {
  const { formatPrice } = useCurrency();
  const { t, language, getLocalizedName } = useLanguage();

  // Храним сгруппированные товары с quantity
  const [cartItems, setCartItems] = useState([]);
  const [orderForm, setOrderForm] = useState({
    full_name: '',
    phone: '',
    address: '',
    email: '',
    organization: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const hasOnRequestItems = cartItems.some(item => item.price_on_request);

  // Функция для нормализации товаров из localStorage (группировка дубликатов)
  const normalizeCartItems = useCallback((rawCart) => {
    if (!rawCart || !Array.isArray(rawCart)) return [];

    const grouped = {};
    rawCart.forEach(item => {
      if (!item || !item.id) return;

      if (grouped[item.id]) {
        // Если товар уже есть, увеличиваем количество
        grouped[item.id].quantity += (item.quantity || 1);
      } else {
        // Добавляем новый товар с quantity
        grouped[item.id] = {
          id: item.id,
          name: item.name,
          name_en: item.name_en,
          slug: item.slug,
          price: item.price,
          price_on_request: item.price_on_request,
          brand: item.brand,
          image: item.image || item.main_image || item.mainImage,
          quantity: item.quantity || 1
        };
      }
    });

    return Object.values(grouped);
  }, []);

  // Загрузка корзины из localStorage
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
          const parsed = JSON.parse(savedCart);
          // Нормализуем данные (группируем дубликаты если есть)
          const normalized = normalizeCartItems(parsed);
          setCartItems(normalized);
          // Сохраняем нормализованные данные обратно
          localStorage.setItem('cart', JSON.stringify(normalized));
        }
      } catch (e) {
        console.error('Error loading cart:', e);
        setCartItems([]);
      }
    };

    loadCart();

    // Слушаем обновления корзины из других компонентов (но не от самой страницы корзины)
    const handleCartUpdate = (e) => {
      // Игнорируем события от этой же страницы
      if (e.detail?.source === 'cart-page') return;
      loadCart();
    };

    const handleStorageChange = () => {
      loadCart();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [normalizeCartItems]);

  // Сохранение корзины в localStorage (уже в нормализованном формате)
  const saveCart = useCallback((newItems) => {
    try {
      // Сохраняем как есть - массив объектов с quantity
      localStorage.setItem('cart', JSON.stringify(newItems));
      // Событие для обновления Header (но не вызываем перезагрузку на этой же странице)
      window.dispatchEvent(new CustomEvent('cartUpdated', { detail: { source: 'cart-page' } }));
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, []);

  // Увеличить количество товара
  const increaseQuantity = useCallback((productId) => {
    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.id === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
      saveCart(newItems);
      return newItems;
    });
  }, [saveCart]);

  // Уменьшить количество товара
  const decreaseQuantity = useCallback((productId) => {
    setCartItems(prev => {
      const newItems = prev.map(item =>
        item.id === productId
          ? { ...item, quantity: Math.max(1, item.quantity - 1) }
          : item
      );
      saveCart(newItems);
      return newItems;
    });
  }, [saveCart]);

  // Удалить товар из корзины
  const removeItem = useCallback((productId) => {
    setCartItems(prev => {
      const newItems = prev.filter(item => item.id !== productId);
      saveCart(newItems);
      toast({
        title: t('productRemoved'),
      });
      return newItems;
    });
  }, [saveCart, t]);

  // Подсчёт общей суммы
  const getTotal = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cartItems]);

  // Подсчёт общего количества товаров
  const getTotalCount = useCallback(() => {
    return cartItems.reduce((sum, item) => sum + item.quantity, 0);
  }, [cartItems]);

  // Отправка заказа
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    // Validation
    if (!orderForm.full_name.trim()) {
      toast({ title: t('enterName'), variant: 'destructive' });
      return;
    }
    if (!orderForm.phone.trim()) {
      toast({ title: t('enterPhone'), variant: 'destructive' });
      return;
    }
    if (!orderForm.address.trim()) {
      toast({ title: t('enterAddress'), variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const orderData = {
        ...orderForm,
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          price_on_request: item.price_on_request,
          quantity: item.quantity,
          brand: item.brand
        })),
        total: getTotal()
      };

      const response = await fetch(`${BACKEND_URL}/api/orders/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        setOrderSuccess(true);
        window.scrollTo(0, 0);

        toast({
          title: t('orderSent'),
          description: t('orderSentDesc'),
        });

        // Clear cart
        setCartItems([]);
        localStorage.setItem('cart', '[]');
        window.dispatchEvent(new Event('cartUpdated'));

        setOrderForm({
          full_name: '',
          phone: '',
          address: '',
          email: '',
          organization: '',
          message: ''
        });
        setShowCheckout(false);
      } else {
        throw new Error('Server error');
      }
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: t('orderError'),
        description: t('orderErrorDesc'),
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    setOrderForm({
      ...orderForm,
      [e.target.name]: e.target.value
    });
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder.png';
    if (imagePath.startsWith('http')) return imagePath;
    return `${BACKEND_URL}${imagePath}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header cartCount={getTotalCount()} />

      <div className="container mx-auto px-4 py-8 flex-1">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('cartTitle')}</h1>

        {orderSuccess ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check size={40} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('orderSent')}</h2>
            <p className="text-xl text-gray-600 mb-8 max-w-lg mx-auto">
              {language === 'ru'
                ? 'Спасибо за ваш заказ! Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей.'
                : 'Thank you for your order! Our manager will contact you shortly to confirm details.'}
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/catalog"
                className="bg-[#074089] hover:bg-[#2C5BB4] text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-xl transition-all"
              >
                {t('goToCatalog')}
              </Link>
            </div>
          </div>
        ) : cartItems.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('emptyCart')}</h2>
            <p className="text-gray-600 mb-6">{t('addProductsFromCatalog')}</p>
            <Link
              to="/catalog"
              className="inline-block bg-[#074089] hover:bg-[#2C5BB4] text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              {t('goToCatalog')}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-white rounded-xl shadow-md p-4 md:p-6 overflow-hidden">
                  <div className="flex gap-3 md:gap-6">
                    <img
                      src={getImageUrl(item.image)}
                      alt={item.name}
                      className="w-20 h-20 md:w-32 md:h-32 object-contain rounded-lg flex-shrink-0"
                      onError={(e) => { e.target.src = '/placeholder.png'; }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item.slug}`}
                            className="font-semibold text-sm md:text-lg text-gray-900 hover:text-[#074089] transition-colors line-clamp-2"
                          >
                            {getLocalizedName(item)}
                          </Link>
                          {item.brand && (
                            <p className="text-gray-600 text-xs md:text-sm mt-0.5">{item.brand}</p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 md:p-2 rounded-lg transition-all duration-200 flex-shrink-0 active:scale-95"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={item.quantity <= 1}
                            className={`p-1.5 md:p-2 rounded-lg transition-all duration-200 ${item.quantity <= 1
                              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                              : 'bg-gray-100 hover:bg-gray-200 text-gray-700 active:scale-95'
                              }`}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-bold text-base md:text-lg w-8 md:w-12 text-center">{item.quantity}</span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="p-1.5 md:p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all duration-200 text-gray-700 active:scale-95"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <div className="text-right flex-shrink-0">
                          {item.price_on_request ? (
                            <div className="text-sm md:text-base font-semibold text-[#074089]">
                              {language === 'ru' ? 'Цена по запросу' : 'Price on request'}
                            </div>
                          ) : (
                            <>
                              <div className="text-[10px] md:text-xs text-gray-500">{t('from')} {formatPrice(item.price)} × {item.quantity}</div>
                              <div className="text-lg md:text-2xl font-bold text-[#074089]">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              ))}
            </div>

            {/* Order Summary & Checkout */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
                {!showCheckout ? (
                  <>
                    <h2 className="text-xl font-bold mb-4">{t('total')}</h2>

                    {/* Total */}
                    <div className="border-t border-b border-gray-200 py-4 mb-6">
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-600">{t('products')}:</span>
                        <span className="font-semibold">{getTotalCount()} {t('items')}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold">{t('sum')}:</span>
                        <span className="text-2xl font-bold text-[#074089]">
                          {formatPrice(getTotal())}
                          {hasOnRequestItems && (
                            <span className="text-sm font-medium text-gray-500 ml-1">
                              {language === 'ru' ? ' + по запросу' : ' + on request'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowCheckout(true)}
                      className="w-full bg-[#074089] hover:bg-[#2C5BB4] text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center justify-center gap-2"
                    >
                      <ShoppingBag size={20} />
                      {t('checkout')}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold">{t('checkoutTitle')}</h2>
                      <button
                        onClick={() => setShowCheckout(false)}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        ← {t('back')}
                      </button>
                    </div>

                    {/* Total */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">{t('total')}:</span>
                        <span className="text-xl font-bold text-[#074089]">
                          {formatPrice(getTotal())}
                          {hasOnRequestItems && (
                            <span className="text-sm font-medium text-gray-500 ml-1">
                              {language === 'ru' ? ' + по запросу' : ' + on request'}
                            </span>
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmitOrder} className="space-y-4">
                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <User size={16} className="text-[#074089]" />
                          {t('fullName')} *
                        </label>
                        <input
                          type="text"
                          name="full_name"
                          value={orderForm.full_name}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089] focus:border-transparent transition-all"
                          placeholder="Иванов Иван Иванович"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <Phone size={16} className="text-[#074089]" />
                          {t('phone')} *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={orderForm.phone}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089] focus:border-transparent transition-all"
                          placeholder="+992 XX XXX XX XX"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                          <MapPin size={16} className="text-[#074089]" />
                          {t('address')} *
                        </label>
                        <input
                          type="text"
                          name="address"
                          value={orderForm.address}
                          onChange={handleInputChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#074089] focus:border-transparent transition-all"
                          placeholder="Город, улица, дом, квартира"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('email')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={orderForm.email}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BCDA5] focus:border-transparent transition-all"
                          placeholder="example@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('organization')}
                        </label>
                        <input
                          type="text"
                          name="organization"
                          value={orderForm.organization}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BCDA5] focus:border-transparent transition-all"
                          placeholder="Название организации"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          {t('comment')}
                        </label>
                        <textarea
                          name="message"
                          value={orderForm.message}
                          onChange={handleInputChange}
                          rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4BCDA5] focus:border-transparent transition-all resize-none"
                          placeholder="Дополнительная информация к заказу"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#4BCDA5] hover:bg-[#3ba88a] disabled:bg-gray-400 text-white font-bold py-4 rounded-lg transition-all duration-300 transform hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {isSubmitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            {t('submitting')}
                          </span>
                        ) : (
                          t('submit')
                        )}
                      </button>

                      <p className="text-xs text-gray-500 text-center mt-3">
                        {t('agreeToProcessing')}
                      </p>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Cart;
