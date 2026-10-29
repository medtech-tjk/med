import { adminFetch as fetch, fetchAllProducts } from '../../lib/adminApi';
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2, Search, Package, AlertCircle, X, Eye } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const API_URL = '';

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchAllProducts();
      setProducts(data);
    } catch (err) {
      setError('Ошибка загрузки товаров');
    } finally {
      setLoading(false);
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

  const handleDelete = async (productId) => {
    if (!window.confirm('Удалить товар?')) return;

    try {
      const response = await fetch(`${API_URL}/api/products/${productId}`, {
        method: 'DELETE',
        headers: {}
      });

      if (response.ok) {
        fetchProducts();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !filterCategory || product.category_id === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category?.name || 'Без категории';
  };

  const formatPrice = (price, priceOnRequest = false) => {
    if (priceOnRequest) return 'По запросу';
    return new Intl.NumberFormat('ru-RU').format(price) + ' TJS';
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Товары</h1>
        <Link
          to="/admin/products/new"
          className="bg-[#074089] hover:bg-[#052c5e] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Добавить товар
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
              placeholder="Поиск по названию или бренду..."
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
          >
            <option value="">Все категории</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Товаров пока нет</p>
            <Link to="/admin/products/new" className="text-blue-600 hover:text-blue-700 font-medium">
              Добавить первый товар
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Товар</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Категория</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Цена</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Статус</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {product.main_image ? (
                          <img src={product.main_image} alt="" className="w-12 h-12 rounded object-cover" />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Package className="text-gray-400" size={20} />
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          <p className="text-sm text-gray-500">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{getCategoryName(product.category_id)}</td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(product.price, product.price_on_request)}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {product.is_new && (
                          <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-1 rounded">Новинка</span>
                        )}
                        {product.is_popular && (
                          <span className="bg-orange-100 text-orange-700 text-xs font-semibold px-2 py-1 rounded">Популярное</span>
                        )}
                        {product.stock > 0 ? (
                          <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-1 rounded">В наличии</span>
                        ) : (
                          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-1 rounded">Под заказ</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/product/${product.slug}`}
                          target="_blank"
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Просмотр"
                        >
                          <Eye size={18} />
                        </Link>
                        <Link
                          to={`/admin/products/${product.id}/edit`}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Редактировать"
                        >
                          <Edit2 size={18} />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Удалить"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminProducts;
