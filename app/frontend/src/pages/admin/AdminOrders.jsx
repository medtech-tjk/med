import React, { useState, useEffect } from 'react';
import { FileText, Eye, Check, X, AlertCircle, Clock } from 'lucide-react';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('');

  const token = localStorage.getItem('adminToken');
  const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/orders/`, {
        headers: { 'X-Admin-Token': token }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      } else {
        console.error('Orders API error:', response.status);
        setError('Ошибка загрузки заявок');
      }
    } catch (err) {
      console.error('Orders fetch error:', err);
      setError('Ошибка загрузки заявок');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const response = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
      } else {
        setError('Ошибка обновления статуса');
      }
    } catch (err) {
      setError('Ошибка обновления');
    }
  };

  const statusColors = {
    'new': 'bg-blue-100 text-blue-700',
    'processing': 'bg-orange-100 text-orange-700',
    'completed': 'bg-green-100 text-green-700',
    'cancelled': 'bg-red-100 text-red-700'
  };

  const statusLabels = {
    'new': 'Новая',
    'processing': 'В работе',
    'completed': 'Выполнена',
    'cancelled': 'Отменена'
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ru-RU').format(price) + ' TJS';
  };

  const filteredOrders = filterStatus
    ? orders.filter(o => o.status === filterStatus)
    : orders;

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Заявки</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-4 mb-6">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterStatus('')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === '' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            Все ({orders.length})
          </button>
          {Object.entries(statusLabels).map(([status, label]) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === status ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
            >
              {label} ({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">Заявка #{selectedOrder.id.slice(0, 8)}</h2>
              <button onClick={() => setSelectedOrder(null)}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">ФИО</p>
                  <p className="font-medium">{selectedOrder.full_name || selectedOrder.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Телефон</p>
                  <p className="font-medium">{selectedOrder.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{selectedOrder.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Организация</p>
                  <p className="font-medium">{selectedOrder.organization || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Адрес</p>
                  <p className="font-medium">{selectedOrder.address || '-'}</p>
                </div>
              </div>

              {selectedOrder.message && (
                <div>
                  <p className="text-sm text-gray-500">Сообщение</p>
                  <p className="font-medium">{selectedOrder.message}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-gray-500 mb-2">Товары</p>
                <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                  {selectedOrder.items?.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.name}</span>
                      <span className="font-medium">{formatPrice(item.price)}</span>
                    </div>
                  ))}
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Итого:</span>
                    <span>{formatPrice(selectedOrder.total)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Статус</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(statusLabels).map(([status, label]) => (
                    <button
                      key={status}
                      onClick={() => updateStatus(selectedOrder.id, status)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedOrder.status === status
                          ? statusColors[status]
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Заявок пока нет</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">№</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Клиент</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Сумма</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Статус</th>
                  <th className="text-left px-6 py-4 font-semibold text-gray-600">Дата</th>
                  <th className="text-right px-6 py-4 font-semibold text-gray-600">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">#{order.id.slice(0, 8)}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.full_name || order.name}</p>
                      <p className="text-sm text-gray-500">{order.phone}</p>
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500">{formatDate(order.created_at)}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Eye size={18} />
                      </button>
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

export default AdminOrders;
