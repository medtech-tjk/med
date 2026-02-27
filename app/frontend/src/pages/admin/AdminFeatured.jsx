import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Star, AlertCircle, X, Package, GripVertical, Search, Image } from 'lucide-react';

const AdminFeatured = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const token = localStorage.getItem('adminToken');
  const API_URL = process.env.REACT_APP_BACKEND_URL;

  useEffect(() => {
    fetchFeaturedProducts();
    fetchAllProducts();
    fetchCategories();
  }, []);

  const fetchFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/featured/`);
      if (response.ok) {
        const data = await response.json();
        setFeaturedProducts(data);
      }
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };

  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/products/`);
      if (response.ok) {
        const data = await response.json();
        setAllProducts(data);
      }
    } catch (err) {
      console.error('Error fetching products');
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/categories/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error('Error fetching categories');
    }
  };

  const addToFeatured = async (productId) => {
    try {
      const response = await fetch(`${API_URL}/api/featured/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify({
          product_id: productId,
          order: featuredProducts.length
        })
      });

      if (response.ok) {
        fetchFeaturedProducts();
        setShowAddModal(false);
        setSearchQuery('');
      } else {
        setError('Ошибка добавления');
      }
    } catch (err) {
      setError('Ошибка добавления');
    }
  };

  const removeFromFeatured = async (productId) => {
    if (!window.confirm('Убрать товар из популярных?')) return;

    try {
      const response = await fetch(`${API_URL}/api/featured/${productId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (response.ok) {
        fetchFeaturedProducts();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' TJS';
  };

  // Get image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Filter products not already featured
  const availableProducts = allProducts.filter(
    product => !featuredProducts.some(fp => fp.id === product.id)
  ).filter(
    product => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.sku && product.sku.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesSearch;
    }
  );

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Популярные товары</h1>
          <p className="text-gray-500 mt-1">Товары для блока "Популярные товары" на главной странице (сетка 4×2)</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Добавить товар
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Добавить в популярные</h2>
              <button onClick={() => setShowAddModal(false)}><X size={24} /></button>
            </div>
            <div className="p-4 border-b">
              {/* Search by SKU or name */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Поиск по артикулу (SKU) или названию..."
                />
              </div>
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {availableProducts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  {allProducts.length === 0
                    ? 'Товаров нет. Сначала добавьте товары.'
                    : searchQuery
                      ? 'Товары не найдены'
                      : 'Все товары уже добавлены в популярные'}
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {availableProducts.map((product) => (
                    <button
                      key={product.id}
                      onClick={() => addToFeatured(product.id)}
                      className="w-full p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors text-left"
                    >
                      {product.main_image ? (
                        <img src={getImageUrl(product.main_image)} alt="" className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Package className="text-gray-400" size={20} />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{product.name}</p>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          {product.sku && (
                            <span className="bg-gray-100 px-2 py-0.5 rounded font-mono text-xs">
                              {product.sku}
                            </span>
                          )}
                          <span>{product.brand}</span>
                        </div>
                      </div>
                      <span className="font-semibold text-blue-600 whitespace-nowrap">{formatPrice(product.price)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Featured Products List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {featuredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Популярных товаров пока нет</p>
            <p className="text-gray-400 mt-2">
              Добавьте товары для отображения в блоке "Популярные товары" на главной странице
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {featuredProducts.map((product, index) => (
              <div key={product.id} className="p-4 flex items-center gap-4">
                <GripVertical className="text-gray-400 cursor-move" size={20} />

                <span className="text-sm font-bold text-gray-400 w-6">{index + 1}</span>

                {product.main_image ? (
                  <img src={getImageUrl(product.main_image)} alt="" className="w-16 h-16 rounded object-cover" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <Image className="text-gray-400" size={24} />
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{product.name}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    {product.sku && (
                      <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-mono text-xs">
                        {product.sku}
                      </span>
                    )}
                    <span>{product.brand}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {product.is_new && (
                    <span className="bg-green-100 text-green-700 text-xs font-medium px-2 py-0.5 rounded">
                      Новинка
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded ${product.in_stock
                      ? 'bg-green-100 text-green-700'
                      : 'bg-yellow-100 text-yellow-700'
                    }`}>
                    {product.in_stock ? 'В наличии' : 'По заявке'}
                  </span>
                </div>

                <span className="font-semibold text-blue-600 whitespace-nowrap">
                  {formatPrice(product.price)}
                </span>

                <button
                  onClick={() => removeFromFeatured(product.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Убрать из популярных"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Информация:</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li>Блок "Популярные товары" отображается на главной странице между слайдером и категориями</li>
          <li>Сетка 4×2 (8 товаров на страницу)</li>
          <li>Если товаров больше 8, появятся кнопки навигации ←/→</li>
          <li>Добавляйте товары через поиск по названию или артикулу (SKU)</li>
        </ul>
      </div>
    </div>
  );
};

export default AdminFeatured;
