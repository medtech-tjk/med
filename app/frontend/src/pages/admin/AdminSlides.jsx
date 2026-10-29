import { adminFetch as fetch } from '../../lib/adminApi';
import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, Save, X, AlertCircle, Image as ImageIcon, GripVertical, Upload, Loader2 } from 'lucide-react';

const AdminSlides = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    title: '',
    title_en: '',
    subtitle: '',
    subtitle_en: '',
    image: '',
    cta_text: 'Подробнее',
    cta_text_en: 'Learn more',
    cta_link: '/catalog',
    order: 0,
    is_active: true
  });
  const API_URL = '';

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/slides/all`);
      if (response.ok) {
        const data = await response.json();
        setSlides(data);
      }
    } catch (err) {
      setError('Ошибка загрузки слайдов');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        headers: {},
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setForm({ ...form, image: data.url });
      } else {
        setError('Ошибка загрузки изображения');
      }
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      const method = editingSlide ? 'PUT' : 'POST';
      const url = editingSlide
        ? `${API_URL}/api/slides/${editingSlide.id}`
        : `${API_URL}/api/slides/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form)
      });

      if (response.ok) {
        fetchSlides();
        closeForm();
      } else {
        setError('Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Удалить слайд?')) return;

    try {
      const response = await fetch(`${API_URL}/api/slides/${slideId}`, {
        method: 'DELETE',
        headers: {}
      });

      if (response.ok) {
        fetchSlides();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const startEdit = (slide) => {
    setEditingSlide(slide);
    setForm({
      title: slide.title,
      title_en: slide.title_en || '',
      subtitle: slide.subtitle || '',
      subtitle_en: slide.subtitle_en || '',
      image: slide.image,
      cta_text: slide.cta_text || 'Подробнее',
      cta_text_en: slide.cta_text_en || 'Learn more',
      cta_link: slide.cta_link || '/catalog',
      order: slide.order || 0,
      is_active: slide.is_active !== false
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingSlide(null);
    setForm({
      title: '',
      title_en: '',
      subtitle: '',
      subtitle_en: '',
      image: '',
      cta_text: 'Подробнее',
      cta_text_en: 'Learn more',
      cta_link: '/catalog',
      order: 0,
      is_active: true
    });
  };

  // Get full image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

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
        <h1 className="text-2xl font-bold text-gray-900">Управление слайдером</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-[#074089] hover:bg-[#052c5e] text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Добавить слайд
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingSlide ? 'Редактировать' : 'Новый'} слайд</h2>
              <button onClick={closeForm}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Заголовок *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  placeholder="Например: Медицинское оборудование"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title (English)</label>
                <input
                  type="text"
                  value={form.title_en}
                  onChange={(e) => setForm({ ...form, title_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  placeholder="e.g. Medical Equipment"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Подзаголовок</label>
                <input
                  type="text"
                  value={form.subtitle}
                  onChange={(e) => setForm({ ...form, subtitle: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  placeholder="Краткое описание"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle (English)</label>
                <input
                  type="text"
                  value={form.subtitle_en}
                  onChange={(e) => setForm({ ...form, subtitle_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  placeholder="Short description in English"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Изображение *</label>
                <div className="space-y-3">
                  {form.image ? (
                    <div className="relative">
                      <img
                        src={getImageUrl(form.image)}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => setForm({ ...form, image: '' })}
                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
                    >
                      {uploading ? (
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                      ) : (
                        <>
                          <Upload className="text-gray-400 mb-2" size={32} />
                          <span className="text-sm text-gray-500">Нажмите для загрузки</span>
                          <span className="text-xs text-gray-400 mt-1">JPG, PNG, WebP</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => handleImageUpload(e.target.files[0])}
                    accept="image/*"
                    className="hidden"
                  />

                  {/* URL input as fallback */}
                  <div className="text-center text-sm text-gray-500">или</div>
                  <input
                    type="text"
                    value={form.image}
                    onChange={(e) => setForm({ ...form, image: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                    placeholder="URL изображения (https://...)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Текст кнопки</label>
                  <input
                    type="text"
                    value={form.cta_text}
                    onChange={(e) => setForm({ ...form, cta_text: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Button text (EN)</label>
                  <input
                    type="text"
                    value={form.cta_text_en}
                    onChange={(e) => setForm({ ...form, cta_text_en: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ссылка кнопки</label>
                <input
                  type="text"
                  value={form.cta_link}
                  onChange={(e) => setForm({ ...form, cta_link: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#074089]"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="text-sm font-medium text-gray-700">Активный</span>
              </label>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button
                onClick={closeForm}
                className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSave}
                disabled={!form.title || !form.image}
                className="flex-1 py-2 px-4 bg-[#074089] text-white rounded-lg hover:bg-[#052c5e] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Slides List */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {slides.length === 0 ? (
          <div className="p-12 text-center">
            <ImageIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Слайдов пока нет</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {slides.map((slide) => (
              <div key={slide.id} className="p-4 flex items-center gap-4">
                <GripVertical className="text-gray-400 cursor-move" size={20} />

                {slide.image && (
                  <img
                    src={getImageUrl(slide.image)}
                    alt=""
                    className="w-32 h-20 object-cover rounded"
                  />
                )}

                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{slide.title}</p>
                  {slide.subtitle && (
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    {slide.cta_text} → {slide.cta_link}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${slide.is_active !== false
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600'
                    }`}>
                    {slide.is_active !== false ? 'Активный' : 'Скрытый'}
                  </span>

                  <button
                    onClick={() => startEdit(slide)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  <button
                    onClick={() => handleDelete(slide.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSlides;
