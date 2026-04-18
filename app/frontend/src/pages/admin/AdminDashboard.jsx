import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, FolderTree, FileText, TrendingUp, AlertCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    orders: 0,
    newOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${(process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '')}/api/admin/stats`, {
        headers: { 'X-Admin-Token': token }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Товары', value: stats.products, icon: Package, color: 'blue', link: '/admin/products' },
    { label: 'Категории', value: stats.categories, icon: FolderTree, color: 'green', link: '/admin/categories' },
    { label: 'Заявки', value: stats.orders, icon: FileText, color: 'purple', link: '/admin/orders' },
    { label: 'Новые заявки', value: stats.newOrders, icon: TrendingUp, color: 'orange', link: '/admin/orders' }
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600'
  };

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Панель управления</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => (
          <Link
            key={card.label}
            to={card.link}
            className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${colorClasses[card.color]}`}>
                <card.icon size={24} />
              </div>
              <span className="text-3xl font-bold text-gray-900">
                {loading ? '-' : card.value}
              </span>
            </div>
            <p className="text-gray-600 font-medium">{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Быстрые действия</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/products/new"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            + Добавить товар
          </Link>
          <Link
            to="/admin/categories"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            + Добавить категорию
          </Link>
          <Link
            to="/admin/slides"
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Управление слайдером
          </Link>
          <Link
            to="/admin/orders"
            className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-4 rounded-lg text-center transition-colors"
          >
            Просмотр заявок
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
