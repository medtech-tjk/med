import { sanitizeDescription } from '../lib/sanitize';
import { readCart } from '../lib/cart';
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingCart from '../components/FloatingCart';
import { ShoppingCart, ChevronLeft, ChevronRight, Minus, Plus, Phone, FileText, Check, Package, Truck, ExternalLink, Loader2, Play } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { useCurrency } from '../context/CurrencyContext';
import { useLanguage } from '../context/LanguageContext';


const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { formatPrice } = useCurrency();
  const { language, t, getLocalizedName, getLocalizedDescription } = useLanguage();

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [tabMotion, setTabMotion] = useState(false);
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);

  const API_URL = '';
  useEffect(() => {setCurrentImageIndex(0);setQuantity(1);setActiveTab('description');setTabMotion(false);},[slug]);

  // Синхронизация корзины
  useEffect(() => {
    const updateCartCount = () => {
      setCartCount(readCart().length);
    };

    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    window.addEventListener('storage', updateCartCount);

    return () => {
      window.removeEventListener('cartUpdated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, []);

  // Загрузка категорий для breadcrumbs
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/api/categories/`);
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        }
      } catch (err) {
        console.error('Error loading categories');
      }
    };
    fetchCategories();
  }, [API_URL]);

  // Прокрутка в начало
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  // Загрузка продукта
  useEffect(() => {
    const controller = new AbortController();
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_URL}/api/products/slug/${slug}`,{signal:controller.signal});
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        } else {
          setProduct(null);
        }
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error('Error loading product:', err);
        setProduct(null);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
    return () => controller.abort();
  }, [slug, API_URL]);

  // Найти категорию и подкатегорию для breadcrumbs
  const findCategoryInfo = () => {
    if (!product || !categories.length) return { category: null, subcategory: null };

    for (const cat of categories) {
      if (cat.id === product.category_id) {
        const sub = cat.subcategories?.find(s => s.id === product.subcategory_id);
        return { category: cat, subcategory: sub };
      }
    }
    return { category: null, subcategory: null };
  };

  const { category, subcategory } = findCategoryInfo();

  // Установка title, meta description и JSON-LD для SEO
  useEffect(() => {
    if (product) {
      const name = getLocalizedName(product);
      const title = `${name} — купить в Душанбе | Tib Technology`;
      const desc = product.description 
        ? product.description.replace(/<[^>]*>?/gm, '').substring(0, 160) 
        : `${name} — купить медицинское оборудование в Таджикистане. Tib Technology, Душанбе.`;
      document.title = title;
      
      // Meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = "description";
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = desc;
      
      // Open Graph
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (ogTitle) ogTitle.content = title;
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (ogDesc) ogDesc.content = desc;

      // Canonical URL
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement('link');
        canonical.rel = 'canonical';
        document.head.appendChild(canonical);
      }
      canonical.href = `https://medtech.tj/product/${product.slug}`;

      // JSON-LD structured data (Schema.org Product)
      let jsonLd = document.querySelector('#product-jsonld');
      if (!jsonLd) {
        jsonLd = document.createElement('script');
        jsonLd.id = 'product-jsonld';
        jsonLd.type = 'application/ld+json';
        document.head.appendChild(jsonLd);
      }

      const mainImage = product.main_image 
        ? (product.main_image.startsWith('http') ? product.main_image : `${API_URL}${product.main_image}`)
        : '';

      const structuredData = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": name,
        "description": desc,
        "image": mainImage,
        "brand": product.brand ? { "@type": "Brand", "name": product.brand } : undefined,
        "sku": product.sku || product.id,
        "offers": !product.price_on_request && Number.isFinite(Number(product.price)) && Number(product.price) > 0 ? {
          "@type": "Offer",
          "url": `https://medtech.tj/product/${product.slug}`,
          "priceCurrency": "TJS",
          "price": product.price || 0,
          "availability": product.in_stock !== false 
            ? "https://schema.org/InStock" 
            : "https://schema.org/OutOfStock",
          "seller": {
            "@type": "Organization",
            "name": "Tib Technology"
          },
        } : undefined
      };

      jsonLd.textContent = JSON.stringify(structuredData);

      // BreadcrumbList JSON-LD for product pages
      let breadcrumbJsonLd = document.querySelector('#product-breadcrumb-jsonld');
      if (!breadcrumbJsonLd) {
        breadcrumbJsonLd = document.createElement('script');
        breadcrumbJsonLd.id = 'product-breadcrumb-jsonld';
        breadcrumbJsonLd.type = 'application/ld+json';
        document.head.appendChild(breadcrumbJsonLd);
      }
      const breadcrumbItems = [
        { "@type": "ListItem", "position": 1, "name": "Главная", "item": "https://medtech.tj/" },
        { "@type": "ListItem", "position": 2, "name": "Каталог", "item": "https://medtech.tj/catalog" }
      ];
      if (category) {
        breadcrumbItems.push({ "@type": "ListItem", "position": 3, "name": getLocalizedName(category), "item": `https://medtech.tj/catalog/${category.slug}` });
      }
      if (subcategory) {
        breadcrumbItems.push({ "@type": "ListItem", "position": 4, "name": getLocalizedName(subcategory), "item": `https://medtech.tj/catalog/${category?.slug}/${subcategory.slug}` });
      }
      breadcrumbItems.push({ "@type": "ListItem", "position": breadcrumbItems.length + 1, "name": name });
      breadcrumbJsonLd.textContent = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": breadcrumbItems
      });
    }
    
    return () => {
      document.title = "Tib Technology — Медицинское оборудование";
      // Clean up JSON-LD
      const jsonLd = document.querySelector('#product-jsonld');
      if (jsonLd) jsonLd.remove();
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.remove();
      const breadcrumbLd = document.querySelector('#product-breadcrumb-jsonld');
      if (breadcrumbLd) breadcrumbLd.remove();
    };
  }, [product, language, category, subcategory, getLocalizedName, API_URL]);

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <Loader2 className="animate-spin w-12 h-12 text-[#074089] mx-auto" />
          <p className="mt-4 text-gray-600">{language === 'ru' ? 'Загрузка...' : 'Loading...'}</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <FloatingCart />
        <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {language === 'ru' ? 'Товар не найден' : 'Product not found'}
          </h1>
          <p className="text-gray-600 mb-6">
            {language === 'ru' ? 'К сожалению, запрашиваемый товар не существует или был удален' : 'Unfortunately, the requested product does not exist or has been deleted'}
          </p>
          <Link to="/catalog" className="inline-block bg-[#074089] hover:bg-[#2C5BB4] text-white font-semibold px-6 py-3 rounded-lg transition-colors">
            {language === 'ru' ? 'Вернуться в каталог' : 'Back to catalog'}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  // Подготовка изображений
  const images = [
    product.main_image,
    ...(product.images || [])
  ].filter(Boolean);

  if (images.length === 0) {
    images.push('/placeholder.svg');
  }

  const handleAddToCart = () => {
    const cart = readCart();

    // Проверяем, есть ли уже такой товар в корзине
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Увеличиваем количество
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
      // Добавляем новый товар
      cart.push({
        id: product.id,
        name: product.name,
        name_en: product.name_en,
        price: product.price,
        price_on_request: product.price_on_request,
        image: product.main_image,
        slug: product.slug,
        brand: product.brand,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    toast({
      title: t('productAdded'),
      description: `${product.name} (${quantity} ${t('items')})`,
    });
  };

  const handleRequestQuote = () => {
    // Добавляем товар в корзину и переходим к оформлению заявки
    const cart = readCart();

    // Проверяем, есть ли уже такой товар в корзине
    const existingIndex = cart.findIndex(item => item.id === product.id);

    if (existingIndex >= 0) {
      // Увеличиваем количество
      cart[existingIndex].quantity = (cart[existingIndex].quantity || 1) + quantity;
    } else {
      // Добавляем новый товар
      cart.push({
        id: product.id,
        name: product.name,
        name_en: product.name_en,
        price: product.price,
        price_on_request: product.price_on_request,
        image: product.main_image,
        slug: product.slug,
        brand: product.brand,
        quantity: quantity
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cartUpdated'));

    // Переходим на страницу корзины
    navigate('/cart');
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Определяем вкладки
  const tabs = [
    { id: 'description', label: language === 'ru' ? 'Описание' : 'Description' },
    { id: 'specs', label: language === 'ru' ? 'Характеристики' : 'Specifications' },
    { id: 'files', label: language === 'ru' ? 'Документы' : 'Documents' },
    { id: 'video', label: language === 'ru' ? 'Видео' : 'Video' }
  ];

  // Подготовка характеристик для отображения
  const currentSpecGroups = language === 'en' && product.spec_groups_en && product.spec_groups_en.length > 0
    ? product.spec_groups_en
    : product.spec_groups;
  const hasSpecGroups = currentSpecGroups && currentSpecGroups.length > 0;
  const hasSpecs = product.specs && Object.keys(product.specs).length > 0;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header cartCount={cartCount} />
      <FloatingCart />

      <main id="main-content" tabIndex={-1} className="container mx-auto px-4 py-8 flex-1">
        {/* Breadcrumbs */}
        <div className="flex items-center content-start gap-2 text-sm text-gray-600 mb-6 flex-wrap min-h-[48px] sm:min-h-[24px]">
          <Link to="/" className="hover:text-[#074089]">{language === 'ru' ? 'Главная' : 'Home'}</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-[#074089]">{language === 'ru' ? 'Каталог' : 'Catalog'}</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/catalog/${category.slug}`} className="hover:text-[#074089]">{getLocalizedName(category)}</Link>
            </>
          )}
          {subcategory && (
            <>
              <span>/</span>
              <Link to={`/catalog/${category?.slug}/${subcategory.slug}`} className="hover:text-[#074089]">{getLocalizedName(subcategory)}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-900">{getLocalizedName(product)}</span>
        </div>

        {/* Product Main Section */}
        <div className="product-detail-card bg-white overflow-hidden mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Gallery Section */}
            <div className="product-gallery border-b lg:border-b-0 lg:border-r border-gray-100">
              {/* Main Image */}
              <div className="product-gallery-main relative mb-4 rounded-xl overflow-hidden">
                <img
                  src={getImageUrl(images[currentImageIndex])}
                  alt={product.name}
                  loading="eager"
                  fetchPriority="high"
                  onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/placeholder.svg';}}
                  className="w-full h-full object-contain"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      aria-label={language === 'ru' ? 'Предыдущее фото' : 'Previous image'}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      aria-label={language === 'ru' ? 'Следующее фото' : 'Next image'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}
                {/* Image counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/60 text-white text-sm px-3 py-1 rounded-full">
                    {currentImageIndex + 1} / {images.length}
                  </div>
                )}
                {/* Badges */}
                {(!!product.is_new || (product.old_price > 0 && product.old_price > product.price)) && (
                  <div className="absolute top-3 left-3 flex flex-col gap-2">
                    {!!product.is_new && (
                      <span className="bg-[#074089] text-white text-xs font-bold px-2 py-1 rounded">
                        {language === 'ru' ? 'НОВИНКА' : 'NEW'}
                      </span>
                    )}
                    {product.old_price > 0 && product.old_price > product.price && (
                      <span className="bg-red-700 text-white text-xs font-bold px-2 py-1 rounded">
                        -{Math.round((1 - product.price / product.old_price) * 100)}%
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      aria-label={`${language === 'ru' ? 'Фото' : 'Image'} ${index+1}`}
                      aria-pressed={index === currentImageIndex}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                        ? 'border-[#074089] ring-2 ring-[#074089]/30'
                        : 'border-gray-200 hover:border-[#074089]'
                        }`}
                    >
                      <img src={getImageUrl(img)} alt="" className="w-full h-full object-contain" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info Section */}
            <div className="p-5 sm:p-8 lg:p-10 min-w-0">
              {/* SKU and brand */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {product.sku && (
                    <span className="text-sm text-gray-500">{language === 'ru' ? 'Арт.' : 'SKU'}: {product.sku}</span>
                  )}
                  {product.brand && (
                    <Link
                      to={`/brand/${encodeURIComponent(product.brand)}`}
                      className="text-sm font-medium text-[#074089] bg-[#074089]/10 px-2 py-0.5 rounded hover:bg-[#074089]/20 transition-colors"
                    >
                      {product.brand}
                    </Link>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">{getLocalizedName(product)}</h1>

              {/* Stock Status */}
              {product.in_stock ? (
                <div className="flex items-center gap-2 text-[#074089] mb-6">
                  <Check size={18} className="bg-blue-100 rounded-full p-0.5" />
                  <span className="font-medium">
                    {language === 'ru' ? 'В наличии' : 'In stock'}
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-600 mb-6">
                  <Package size={18} />
                  <span className="font-medium">
                    {language === 'ru' ? 'Под заказ' : 'On request'}
                  </span>
                </div>
              )}

              {/* Price Section */}
              <div className="bg-gray-50 rounded-xl p-6 mb-6">
                {product.price_on_request ? (
                  <div className="text-3xl font-bold text-[#074089]">
                    {language === 'ru' ? 'Цена по запросу' : 'Price on request'}
                  </div>
                ) : (
                  <>
                    <div className="flex items-baseline gap-3 mb-2">
                      {product.old_price && product.old_price > product.price ? (
                        <span className="text-xl text-gray-400 line-through">
                          {formatPrice(product.old_price)}
                        </span>
                      ) : null}
                      <span className="text-3xl font-bold text-gray-900">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      {t('from')} * {language === 'ru' ? 'Цена может измениться в зависимости от комплектации' : 'Price may vary depending on configuration'}
                    </p>
                  </>
                )}
              </div>

              {/* Quick Specs */}
              {hasSpecs && (
                <div className="mb-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {Object.entries(language === 'en' && product.specs_en && Object.keys(product.specs_en).length > 0 ? product.specs_en : product.specs).slice(0, 4).map(([key, value]) => (
                      <div key={key} className="flex flex-wrap justify-between gap-2 py-2 border-b border-gray-100 min-w-0">
                        <span className="text-gray-500">{key}:</span>
                        <span className="font-medium text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="flex items-center gap-4 mb-6">
                <span className="text-gray-700 font-medium">
                  {language === 'ru' ? 'Количество:' : 'Quantity:'}
                </span>
                <div className="flex items-center border border-gray-300 rounded-lg">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    aria-label={language === 'ru' ? 'Уменьшить количество' : 'Decrease quantity'}
                    disabled={quantity === 1}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-l-lg"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 font-semibold min-w-[40px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    aria-label={language === 'ru' ? 'Увеличить количество' : 'Increase quantity'}
                    className="p-2 hover:bg-gray-100 transition-colors rounded-r-lg"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleRequestQuote}
                  className="ui-button w-full bg-[#074089] hover:bg-[#052c5e] text-white font-semibold py-4 px-5 flex items-center justify-center gap-2"
                >
                  <FileText size={20} />
                  {language === 'ru' ? 'Получить коммерческое предложение' : 'Get a quote'}
                </button>
                <div className="product-detail-actions grid grid-cols-2 gap-3">
                  <button
                    onClick={handleAddToCart}
                    className="bg-white border-2 border-[#074089] text-[#074089] hover:bg-[#074089] hover:text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <ShoppingCart size={18} />
                    {language === 'ru' ? 'В корзину' : 'Add to cart'}
                  </button>
                  <a
                    href="tel:+992933339639"
                    className="bg-white border-2 border-[#074089] text-[#074089] hover:bg-[#074089] hover:text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                  >
                    <Phone size={18} />
                    {language === 'ru' ? 'Позвонить' : 'Call'}
                  </a>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={18} className="text-[#074089]" />
                  <span>{language === 'ru' ? 'Доставка по всему Таджикистану' : 'Delivery throughout Tajikistan'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="product-detail-card bg-white overflow-hidden mb-8">
          {/* Tab Headers */}
          <div role="tablist" aria-label={language === 'ru' ? 'Информация о товаре' : 'Product information'} className="product-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                id={`product-tab-${tab.id}`}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls="product-panel"
                tabIndex={activeTab === tab.id ? 0 : -1}
                onClick={event => {setTabMotion(event.detail > 0);setActiveTab(tab.id);}}
                onKeyDown={event => {
                  const current = tabs.findIndex(item=>item.id===tab.id);
                  const next = event.key === 'ArrowRight' ? (current+1)%tabs.length : event.key === 'ArrowLeft' ? (current+tabs.length-1)%tabs.length : event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length-1 : null;
                  if(next === null) return;
                  event.preventDefault();setTabMotion(false);setActiveTab(tabs[next].id);document.getElementById(`product-tab-${tabs[next].id}`)?.focus();
                }}
                className={`px-6 py-4 font-semibold whitespace-nowrap transition-all ${activeTab === tab.id
                  ? 'border-b-2 border-[#074089] text-[#074089] bg-[#074089]/5'
                  : 'text-gray-600 hover:text-[#074089] hover:bg-gray-50'
                  }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div key={activeTab} id="product-panel" role="tabpanel" aria-labelledby={`product-tab-${activeTab}`} tabIndex={0} className={`p-5 sm:p-8 ${tabMotion ? 'content-enter' : ''}`}>
            {activeTab === 'description' && (
              <div className="prose max-w-none">
                {(getLocalizedDescription(product) || product.description) ? (
                  <div
                    className="text-gray-700 leading-relaxed space-y-4"
                    dangerouslySetInnerHTML={{ __html: sanitizeDescription(getLocalizedDescription(product) || product.description) }}
                  />
                ) : (
                  <p className="text-gray-500">
                    {language === 'ru' ? 'Описание скоро будет добавлено' : 'Description coming soon'}
                  </p>
                )}
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-8">
                {/* Встроенные характеристики (старый формат specs) - показываем ПЕРВЫМИ */}
                {hasSpecs && (
                  <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {language === 'ru' ? 'Характеристики' : 'Specifications'}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(language === 'en' && product.specs_en && Object.keys(product.specs_en).length > 0 ? product.specs_en : product.specs).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-4 py-3 text-gray-600 w-1/2 border-b border-gray-100">{key}</td>
                              <td className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Группы характеристик с заголовками (добавленные админом) - показываем ПОСЛЕ встроенных */}
                {hasSpecGroups && currentSpecGroups.map((group, index) => (
                  <div key={index}>
                    <h2 className="text-lg font-bold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                      {group.title}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <tbody>
                          {Object.entries(group.items || {}).map(([key, value], idx) => (
                            <tr key={key} className={idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                              <td className="px-4 py-3 text-gray-600 w-1/2 border-b border-gray-100">{key}</td>
                              <td className="px-4 py-3 text-gray-900 font-medium border-b border-gray-100">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}

                {!hasSpecGroups && !hasSpecs && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      {language === 'ru' ? 'Характеристики скоро будут добавлены' : 'Specifications coming soon'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'files' && (
              <div>
                {product.documents && product.documents.length > 0 ? (
                  <div className="space-y-3">
                    {product.documents.map((doc, index) => (
                      <a
                        key={index}
                        href={getImageUrl(doc.url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                      >
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <FileText className="text-red-500" size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{doc.name || 'Документ'}</p>
                          <p className="text-sm text-gray-500">PDF</p>
                        </div>
                        <ExternalLink className="text-gray-400 group-hover:text-[#074089] transition-colors" size={20} />
                      </a>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">📄</div>
                    <p className="text-gray-900 text-lg font-semibold mb-2">
                      {language === 'ru' ? 'Документов пока нет' : 'No documents yet'}
                    </p>
                    <p className="text-gray-500">
                      {language === 'ru' ? 'Документация скоро будет добавлена' : 'Documentation coming soon'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'video' && (
              <div>
                {product.video_url ? (
                  <div className="aspect-video rounded-xl overflow-hidden bg-gray-900">
                    {product.video_url.includes('youtube.com') || product.video_url.includes('youtu.be') ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${product.video_url.includes('youtu.be')
                          ? product.video_url.split('/').pop()
                          : new URL(product.video_url).searchParams.get('v')}`}
                        title="Product video"
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : product.video_url.includes('vimeo.com') ? (
                      <iframe
                        src={`https://player.vimeo.com/video/${product.video_url.split('/').pop()}`}
                        title="Product video"
                        className="w-full h-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <a
                          href={product.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 text-white bg-[#074089] hover:bg-[#2C5BB4] px-6 py-3 rounded-lg transition-colors"
                        >
                          <Play size={24} />
                          {language === 'ru' ? 'Смотреть видео' : 'Watch video'}
                        </a>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-5xl mb-4">🎬</div>
                    <p className="text-gray-900 text-lg font-semibold mb-2">
                      {language === 'ru' ? 'Видео пока нет' : 'No video yet'}
                    </p>
                    <p className="text-gray-500">
                      {language === 'ru' ? 'Видео скоро будет добавлено' : 'Video coming soon'}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductDetail;
