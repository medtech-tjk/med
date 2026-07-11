import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

const ProductCard = ({ product }) => {
  const { formatPrice } = useCurrency();
  const { language, t, getLocalizedName } = useLanguage();

  const handleAddToCart = () => {
    // Получаем текущую корзину
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');

    // Проверяем, есть ли уже такой товар в корзине
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Увеличиваем количество
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + 1;
    } else {
      // Добавляем новый товар
      cart.push({
        id: product.id,
        name: product.name,
        name_en: product.name_en,
        slug: product.slug,
        price: product.price,
        price_on_request: product.price_on_request,
        brand: product.brand,
        image: product.main_image || product.mainImage,
        quantity: 1
      });
    }

    // Сохраняем
    localStorage.setItem('cart', JSON.stringify(cart));

    // Уведомляем Header об обновлении
    window.dispatchEvent(new Event('cartUpdated'));

    // Показываем уведомление
    toast({
      title: t('productAdded'),
      description: getLocalizedName(product),
    });
  };

  const productName = getLocalizedName(product);

  return (
    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full">
      {/* Image container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#074089]/10 to-white h-48 md:h-56 flex-shrink-0">
        <Link to={`/product/${product.slug}`}>
          <img
            src={product.main_image || product.mainImage || '/placeholder.png'}
            alt={productName}
            className="w-full h-full object-contain transform transition-transform duration-500 group-hover:scale-110"
            onError={(e) => { e.target.src = '/placeholder.png'; }}
          />
        </Link>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {!!product.is_new && (
            <span className="bg-[#074089] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {t('new')}
            </span>
          )}
          {!!product.is_popular && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
              {t('hit')}
            </span>
          )}
        </div>

        {/* Quick view button */}
        <Link
          to={`/product/${product.slug}`}
          className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
        >
          <div className="bg-white text-[#074089] px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transform -translate-y-4 group-hover:translate-y-0 transition-transform duration-300 text-sm">
            <Eye size={16} />
            {t('details')}
          </div>
        </Link>
      </div>

      {/* Content */}
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <Link
          to={`/product/${product.slug}`}
          className="block font-semibold text-gray-900 hover:text-[#074089] transition-colors line-clamp-2 text-sm md:text-base min-h-[2.5rem]"
        >
          {productName}
        </Link>

        <div className="h-5 mt-1">
          {product.brand && (
            <Link
              to={`/brand/${encodeURIComponent(product.brand)}`}
              className="text-xs text-gray-500 hover:text-[#074089] transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              {product.brand}
            </Link>
          )}
        </div>

        {/* Spacer to push price + stock to bottom */}
        <div className="mt-auto pt-2">
          {/* Price and action */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div>
              {product.price_on_request ? (
                <div className="text-sm md:text-base font-semibold text-[#074089]">
                  {language === 'ru' ? 'Цена по запросу' : 'Price on request'}
                </div>
              ) : (
                <>
                  <div className="text-xs text-gray-500">{t('from')}</div>
                  <div className="text-lg md:text-xl text-gray-900">{formatPrice(product.price)}</div>
                </>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-[#074089] hover:bg-[#2C5BB4] text-white p-2 md:p-3 rounded-lg transition-all duration-300 transform hover:scale-110 shadow-md hover:shadow-xl active:scale-95"
              title={t('addToCart')}
            >
              <ShoppingCart size={18} />
            </button>
          </div>

          {/* Stock indicator */}
          <div className={`mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg ${product.in_stock !== false ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <div className={`w-2 h-2 rounded-full ${product.in_stock !== false ? 'bg-[#074089]' : 'bg-orange-500'} animate-pulse`} />
            <span className={`text-xs font-medium ${product.in_stock !== false ? 'text-[#074089]' : 'text-orange-700'}`}>
              {product.in_stock !== false ? t('inStock') : t('onRequest')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
