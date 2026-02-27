import React, { useState, useEffect } from 'react';
import { Save, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { useCurrency } from '../../context/CurrencyContext';

const AdminSettings = () => {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [usdToTjsRate, setUsdToTjsRate] = useState(11.2);
    const [lastUpdated, setLastUpdated] = useState(null);
    const { refreshExchangeRate } = useCurrency();


    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings`);

            if (response.ok) {
                const data = await response.json();
                setUsdToTjsRate(data.usd_to_tjs_rate || 11.2);
                setLastUpdated(data.updated_at);
            }
        } catch (err) {
            setError('Ошибка загрузки настроек');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            setSuccess(false);

            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Admin-Token': token
                },
                body: JSON.stringify({
                    id: 'global_settings',
                    usd_to_tjs_rate: parseFloat(usdToTjsRate)
                })
            });

            if (response.ok) {
                const data = await response.json();
                setLastUpdated(data.settings.updated_at);
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
                // Refresh exchange rate in CurrencyContext
                refreshExchangeRate();
            } else {
                setError('Ошибка сохранения настроек');
            }
        } catch (err) {
            setError('Ошибка сохранения');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-center py-12">
                    <div className="text-gray-500">Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-8">Настройки</h1>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
                    <CheckCircle size={18} />
                    Настройки успешно сохранены
                </div>
            )}

            {/* Exchange Rate Settings */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                        <DollarSign className="text-green-600" size={24} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Курс валют</h2>
                        <p className="text-sm text-gray-500">Управление курсом обмена валют на сайте</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Курс USD к TJS
                        </label>
                        <div className="flex items-center gap-3">
                            <div className="flex-1 max-w-xs">
                                <div className="relative">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">1 USD =</span>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={usdToTjsRate}
                                        onChange={(e) => setUsdToTjsRate(e.target.value)}
                                        className="w-full pl-20 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-semibold"
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">с</span>
                                </div>
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-colors"
                            >
                                <Save size={18} />
                                {saving ? 'Сохранение...' : 'Сохранить'}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                            Этот курс будет использоваться для автоматического пересчета цен на сайте
                        </p>
                    </div>

                    {lastUpdated && (
                        <div className="text-sm text-gray-500 pt-3 border-t border-gray-200">
                            Последнее обновление: {new Date(lastUpdated).toLocaleString('ru-RU', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Card */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Как это работает:</p>
                        <ul className="list-disc list-inside space-y-1 text-blue-700">
                            <li>Установите актуальный курс доллара к сомони</li>
                            <li>Все цены в USD будут автоматически пересчитаны по этому курсу</li>
                            <li>Пользователи смогут переключаться между TJS и USD на сайте</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
