import React, { useState, useEffect, useRef } from 'react';
import { Plus, Edit2, Trash2, ChevronDown, ChevronRight, Save, X, AlertCircle, FolderTree, Upload, Loader2, Image, ArrowUp, ArrowDown, GripVertical } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSubcategories, setExpandedSubcategories] = useState({});
  const fileInputRef = useRef(null);
  const subcategoryFileInputRef = useRef(null);

  // Form states
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [showThirdLevelForm, setShowThirdLevelForm] = useState(false);

  const [editingCategory, setEditingCategory] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [editingThirdLevel, setEditingThirdLevel] = useState(null);

  const [currentParentId, setCurrentParentId] = useState(null);
  const [currentSubcategoryId, setCurrentSubcategoryId] = useState(null);

  // Form data
  const [categoryForm, setCategoryForm] = useState({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
  const [thirdLevelForm, setThirdLevelForm] = useState({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });

  const token = localStorage.getItem('adminToken');
  const API_URL = (process.env.REACT_APP_BACKEND_URL || '').replace(/\/+$/, '');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/categories/`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      } else {
        setError('Ошибка загрузки категорий');
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (name) => {
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo', 'ж': 'zh',
      'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
      'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
      'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
      ' ': '-'
    };
    return name.toLowerCase().split('').map(char => translitMap[char] || char).join('').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-');
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_URL}${imagePath}`;
  };

  // Функции для перемещения категорий вверх/вниз
  const moveCategoryUp = async (index) => {
    if (index === 0) return; // Уже первая
    const newOrder = [...categories];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    // Отправляем новый порядок на сервер
    const categoryIds = newOrder.map(c => c.id);
    try {
      const response = await fetch(`${API_URL}/api/categories/reorder-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(categoryIds)
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка при изменении порядка');
      }
    } catch (err) {
      setError('Ошибка при изменении порядка');
    }
  };

  const moveCategoryDown = async (index) => {
    if (index >= categories.length - 1) return; // Уже последняя
    const newOrder = [...categories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    // Отправляем новый порядок на сервер
    const categoryIds = newOrder.map(c => c.id);
    try {
      const response = await fetch(`${API_URL}/api/categories/reorder-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(categoryIds)
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка при изменении порядка');
      }
    } catch (err) {
      setError('Ошибка при изменении порядка');
    }
  };

  const moveSubcategoryUp = async (categoryId, subcategories, index) => {
    if (index === 0) return;
    const newOrder = [...subcategories];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    const subcategoryIds = newOrder.map(s => s.id);
    try {
      const response = await fetch(`${API_URL}/api/categories/subcategories/reorder-all?parent_id=${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(subcategoryIds)
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка при изменении порядка');
      }
    } catch (err) {
      setError('Ошибка при изменении порядка');
    }
  };

  const moveSubcategoryDown = async (categoryId, subcategories, index) => {
    if (index >= subcategories.length - 1) return;
    const newOrder = [...subcategories];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];

    const subcategoryIds = newOrder.map(s => s.id);
    try {
      const response = await fetch(`${API_URL}/api/categories/subcategories/reorder-all?parent_id=${categoryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(subcategoryIds)
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка при изменении порядка');
      }
    } catch (err) {
      setError('Ошибка при изменении порядка');
    }
  };

  // Image upload
  const handleImageUpload = async (file, formType) => {
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch(`${API_URL}/api/upload/`, {
        method: 'POST',
        headers: { 'X-Admin-Token': token },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        if (formType === 'category') {
          setCategoryForm(prev => ({ ...prev, image: data.url }));
        } else if (formType === 'subcategory') {
          setSubcategoryForm(prev => ({ ...prev, image: data.url }));
        } else if (formType === 'thirdLevel') {
          setThirdLevelForm(prev => ({ ...prev, image: data.url }));
        }
      } else {
        setError('Ошибка загрузки изображения');
      }
    } catch (err) {
      setError('Ошибка загрузки');
    } finally {
      setUploading(false);
    }
  };

  // CRUD Operations
  const handleSaveCategory = async () => {
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `${API_URL}/api/categories/${editingCategory.id}`
        : `${API_URL}/api/categories/`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify(categoryForm)
      });

      if (response.ok) {
        fetchCategories();
        closeCategoryForm();
      } else {
        setError('Ошибка сохранения категории');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleSaveSubcategory = async () => {
    try {
      const method = editingSubcategory ? 'PUT' : 'POST';
      const url = editingSubcategory
        ? `${API_URL}/api/categories/subcategories/${editingSubcategory.id}`
        : `${API_URL}/api/categories/${currentParentId}/subcategories`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify({ ...subcategoryForm, parent_id: currentParentId })
      });

      if (response.ok) {
        fetchCategories();
        closeSubcategoryForm();
      } else {
        setError('Ошибка сохранения подкатегории');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleSaveThirdLevel = async () => {
    try {
      const method = editingThirdLevel ? 'PUT' : 'POST';
      const url = editingThirdLevel
        ? `${API_URL}/api/categories/third-level/${editingThirdLevel.id}`
        : `${API_URL}/api/categories/subcategories/${currentSubcategoryId}/children`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Token': token
        },
        body: JSON.stringify({ ...thirdLevelForm, parent_id: currentSubcategoryId })
      });

      if (response.ok) {
        fetchCategories();
        closeThirdLevelForm();
      } else {
        setError('Ошибка сохранения');
      }
    } catch (err) {
      setError('Ошибка сохранения');
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Удалить категорию и все подкатегории?')) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleDeleteSubcategory = async (subcategoryId) => {
    if (!window.confirm('Удалить подкатегорию и все вложенные элементы?')) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/subcategories/${subcategoryId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  const handleDeleteThirdLevel = async (categoryId) => {
    if (!window.confirm('Удалить категорию?')) return;

    try {
      const response = await fetch(`${API_URL}/api/categories/third-level/${categoryId}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Token': token }
      });

      if (response.ok) {
        fetchCategories();
      } else {
        setError('Ошибка удаления');
      }
    } catch (err) {
      setError('Ошибка удаления');
    }
  };

  // Form handlers
  const startEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryForm({
      name: category.name,
      name_en: category.name_en || '',
      slug: category.slug,
      image: category.image || '',
      description: category.description || '',
      description_en: category.description_en || '',
      order: category.order || 0
    });
    setShowCategoryForm(true);
  };

  const startEditSubcategory = (subcategory, parentId) => {
    setEditingSubcategory(subcategory);
    setCurrentParentId(parentId);
    setSubcategoryForm({
      name: subcategory.name,
      name_en: subcategory.name_en || '',
      slug: subcategory.slug,
      image: subcategory.image || '',
      description: subcategory.description || '',
      description_en: subcategory.description_en || '',
      order: subcategory.order || 0
    });
    setShowSubcategoryForm(true);
  };

  const startEditThirdLevel = (child, subcategoryId) => {
    setEditingThirdLevel(child);
    setCurrentSubcategoryId(subcategoryId);
    setThirdLevelForm({
      name: child.name,
      name_en: child.name_en || '',
      slug: child.slug,
      image: child.image || '',
      description: child.description || '',
      description_en: child.description_en || '',
      order: child.order || 0
    });
    setShowThirdLevelForm(true);
  };

  const openAddSubcategory = (parentId) => {
    setEditingSubcategory(null);
    setCurrentParentId(parentId);
    setSubcategoryForm({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
    setShowSubcategoryForm(true);
  };

  const openAddThirdLevel = (subcategoryId) => {
    setEditingThirdLevel(null);
    setCurrentSubcategoryId(subcategoryId);
    setThirdLevelForm({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
    setShowThirdLevelForm(true);
  };

  const closeCategoryForm = () => {
    setShowCategoryForm(false);
    setEditingCategory(null);
    setCategoryForm({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
  };

  const closeSubcategoryForm = () => {
    setShowSubcategoryForm(false);
    setEditingSubcategory(null);
    setCurrentParentId(null);
    setSubcategoryForm({ name: '', name_en: '', slug: '', image: '', description: '', description_en: '', order: 0 });
  };

  const closeThirdLevelForm = () => {
    setShowThirdLevelForm(false);
    setEditingThirdLevel(null);
    setCurrentSubcategoryId(null);
    setThirdLevelForm({ name: '', slug: '', image: '', order: 0 });
  };

  const toggleExpand = (categoryId) => {
    setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
  };

  const toggleExpandSubcategory = (subcategoryId) => {
    setExpandedSubcategories(prev => ({ ...prev, [subcategoryId]: !prev[subcategoryId] }));
  };

  // Image Upload Component
  const ImageUploadField = ({ value, onChange, formType, label }) => {
    const inputRef = useRef(null);

    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          <span className="text-gray-400 font-normal ml-2">(JPG, PNG, WebP, 600×400px)</span>
        </label>
        <div className="space-y-2">
          {value ? (
            <div className="relative inline-block">
              <img src={getImageUrl(value)} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
              <button
                type="button"
                onClick={() => onChange('')}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => inputRef.current?.click()}
              className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              {uploading ? (
                <Loader2 className="animate-spin text-blue-500" size={24} />
              ) : (
                <>
                  <Upload className="text-gray-400 mb-1" size={24} />
                  <span className="text-sm text-gray-500">Загрузить фото</span>
                </>
              )}
            </div>
          )}
          <input
            type="file"
            ref={inputRef}
            onChange={(e) => handleImageUpload(e.target.files[0], formType)}
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg text-sm"
            placeholder="или URL изображения"
          />
        </div>
      </div>
    );
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
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Управление категориями</h1>
          <p className="text-gray-500 mt-1">3 уровня вложенности: Категория → Подкатегория → Тип</p>
        </div>
        <button
          onClick={() => {
            setEditingCategory(null);
            setCategoryForm({ name: '', slug: '', image: '', order: 0 });
            setShowCategoryForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={18} />
          Добавить категорию
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2 mb-6">
          <AlertCircle size={18} />
          {error}
          <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
        </div>
      )}

      {/* Category Form Modal */}
      {showCategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingCategory ? 'Редактировать' : 'Новая'} категория (1 уровень)</h2>
              <button onClick={closeCategoryForm}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Ультразвуковая диагностика"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название (EN)</label>
                <input
                  type="text"
                  value={categoryForm.name_en || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Category name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (slug)</label>
                <input
                  type="text"
                  value={categoryForm.slug}
                  onChange={(e) => setCategoryForm({ ...categoryForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              <ImageUploadField
                value={categoryForm.image}
                onChange={(value) => setCategoryForm({ ...categoryForm, image: value })}
                formType="category"
                label="Изображение"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание (RU)</label>
                <textarea
                  value={categoryForm.description || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Описание категории для отображения на сайте..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                <textarea
                  value={categoryForm.description_en || ''}
                  onChange={(e) => setCategoryForm({ ...categoryForm, description_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Category description in English..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label>
                <input
                  type="number"
                  value={categoryForm.order}
                  onChange={(e) => setCategoryForm({ ...categoryForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={closeCategoryForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleSaveCategory} disabled={!categoryForm.name} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={18} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Subcategory Form Modal */}
      {showSubcategoryForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingSubcategory ? 'Редактировать' : 'Новая'} подкатегория (2 уровень)</h2>
              <button onClick={closeSubcategoryForm}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={subcategoryForm.name}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: УЗИ датчики"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название (EN)</label>
                <input
                  type="text"
                  value={subcategoryForm.name_en || ''}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Subcategory name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (slug)</label>
                <input
                  type="text"
                  value={subcategoryForm.slug}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <ImageUploadField
                value={subcategoryForm.image}
                onChange={(value) => setSubcategoryForm({ ...subcategoryForm, image: value })}
                formType="subcategory"
                label="Изображение"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание (RU)</label>
                <textarea
                  value={subcategoryForm.description || ''}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Описание подкатегории для отображения на сайте..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                <textarea
                  value={subcategoryForm.description_en || ''}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, description_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  placeholder="Subcategory description in English..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label>
                <input
                  type="number"
                  value={subcategoryForm.order}
                  onChange={(e) => setSubcategoryForm({ ...subcategoryForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={closeSubcategoryForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleSaveSubcategory} disabled={!subcategoryForm.name} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={18} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Third Level Form Modal */}
      {showThirdLevelForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-xl font-bold">{editingThirdLevel ? 'Редактировать' : 'Новый'} тип (3 уровень)</h2>
              <button onClick={closeThirdLevelForm}><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название *</label>
                <input
                  type="text"
                  value={thirdLevelForm.name}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, name: e.target.value, slug: generateSlug(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Например: Линейные"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название (EN)</label>
                <input
                  type="text"
                  value={thirdLevelForm.name_en || ''}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, name_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Name in English"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL (slug)</label>
                <input
                  type="text"
                  value={thirdLevelForm.slug}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, slug: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                />
              </div>
              <ImageUploadField
                value={thirdLevelForm.image}
                onChange={(value) => setThirdLevelForm({ ...thirdLevelForm, image: value })}
                formType="thirdLevel"
                label="Изображение"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Описание (RU)</label>
                <textarea
                  value={thirdLevelForm.description || ''}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Описание..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (EN)</label>
                <textarea
                  value={thirdLevelForm.description_en || ''}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, description_en: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                  placeholder="Description in English..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Порядок</label>
                <input
                  type="number"
                  value={thirdLevelForm.order}
                  onChange={(e) => setThirdLevelForm({ ...thirdLevelForm, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex gap-3">
              <button onClick={closeThirdLevelForm} className="flex-1 py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50">
                Отмена
              </button>
              <button onClick={handleSaveThirdLevel} disabled={!thirdLevelForm.name} className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2">
                <Save size={18} />
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories Tree */}
      <div className="bg-white rounded-xl shadow-md">
        {categories.length === 0 ? (
          <div className="p-12 text-center">
            <FolderTree className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Категорий пока нет</p>
            <p className="text-gray-400">Добавьте первую категорию</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {categories.map((category, categoryIndex) => (
              <div key={category.id} className="p-4">
                {/* Level 1: Category */}
                <div className="flex items-center gap-3">
                  {/* Order controls */}
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveCategoryUp(categoryIndex)}
                      disabled={categoryIndex === 0}
                      className={`p-1 rounded transition-colors ${categoryIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                      title="Переместить вверх"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      onClick={() => moveCategoryDown(categoryIndex)}
                      disabled={categoryIndex >= categories.length - 1}
                      className={`p-1 rounded transition-colors ${categoryIndex >= categories.length - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                      title="Переместить вниз"
                    >
                      <ArrowDown size={14} />
                    </button>
                  </div>

                  <span className="text-xs text-gray-400 w-6 text-center">{categoryIndex + 1}</span>

                  <button onClick={() => toggleExpand(category.id)} className="p-1 hover:bg-gray-100 rounded">
                    {expandedCategories[category.id] ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </button>

                  {category.image ? (
                    <img src={getImageUrl(category.image)} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                      <Image className="text-gray-400" size={16} />
                    </div>
                  )}

                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{category.name}</p>
                    <p className="text-sm text-gray-500">/{category.slug}</p>
                  </div>

                  <span className="text-sm text-gray-400 bg-gray-100 px-2 py-1 rounded">
                    {category.subcategories?.length || 0} подкатегорий
                  </span>

                  <div className="flex items-center gap-1">
                    <button onClick={() => startEditCategory(category)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Редактировать">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => handleDeleteCategory(category.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Удалить">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Level 2: Subcategories */}
                {expandedCategories[category.id] && (
                  <div className="ml-8 mt-4 space-y-2">
                    {category.subcategories?.map((sub, subIndex) => (
                      <div key={sub.id}>
                        <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {/* Order controls for subcategories */}
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => moveSubcategoryUp(category.id, category.subcategories, subIndex)}
                              disabled={subIndex === 0}
                              className={`p-0.5 rounded transition-colors ${subIndex === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                              title="Переместить вверх"
                            >
                              <ArrowUp size={12} />
                            </button>
                            <button
                              onClick={() => moveSubcategoryDown(category.id, category.subcategories, subIndex)}
                              disabled={subIndex >= (category.subcategories?.length || 0) - 1}
                              className={`p-0.5 rounded transition-colors ${subIndex >= (category.subcategories?.length || 0) - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-200 hover:text-gray-700'}`}
                              title="Переместить вниз"
                            >
                              <ArrowDown size={12} />
                            </button>
                          </div>

                          <span className="text-xs text-gray-400 w-5 text-center">{subIndex + 1}</span>

                          <button onClick={() => toggleExpandSubcategory(sub.id)} className="p-1 hover:bg-gray-200 rounded">
                            {expandedSubcategories[sub.id] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                          </button>

                          {sub.image ? (
                            <img src={getImageUrl(sub.image)} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded flex items-center justify-center">
                              <Image className="text-gray-400" size={12} />
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-medium text-gray-800">{sub.name}</p>
                            <p className="text-sm text-gray-500">/{sub.slug}</p>
                          </div>

                          {sub.children && sub.children.length > 0 && (
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded">
                              {sub.children.length} типов
                            </span>
                          )}

                          <div className="flex items-center gap-1">
                            <button onClick={() => startEditSubcategory(sub, category.id)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Редактировать">
                              <Edit2 size={16} />
                            </button>
                            <button onClick={() => handleDeleteSubcategory(sub.id)} className="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Удалить">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Level 3: Third level categories */}
                        {expandedSubcategories[sub.id] && (
                          <div className="ml-8 mt-2 space-y-1">
                            {sub.children?.map((child, childIndex) => (
                              <div key={child.id} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg">
                                <span className="text-xs text-gray-400 w-4 text-center">{childIndex + 1}</span>

                                {child.image ? (
                                  <img src={getImageUrl(child.image)} alt="" className="w-6 h-6 rounded object-cover" />
                                ) : (
                                  <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                                    <Image className="text-blue-400" size={10} />
                                  </div>
                                )}

                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-700">{child.name}</p>
                                  <p className="text-xs text-gray-500">/{child.slug}</p>
                                </div>

                                <div className="flex items-center gap-1">
                                  <button onClick={() => startEditThirdLevel(child, sub.id)} className="p-1.5 text-blue-600 hover:bg-blue-100 rounded" title="Редактировать">
                                    <Edit2 size={14} />
                                  </button>
                                  <button onClick={() => handleDeleteThirdLevel(child.id)} className="p-1.5 text-red-600 hover:bg-red-100 rounded" title="Удалить">
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                              </div>
                            ))}

                            {/* Add Third Level Button */}
                            <button
                              onClick={() => openAddThirdLevel(sub.id)}
                              className="w-full p-2 border-2 border-dashed border-blue-200 rounded-lg text-blue-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2 text-sm"
                            >
                              <Plus size={16} />
                              Добавить тип (3 уровень)
                            </button>
                          </div>
                        )}
                      </div>
                    ))}

                    {/* Add Subcategory Button */}
                    <button
                      onClick={() => openAddSubcategory(category.id)}
                      className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={18} />
                      Добавить подкатегорию (2 уровень)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info block */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">Структура каталога (3 уровня):</h3>
        <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
          <li><strong>1 уровень:</strong> Основные категории (Ультразвуковая диагностика, Эндоскопия, ...)</li>
          <li><strong>2 уровень:</strong> Подкатегории (УЗИ аппараты, УЗИ датчики, ...)</li>
          <li><strong>3 уровень:</strong> Типы/виды (Линейные, Конвексные, Секторные фазированные, ...)</li>
        </ul>
        <p className="text-sm text-blue-700 mt-2">
          <strong>Рекомендуемый размер изображений:</strong> 600×400px, формат JPG/PNG/WebP
        </p>
      </div>
    </div>
  );
};

export default AdminCategories;
