import { readCart } from '../lib/cart';
import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Check, ArrowUpRight } from 'lucide-react';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

const ProductCard = ({ product }) => {
  const { formatPrice } = useCurrency();
  const { language, t, getLocalizedName } = useLanguage();
  const [added, setAdded] = useState(false);
  const resetTimer = useRef();
  useEffect(() => () => clearTimeout(resetTimer.current), []);
  const productName = getLocalizedName(product);
  const handleAddToCart = () => {
    const cart = readCart();
    const item = cart.find(item => item.id === product.id);
    if (item) item.quantity = (Number(item.quantity) || 1) + 1;
    else cart.push({id:product.id,name:product.name,name_en:product.name_en,slug:product.slug,price:product.price,price_on_request:product.price_on_request,brand:product.brand,image:product.main_image || product.mainImage,quantity:1});
    localStorage.setItem('cart',JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));
    setAdded(true);
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(()=>setAdded(false),1600);
    toast({title:t('productAdded'),description:productName});
  };
  return <article className="product-card">
    <Link to={`/product/${product.slug}`} className="product-card-image" aria-label={productName}>
      <img src={product.main_image || product.mainImage || '/placeholder.svg'} alt="" loading="lazy" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/placeholder.svg';}} />
      <div className="absolute top-3 left-3 flex gap-2">
        {product.is_new && <span className="bg-[#074089] text-white text-[11px] font-semibold px-2 py-1 rounded-md">{t('new')}</span>}
        {product.is_popular && <span className="bg-orange-50 text-orange-800 text-[11px] font-semibold px-2 py-1 rounded-md">{t('hit')}</span>}
      </div>
      <ArrowUpRight size={18} className="absolute right-3 bottom-3 text-[#074089]" aria-hidden="true"/>
    </Link>
    <div className="product-card-body">
      <div className="product-card-brand">{product.brand ? <Link to={`/brand/${encodeURIComponent(product.brand)}`}>{product.brand}</Link> : <span>Tib Technology</span>}</div>
      <Link to={`/product/${product.slug}`} className="product-card-title">{productName}</Link>
      <div className="mt-auto pt-2 border-t border-slate-100">
        <div className="min-h-[60px] flex flex-col justify-center">
          {product.price_on_request ? <p className="text-base font-semibold text-[#074089]">{language === 'ru' ? 'Цена по запросу' : 'Price on request'}</p> : <>
            {product.old_price > product.price && <del className="text-xs text-slate-500">{formatPrice(product.old_price)}</del>}
            <p className="product-card-price">{formatPrice(product.price)}</p>
          </>}
        </div>
        <div className="product-status mb-4" data-stock={product.in_stock !== false}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" aria-hidden="true"/>
          {product.in_stock !== false ? t('inStock') : t('onRequest')}
        </div>
        <button type="button" onClick={handleAddToCart} data-added={added} className="ui-button product-card-action" aria-label={`${t('addToCart')}: ${productName}`}>
          {added ? <Check size={17} aria-hidden="true"/> : <ShoppingCart size={17} aria-hidden="true"/>}
          <span aria-live="polite">{added ? (language === 'ru' ? 'Добавлено' : 'Added') : t('addToCart')}</span>
        </button>
      </div>
    </div>
  </article>;
};
export default ProductCard;
